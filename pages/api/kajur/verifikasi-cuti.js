// pages/api/kajur/verifikasi-cuti.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'kajur' || !decoded.jurusanId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'GET') {
            const applications = await prisma.leave_Application.findMany({
                where: {
                    status: 'menunggu_kajur',
                    mahasiswa: {
                        prodi: { jurusan_id: decoded.jurusanId }
                    }
                },
                include: {
                    mahasiswa: { select: { nama: true, prodi: { select: { nama: true } } } }
                },
                orderBy: { tanggal_pengajuan: 'asc' }
            });
            return res.status(200).json(applications);
        }

        if (req.method === 'POST') {
            const { applicationId, action, alasanDitolak } = req.body;
            
            let dataToUpdate = {};
            if (action === 'approve') {
                dataToUpdate = { status: 'menunggu_wadir', alasan_ditolak: null };
            } else if (action === 'reject') {
                if (!alasanDitolak) return res.status(400).json({ message: 'Alasan penolakan harus diisi.' });
                dataToUpdate = { status: 'ditolak', alasan_ditolak: alasanDitolak };
            } else {
                return res.status(400).json({ message: 'Aksi tidak valid.' });
            }

            const updatedApp = await prisma.leave_Application.update({
                where: { id: Number(applicationId) },
                data: dataToUpdate,
            });
            return res.status(200).json(updatedApp);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}