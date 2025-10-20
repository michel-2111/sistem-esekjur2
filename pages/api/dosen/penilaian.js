// pages/api/dosen/penilaian.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'dosen') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const dosenId = decoded.id;

        // --- GET: Mengambil data kelas dan mahasiswa untuk dinilai ---
        if (req.method === 'GET') {
            const applicationCourses = await prisma.application_Course.findMany({
                where: {
                    dosen_id: dosenId,
                    application: { status: { in: ['aktif', 'telah_dinilai'] } }
                },
                include: {
                    course: { select: { id: true, nama: true } },
                    application: {
                        select: { id: true, mahasiswa: { select: { id: true, nama: true } } }
                    }
                }
            });

            // Mengelompokkan data per mata kuliah
            const classes = applicationCourses.reduce((acc, ac) => {
                const { course, application, nilai, kelas_selesai } = ac; // Ambil kelas_selesai
                if (!acc[course.id]) {
                    // Sertakan kelas_selesai di objek kelas utama
                    acc[course.id] = { course_id: course.id, nama: course.nama, kelas_selesai: kelas_selesai, students: [] };
                }
                acc[course.id].students.push({
                    mahasiswa_id: application.mahasiswa.id,
                    nama: application.mahasiswa.nama,
                    application_id: application.id,
                    nilai: nilai,
                });
                return acc;
            }, {});

            return res.status(200).json(Object.values(classes));
        }

        // --- POST: Menyimpan nilai ---
        if (req.method === 'POST') {
            const { applicationId, courseId, nilai } = req.body;

            // Transaksi untuk update nilai dan cek status
            await prisma.$transaction(async (tx) => {
                // 1. Update nilai di Application_Course
                await tx.application_Course.update({
                    where: {
                        application_id_course_id: {
                            application_id: Number(applicationId),
                            course_id: Number(courseId),
                        },
                    },
                    data: { nilai },
                });

                // 2. Cek apakah semua MK dalam aplikasi ini sudah dinilai
                const coursesInApplication = await tx.application_Course.findMany({
                    where: { application_id: Number(applicationId) },
                });

                const allGraded = coursesInApplication.every(c => c.nilai !== null);

                // 3. Jika semua sudah dinilai, update status SA_Application
                if (allGraded) {
                    await tx.sA_Application.update({
                        where: { id: Number(applicationId) },
                        data: { status: 'telah_dinilai' },
                    });
                }
            });
            
            return res.status(200).json({ message: 'Nilai berhasil disimpan.' });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}