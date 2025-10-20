// pages/api/sekjur/periods.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'sekjur') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'GET') {
            const period = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' } });
            return res.status(200).json(period);
        }

        if (req.method === 'POST') {
            const { id, nama, start_date, end_date } = req.body;
            if (!id || !nama || !start_date || !end_date) {
                return res.status(400).json({ message: 'Semua field wajib diisi.' });
            }

            const existingPeriod = await prisma.academic_Period.findUnique({ where: { id } });
            if (existingPeriod) {
                return res.status(409).json({ message: 'ID Periode sudah ada. Harap gunakan ID unik.' });
            }

            const newPeriod = await prisma.academic_Period.create({
                data: { id, nama, start_date: new Date(start_date), end_date: new Date(end_date) },
            });
            return res.status(201).json(newPeriod);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Period Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}