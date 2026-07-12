import prisma from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const jurusanId = decoded.jurusan_id || decoded.jurusanId;

        if (!decoded.roles.includes('panitia') && decoded.selectedRole !== 'panitia') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'GET') {
            const components = await prisma.tA_Assessment_Component.findMany({
                where: { jurusan_id: jurusanId },
                orderBy: { id: 'asc' },
            });
            return res.status(200).json(components);
        }

        if (req.method === 'POST') {
            const { nama, bobot, is_active } = req.body;

            if (!nama || bobot === undefined) {
                return res.status(400).json({ message: 'Nama dan Bobot wajib diisi.' });
            }

            const newComponent = await prisma.tA_Assessment_Component.create({
                data: {
                    jurusan_id: jurusanId,
                    nama,
                    bobot: parseFloat(bobot),
                    is_active: is_active ?? true,
                },
            });

            return res.status(201).json(newComponent);
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}