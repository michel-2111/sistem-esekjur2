// pages/api/sekjur/dashboard.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'sekjur' || !decoded.jurusanId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' } });
        if (!activePeriod) {
            return res.status(200).json({ waitingVerification: 0, waitingRecap: 0, jurusan: null });
        }

        const [waitingVerification, waitingRecap, jurusan] = await Promise.all([
            prisma.sA_Application.count({
                where: {
                    status: 'menunggu_verifikasi_pembayaran',
                    period_id: activePeriod.id,
                    mahasiswa: { prodi: { jurusan_id: decoded.jurusanId } }
                }
            }),
            prisma.sA_Application.count({
                where: {
                    status: 'telah_dinilai',
                    period_id: activePeriod.id,
                    mahasiswa: { prodi: { jurusan_id: decoded.jurusanId } }
                }
            }),
            prisma.jurusan.findUnique({
                where: { id: decoded.jurusanId },
                select: { nama: true }
            })
        ]);

        res.status(200).json({ waitingVerification, waitingRecap, jurusan });

    } catch (error) {
        console.error("API Sekjur Dashboard Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}