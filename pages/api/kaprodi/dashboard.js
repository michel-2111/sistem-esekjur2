// pages/api/kaprodi/dashboard.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'kaprodi' || !decoded.prodiId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' }});
        if (!activePeriod) {
            return res.status(200).json({ waitingAssignment: 0, documentCount: 0 });
        }

        const [waitingAssignment, documentCount, prodi] = await Promise.all([
            // Hitung pengajuan yang menunggu penugasan di prodi kaprodi
            prisma.sA_Application.count({
                where: {
                    status: 'menunggu_penugasan_dosen',
                    period_id: activePeriod.id,
                    mahasiswa: { prodi_id: decoded.prodiId }
                }
            }),
            // Hitung total dokumen yang diterima
            prisma.document_Recipient.count({
                where: { user_id: decoded.id }
            }),
            // Ambil nama prodi
            prisma.prodi.findUnique({
                where: { id: decoded.prodiId },
                select: { nama: true }
            })
        ]);

        res.status(200).json({ waitingAssignment, documentCount, prodi });

    } catch (error) {
        console.error("API Kaprodi Dashboard Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}