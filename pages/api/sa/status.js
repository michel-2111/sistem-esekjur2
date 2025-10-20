// pages/api/sa/status.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { auth_token } = req.cookies;
        if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const { includeDetails } = req.query;

        const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' }});
        if (!activePeriod) return res.status(404).json({ message: "Periode akademik tidak ditemukan." });

        let queryOptions = {
            where: {
                mahasiswa_id: userId,
                period_id: activePeriod.id,
            },
        };

        if (includeDetails === 'true') {
            queryOptions.include = {
                application_courses: {
                    include: {
                        course: true,
                        dosen: {
                            select: { id: true, nama: true }
                        }
                    }
                }
            };
        }

        const application = await prisma.sA_Application.findFirst(queryOptions);

        if (!application) {
            return res.status(200).json({ status: 'belum_memulai' });
        }

        res.status(200).json(application);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}