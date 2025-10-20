// pages/api/mahasiswa/dashboard.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' } });
        if (!activePeriod) return res.status(404).json({ message: 'Periode akademik tidak ditemukan.' });

        const [saApplication, leaveApplication, userDetails] = await Promise.all([
            prisma.sA_Application.findFirst({
                where: { mahasiswa_id: userId, period_id: activePeriod.id }
            }),
            prisma.leave_Application.findFirst({
                where: { mahasiswa_id: userId }, // Bisa jadi cuti dari periode sebelumnya yang masih aktif
                orderBy: { tanggal_pengajuan: 'desc' }
            }),
            prisma.user.findUnique({
                where: { id: userId },
                include: { prodi: { include: { jurusan: true } } }
            })
        ]);

        res.status(200).json({ activePeriod, saApplication, leaveApplication, userDetails });

    } catch (error) {
        console.error("API Mahasiswa Dashboard Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}