// pages/api/sekjur/manajemen-dosen.js
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
        if (decoded.selectedRole !== 'sekjur' || !decoded.jurusanId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' } });
        if (!activePeriod) {
            return res.status(200).json({ lecturers: [], saCourses: [] });
        }

        // --- Kueri yang Diperbarui ---
        const lecturers = await prisma.user.findMany({
            where: {
                jurusan_id: decoded.jurusanId,
                roles: { some: { role: { nama_role: 'dosen' } } }
            },
            // Mengganti 'select' dengan 'include' untuk mengambil data relasi
            include: {
                jurusan: { select: { nama: true } },
                prodi: { select: { nama: true } }, // Untuk Kaprodi yang punya prodi
                roles: { include: { role: true } } // Untuk mengecek peran di modal
            },
            orderBy: { nama: 'asc' }
        });

        const saCourses = await prisma.application_Course.findMany({
            where: {
                dosen_id: { in: lecturers.map(l => l.id) },
                application: { period_id: activePeriod.id }
            },
            include: {
                course: { select: { sks: true } }
            }
        });

        res.status(200).json({ lecturers, saCourses });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}