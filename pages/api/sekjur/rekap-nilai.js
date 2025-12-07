// pages/api/sekjur/rekap-nilai.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        if (decoded.selectedRole !== 'sekjur' || !decoded.jurusan_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'GET') {
            const applications = await prisma.sA_Application.findMany({
                where: {
                    status: 'telah_dinilai',
                    mahasiswa: {
                        prodi: { 
                            jurusan_id: decoded.jurusan_id 
                        }
                    }
                },
                include: {
                    mahasiswa: { select: { nama: true, identifier: true } },
                    application_courses: {
                        include: { course: { select: { nama: true, id: true } } }
                    }
                },
                orderBy: { mahasiswa: { nama: 'asc' } }
            });
            return res.status(200).json(applications);
        }

        if (req.method === 'POST') {
            const { applicationIds } = req.body;
            if (!applicationIds || applicationIds.length === 0) {
                return res.status(400).json({ message: 'Tidak ada aplikasi yang dipilih untuk difinalisasi.' });
            }

            await prisma.sA_Application.updateMany({
                where: {
                    id: { in: applicationIds },
                    mahasiswa: {
                        prodi: { 
                            jurusan_id: decoded.jurusan_id 
                        }
                    }
                },
                data: { status: 'selesai' }
            });

            return res.status(200).json({ message: 'Semua nilai berhasil difinalisasi.' });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}