// pages/api/master/dosen.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { auth_token } = req.cookies;
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);

        // Kaprodi hanya bisa menugaskan dosen dari jurusannya
        const kaprodiProdi = await prisma.prodi.findUnique({
            where: { id: decoded.prodiId },
            select: { jurusan_id: true }
        });

        if (!kaprodiProdi) {
            return res.status(404).json({ message: 'Program studi kaprodi tidak ditemukan.' });
        }

        const dosenList = await prisma.user.findMany({
            where: {
                jurusan_id: kaprodiProdi.jurusan_id,
                roles: {
                    some: {
                        role: {
                            nama_role: 'dosen',
                        },
                    },
                },
            },
            select: {
                id: true,
                nama: true,
            },
            orderBy: {
                nama: 'asc'
            }
        });

        res.status(200).json(dosenList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil daftar dosen.' });
    }
}