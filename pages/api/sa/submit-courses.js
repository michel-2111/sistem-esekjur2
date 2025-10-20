// pages/api/sa/submit-courses.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { auth_token } = req.cookies;
        jwt.verify(auth_token, process.env.JWT_SECRET);

        const { applicationId, selectedCourseIds } = req.body;

        if (!applicationId || !selectedCourseIds || selectedCourseIds.length === 0) {
            return res.status(400).json({ message: 'Data tidak lengkap.' });
        }

        // Siapkan data untuk tabel pivot Application_Courses
        const applicationCoursesData = selectedCourseIds.map(courseId => ({
            application_id: applicationId,
            course_id: courseId,
        }));

        // Gunakan transaksi untuk memastikan kedua operasi berhasil
        const transaction = await prisma.$transaction([
            // 1. Isi tabel pivot
            prisma.application_Course.createMany({
                data: applicationCoursesData,
            }),
            // 2. Update status pengajuan utama
            prisma.sA_Application.update({
                where: { id: applicationId },
                data: {
                    status: 'menunggu_penugasan_dosen',
                    tanggal_pengajuan: new Date(),
                },
            }),
        ]);
        
        // Kirim kembali status pengajuan yang sudah diupdate
        res.status(200).json(transaction[1]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengirimkan pengajuan MK.' });
    }
}