import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (!decoded.roles.includes('mahasiswa') && decoded.selectedRole !== 'mahasiswa') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const mahasiswaId = decoded.id;

        if (req.method === 'GET') {
            const supervisors = await prisma.tA_Supervisor.findMany({
                where: { 
                    mahasiswa_id: mahasiswaId,
                    status_kajur: 'disetujui' 
                },
                include: {
                    dosen: { select: { id: true, nama: true } },
                    logbooks: {
                        include: {
                            supervisor: {
                                include: { dosen: { select: { nama: true } } }
                            }
                        }
                    }
                }
            });

            let allLogbooks = [];
            supervisors.forEach(spv => {
                allLogbooks = [...allLogbooks, ...spv.logbooks];
            });

            allLogbooks.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

            return res.status(200).json({
                supervisors: supervisors.map(s => ({ id: s.id, nama: s.dosen.nama, peran: s.peran, is_ready: s.is_ready_for_exam })),
                allLogbooks: allLogbooks
            });
        }

        if (req.method === 'POST') {
            const { supervisor_id, tanggal, topik } = req.body;

            if (!supervisor_id || !tanggal || !topik) {
                return res.status(400).json({ message: 'Semua field wajib diisi.' });
            }

            const checkSpv = await prisma.tA_Supervisor.findFirst({
                where: { id: Number(supervisor_id), mahasiswa_id: mahasiswaId }
            });

            if (!checkSpv) return res.status(403).json({ message: 'Akses ditolak.' });

            await prisma.tA_Logbook.create({
                data: {
                    supervisor_id: Number(supervisor_id),
                    tanggal: new Date(tanggal),
                    topik: topik,
                    status: 'menunggu_verifikasi'
                }
            });

            return res.status(201).json({ message: 'Logbook berhasil ditambahkan.' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;

            const logbook = await prisma.tA_Logbook.findUnique({
                where: { id: Number(id) },
                include: { supervisor: true }
            });

            if (!logbook) return res.status(404).json({ message: 'Data tidak ditemukan.' });
            if (logbook.supervisor.mahasiswa_id !== mahasiswaId) return res.status(403).json({ message: 'Akses ditolak.' });
            if (logbook.status === 'terverifikasi') return res.status(400).json({ message: 'Tidak dapat menghapus logbook yang sudah diverifikasi.' });

            await prisma.tA_Logbook.delete({ where: { id: Number(id) } });

            return res.status(200).json({ message: 'Logbook berhasil dihapus.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}