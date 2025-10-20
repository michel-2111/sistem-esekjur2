// pages/api/sekjur/akademik.js
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
        const { jurusan_id: jurusanId } = decoded;

        if (req.method === 'GET') {
            const [prodiList, courseList, dosenList] = await Promise.all([
                prisma.prodi.findMany({ where: { jurusan_id: jurusanId }, orderBy: { nama: 'asc' } }),
                prisma.course.findMany({ where: { prodi: { jurusan_id: jurusanId } }, include: { pengampu: { select: { dosen_id: true } } }, orderBy: { semester: 'asc' } }),
                prisma.user.findMany({ where: { jurusan_id: jurusanId, roles: { some: { role: { nama_role: 'dosen' } } } }, select: { id: true, nama: true }, orderBy: { nama: 'asc' } })
            ]);
            return res.status(200).json({ prodiList, courseList, dosenList });
        }
        
        if (req.method === 'POST') {
            const { action, payload } = req.body;
            switch (action) {
                case 'CREATE_PRODI': { 
                    let generatedId = `${jurusanId}_${payload.nama.replace(/\s+/g, '_').toUpperCase()}`;
                    if (generatedId.length > 20) {
                        generatedId = generatedId.substring(0, 20); 
                    }

                    const newProdi = await prisma.prodi.create({ 
                        data: { 
                            id: generatedId,
                            nama: payload.nama, 
                            jurusan_id: jurusanId 
                        } 
                    });
                    return res.status(201).json(newProdi);
                }
            
                case 'CREATE_COURSE': {
                    const { pengampuIds, ...courseData } = payload;
                    const newCourse = await prisma.course.create({ 
                        data: {
                            ...courseData, 
                            pengampu: { create: pengampuIds.map(id => ({ dosen_id: id })) }
                        },
                        include: { pengampu: { select: { dosen_id: true } } }
                    });
                    return res.status(201).json(newCourse);
                }

                case 'UPDATE_COURSE': {
                    const { id: courseId, pengampuIds, ...courseData } = payload;
                    const updatedCourse = await prisma.$transaction(async (tx) => {
                        await tx.course_Pengampu.deleteMany({ where: { course_id: courseId } });
                        return tx.course.update({
                            where: { id: courseId },
                            data: { ...courseData, pengampu: { create: pengampuIds.map(id => ({ dosen_id: id })) } },
                            include: { pengampu: { select: { dosen_id: true } } }
                        });
                    });
                    return res.status(200).json(updatedCourse);
                }

                case 'DELETE_PRODI': {
                    await prisma.prodi.delete({ where: { id: payload.id }});
                    return res.status(200).json({ message: 'Prodi berhasil dihapus.' });
                }
                
                case 'DELETE_COURSE': {
                    await prisma.course.delete({ where: { id: payload.id }});
                    return res.status(200).json({ message: 'Mata kuliah berhasil dihapus.' });
                }
                
                default:
                    return res.status(400).json({ message: 'Aksi tidak dikenal.' });
            }
        }

        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}