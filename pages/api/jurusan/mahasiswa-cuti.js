// pages/api/jurusan/mahasiswa-cuti.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const allowedRoles = ['sekjur', 'kajur'];
        
        if (!allowedRoles.includes(decoded.selectedRole) || !decoded.jurusan_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const approvedLeaveApps = await prisma.leave_Application.findMany({
            where: {
                status: 'disetujui',
                mahasiswa: {
                    prodi: {
                        jurusan_id: decoded.jurusan_id,
                    },
                },
            },
            include: {
                mahasiswa: {
                    select: {
                        nama: true,
                        identifier: true,
                        prodi: { select: { nama: true } },
                    },
                },
            },
            orderBy: {
                tanggal_pengajuan: 'desc',
            },
        });

        res.status(200).json(approvedLeaveApps);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}