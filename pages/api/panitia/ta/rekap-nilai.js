import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (!decoded.roles.includes('panitia') && decoded.selectedRole !== 'panitia') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const jurusanId = decoded.jurusan_id || decoded.jurusanId;

        if (req.method === 'GET') {
            const rekap = await prisma.tA_Application.findMany({
                where: {
                    mahasiswa: { jurusan_id: jurusanId },
                    exam_date: { not: null }
                },
                include: {
                    mahasiswa: {
                        select: { nama: true, identifier: true, prodi: { select: { nama: true } } }
                    },
                    examiners: {
                        include: {
                            dosen: { select: { nama: true } }
                        }
                    }
                },
                orderBy: { exam_date: 'desc' }
            });

            return res.status(200).json(rekap);
        }

        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}