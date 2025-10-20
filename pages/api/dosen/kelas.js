// pages/api/dosen/kelas.js
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

        if (req.method === 'GET') {
            const applicationCourses = await prisma.application_Course.findMany({
                where: {
                    dosen_id: dosenId,
                    application: { status: 'aktif' }
                },
                include: {
                    course: true,
                    application: {
                        include: { mahasiswa: { select: { id: true, nama: true } } }
                    }
                }
            });
            
            const classes = applicationCourses.reduce((acc, ac) => {
                const { course } = ac;
                if (!acc[course.id]) {
                    acc[course.id] = {
                        course_id: course.id,
                        nama: course.nama,
                        sks: course.sks,
                        jadwal: ac.jadwal,
                        ruang: ac.ruang,
                        materi_url: ac.materi_url,
                        kelas_selesai: ac.kelas_selesai,
                        students: [],
                    };
                }
                acc[course.id].students.push(ac.application.mahasiswa);
                return acc;
            }, {});

            return res.status(200).json(Object.values(classes));
        }

        if (req.method === 'POST') {
            const { courseId, jadwal, ruang, materi_url } = req.body;

            await prisma.application_Course.updateMany({
                where: {
                    dosen_id: dosenId,
                    course_id: courseId,
                    application: { status: 'aktif' }
                },
                data: {
                    jadwal,
                    ruang,
                    materi_url
                }
            });

            return res.status(200).json({ message: 'Detail kelas berhasil diperbarui.' });
        }
        
        if (req.method === 'PUT') {
            const { courseId, status } = req.body;

            await prisma.application_Course.updateMany({
                where: {
                    dosen_id: dosenId,
                    course_id: courseId,
                },
                data: {
                    kelas_selesai: status,
                }
            });
            
            return res.status(200).json({ message: 'Status kelas berhasil diperbarui.' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}