import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (!decoded.roles.includes('dosen') && decoded.selectedRole !== 'dosen') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const dosenId = decoded.id;

        if (req.method === 'GET') {
            const bimbinganSaya = await prisma.tA_Supervisor.findMany({
                where: { 
                    dosen_id: dosenId,
                    status_kajur: 'disetujui' 
                },
                include: {
                    mahasiswa: { select: { id: true, nama: true, identifier: true } },
                    logbooks: { orderBy: { tanggal: 'desc' } }
                }
            });

            const mhsIds = bimbinganSaya.map(b => b.mahasiswa_id);
            const allVerifiedLogbooks = await prisma.tA_Logbook.groupBy({
                by: ['supervisor_id'],
                where: { 
                    status: 'terverifikasi',
                    supervisor: { mahasiswa_id: { in: mhsIds } }
                },
                _count: { id: true }
            });

            const totalPerMhs = await prisma.tA_Supervisor.findMany({
                where: { mahasiswa_id: { in: mhsIds } },
                select: {
                    mahasiswa_id: true,
                    _count: {
                        select: { logbooks: { where: { status: 'terverifikasi' } } }
                    }
                }
            });

            const dataFormatted = bimbinganSaya.map(b => {
                const totalBimbinganKumulatif = totalPerMhs
                    .filter(t => t.mahasiswa_id === b.mahasiswa_id)
                    .reduce((sum, current) => sum + current._count.logbooks, 0);

                return {
                    supervisor_id: b.id,
                    peran: b.peran,
                    is_ready_for_exam: b.is_ready_for_exam,
                    mahasiswa: b.mahasiswa,
                    logbooks: b.logbooks,
                    total_kumulatif: totalBimbinganKumulatif
                };
            });

            return res.status(200).json(dataFormatted);
        }

        if (req.method === 'PUT') {
            const { action } = req.body;

            if (action === 'verify_logbook') {
                const { logbook_id, catatan_dosen } = req.body;
                
                const log = await prisma.tA_Logbook.findUnique({
                    where: { id: Number(logbook_id) },
                    include: { supervisor: true }
                });

                if (!log || log.supervisor.dosen_id !== dosenId) {
                    return res.status(403).json({ message: 'Akses ditolak.' });
                }

                await prisma.tA_Logbook.update({
                    where: { id: Number(logbook_id) },
                    data: {
                        status: 'terverifikasi',
                        catatan_dosen: catatan_dosen || null
                    }
                });

                return res.status(200).json({ message: 'Catatan bimbingan diverifikasi.' });
            }

            if (action === 'approve_exam') {
                const { supervisor_id, is_ready } = req.body;

                const spv = await prisma.tA_Supervisor.findUnique({ where: { id: Number(supervisor_id) } });
                if (!spv || spv.dosen_id !== dosenId) return res.status(403).json({ message: 'Akses ditolak.' });

                await prisma.tA_Supervisor.update({
                    where: { id: Number(supervisor_id) },
                    data: { is_ready_for_exam: is_ready }
                });

                return res.status(200).json({ message: is_ready ? 'Mahasiswa disetujui untuk Sidang Akhir.' : 'Persetujuan Sidang Akhir dibatalkan.' });
            }

            return res.status(400).json({ message: 'Action tidak valid.' });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}