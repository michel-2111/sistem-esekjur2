// pages/api/kaprodi/penugasan.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'kaprodi' || !decoded.prodiId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'GET') {
            // ... (Logika GET tetap sama, tidak perlu diubah)
            const kaprodiProdiId = decoded.prodiId;
            const studentsInProdi = await prisma.user.findMany({ where: { prodi_id: kaprodiProdiId }, select: { id: true } });
            const studentIds = studentsInProdi.map(student => student.id);
            const applications = await prisma.sA_Application.findMany({
                where: { status: 'menunggu_penugasan_dosen', mahasiswa_id: { in: studentIds } },
                include: {
                    mahasiswa: { select: { nama: true } },
                    application_courses: { include: { course: { select: { id: true, nama: true, sks: true } } } },
                },
            });
            return res.status(200).json(applications);
        }

        // --- POST: Menyimpan hasil penugasan (LOGIKA VALIDASI DIPERBAIKI) ---
        if (req.method === 'POST') {
            const { applicationId, assignments } = req.body;

            // 1. Ambil semua mata kuliah yang seharusnya ada dalam pengajuan
            const requiredCourses = await prisma.application_Course.findMany({
                where: { application_id: Number(applicationId) },
                select: { course_id: true }
            });

            // 2. Validasi baru yang lebih andal
            const allCoursesAssigned = requiredCourses.every(
                (rc) => assignments[rc.course_id] && assignments[rc.course_id] !== ''
            );

            if (!allCoursesAssigned) {
                return res.status(400).json({ message: 'Harap tugaskan dosen untuk semua mata kuliah.' });
            }

            // 3. Lanjutkan proses update jika validasi berhasil
            const updatePromises = Object.entries(assignments).map(([courseId, dosenId]) => 
                prisma.application_Course.update({
                    where: {
                        application_id_course_id: {
                            application_id: Number(applicationId),
                            course_id: Number(courseId),
                        },
                    },
                    data: { dosen_id: Number(dosenId) },
                })
            );

            await prisma.$transaction([
                ...updatePromises,
                prisma.sA_Application.update({
                    where: { id: Number(applicationId) },
                    data: { status: 'aktif' },
                }),
            ]);
            
            return res.status(200).json({ message: 'Penugasan berhasil disimpan.' });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}