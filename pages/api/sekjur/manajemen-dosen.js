// pages/api/sekjur/manajemen-dosen.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { auth_token } = req.cookies;
    if (!auth_token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        if (decoded.selectedRole !== 'sekjur') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        
        const jurusanId = decoded.jurusan_id || decoded.jurusanId;
        if (!jurusanId) {
            return res.status(403).json({ message: 'No department ID found' });
        }

        const { periodId } = req.query;

        const academicPeriods = await prisma.academic_Period.findMany({
            orderBy: { start_date: 'desc' }
        });

        let targetPeriod;
        if (periodId && periodId !== 'latest') {
            targetPeriod = academicPeriods.find(p => p.id === periodId);
            if (!targetPeriod) {
                return res.status(404).json({ message: 'Period not found' });
            }
        } else {
            targetPeriod = academicPeriods[0];
        }

        if (!targetPeriod) {
            return res.status(200).json({ 
                lecturers: [], 
                saCourses: [], 
                academicPeriods: [] 
            });
        }

        const lecturers = await prisma.user.findMany({
            where: {
                jurusan_id: jurusanId,
                roles: { 
                    some: { 
                        role: { nama_role: 'dosen' } 
                    } 
                }
            },
            include: {
                jurusan: { select: { nama: true } },
                prodi: { select: { nama: true } },
                roles: { include: { role: true } }
            },
            orderBy: { nama: 'asc' }
        });

        const saCourses = await prisma.application_Course.findMany({
            where: {
                dosen_id: { in: lecturers.map(l => l.id) },
                application: { period_id: targetPeriod.id }
            },
            include: {
                course: { 
                    select: { 
                        id: true,
                        kode: true,
                        nama: true,
                        sks: true,
                        semester: true
                    } 
                }
            }
        });

        res.status(200).json({ 
            lecturers, 
            saCourses, 
            academicPeriods 
        });

    } catch (error) {
        console.error("API Error:", error);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }
        
        res.status(500).json({ message: 'Internal Server Error' });
    }
}