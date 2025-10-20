// pages/api/dosen/dashboard.js
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
        if (decoded.selectedRole !== 'dosen') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' } });
        if (!activePeriod) {
            return res.status(200).json({ stats: { courseCount: 0, studentCount: 0, sksCount: 0 }, upcomingClasses: [] });
        }

        const coursesTaught = await prisma.application_Course.findMany({
            where: {
                dosen_id: decoded.id,
                application: {
                    period_id: activePeriod.id,
                    status: { in: ['aktif', 'telah_dinilai'] }
                }
            },
            include: {
                course: { select: { id: true, nama: true, sks: true } },
                application: { select: { mahasiswa_id: true } }
            }
        });

        // --- Logika untuk Statistik ---
        const uniqueStudentIds = new Set(coursesTaught.map(c => c.application.mahasiswa_id));
        const courseSksMap = new Map();
        coursesTaught.forEach(c => {
            if (!courseSksMap.has(c.course.id)) {
                courseSksMap.set(c.course.id, c.course.sks);
            }
        });
        const sksCount = Array.from(courseSksMap.values()).reduce((sum, sks) => sum + sks, 0);

        // --- Logika BARU untuk Jadwal Mendatang ---
        const upcomingClasses = Array.from(courseSksMap.keys()).map(courseId => {
            const relevantCourse = coursesTaught.find(c => c.course_id === courseId);
            return {
                id: relevantCourse.course.id,
                nama: relevantCourse.course.nama,
                jadwal: relevantCourse.jadwal,
                ruang: relevantCourse.ruang
            };
        }).filter(c => c.jadwal); // Hanya tampilkan yang sudah punya jadwal

        res.status(200).json({
            stats: {
                courseCount: courseSksMap.size,
                studentCount: uniqueStudentIds.size,
                sksCount: sksCount,
            },
            upcomingClasses,
        });

    } catch (error) {
        console.error("API Dosen Dashboard Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}