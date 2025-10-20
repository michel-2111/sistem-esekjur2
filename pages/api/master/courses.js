// pages/api/master/courses.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { auth_token } = req.cookies;
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        if (!decoded.prodiId) {
            return res.status(400).json({ message: 'User does not have a Prodi ID.' });
        }

        const courses = await prisma.course.findMany({
            where: {
                prodi_id: decoded.prodiId,
            },
            orderBy: {
                semester: 'asc',
            },
        });

        // Mengelompokkan mata kuliah berdasarkan semester
        const groupedCourses = courses.reduce((acc, course) => {
            const semester = course.semester;
            if (!acc[semester]) {
                acc[semester] = [];
            }
            acc[semester].push(course);
            return acc;
        }, {});

        res.status(200).json(groupedCourses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch courses.' });
    }
}