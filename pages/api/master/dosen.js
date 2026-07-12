// pages/api/master/dosen.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        const { courseId } = req.query;

        if (courseId && courseId !== 'undefined') {
            const pengampuList = await prisma.course_Pengampu.findMany({
                where: { 
                    course_id: Number(courseId) 
                },
                include: {
                    dosen: {
                        select: { id: true, nama: true, identifier: true }
                    }
                }
            });

            const dosenList = pengampuList.map(p => p.dosen);
            
            return res.status(200).json(dosenList);
        }

        const prodiId = decoded.prodi_id;
        if (!prodiId) {
            return res.status(400).json({ message: 'User does not have a Prodi ID.' });
        }

        const kaprodiProdi = await prisma.prodi.findUnique({
            where: { id: prodiId },
            select: { jurusan_id: true }
        });

        if (!kaprodiProdi) {
            return res.status(404).json({ message: 'Program studi kaprodi tidak ditemukan.' });
        }

        const allDosenJurusan = await prisma.user.findMany({
            where: {
                jurusan_id: kaprodiProdi.jurusan_id,
                roles: { some: { role: { nama_role: 'dosen' } } },
            },
            select: { id: true, nama: true, identifier: true },
            orderBy: { nama: 'asc' }
        });

        res.status(200).json(allDosenJurusan);

    } catch (error) {
        console.error("API Error (get dosen):", error);
        res.status(500).json({ message: 'Gagal mengambil daftar dosen.' });
    }
}