import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
        const requirements = await prisma.tA_Document_Requirement.findMany({
            orderBy: { id: 'asc' },
        });
        return res.status(200).json(requirements);
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal mengambil data persyaratan' });
        }
    }

    if (req.method === 'POST') {
        try {
        const { jurusan_id, nama, deskripsi } = req.body;

        if (!jurusan_id || !nama) {
            return res.status(400).json({ error: 'Jurusan ID dan Nama wajib diisi' });
        }

        const newRequirement = await prisma.tA_Document_Requirement.create({
            data: {
            jurusan_id,
            nama,
            deskripsi,
            is_active: true,
            },
        });

        return res.status(201).json(newRequirement);
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal membuat persyaratan baru' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}