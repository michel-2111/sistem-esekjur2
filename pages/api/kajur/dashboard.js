// pages/api/kajur/dashboard.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'kajur' || !decoded.jurusanId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const [leaveApplicationsCount, documentCount, jurusan] = await Promise.all([
            prisma.leave_Application.count({
                where: {
                    status: 'menunggu_kajur',
                    mahasiswa: {
                        prodi: {
                            jurusan_id: decoded.jurusanId,
                        },
                    },
                },
            }),
            prisma.document_Recipient.count({
                where: {
                    user_id: decoded.id,
                },
            }),
            prisma.jurusan.findUnique({
                where: { id: decoded.jurusanId },
                select: { nama: true },
            }),
        ]);

        res.status(200).json({ leaveApplicationsCount, documentCount, jurusan });

    } catch (error) {
        console.error("API Kajur Dashboard Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}