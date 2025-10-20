// pages/api/wadir/dashboard.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'wadir') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const [leaveApplicationsCount, documentCount] = await Promise.all([
            // Hitung pengajuan cuti yang menunggu persetujuan Wadir
            prisma.leave_Application.count({
                where: {
                    status: 'menunggu_wadir',
                },
            }),
            // Hitung total dokumen yang diterima oleh Wadir
            prisma.document_Recipient.count({
                where: {
                    user_id: decoded.id,
                },
            }),
        ]);

        res.status(200).json({ leaveApplicationsCount, documentCount });

    } catch (error) {
        console.error("API Wadir Dashboard Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}