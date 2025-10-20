// pages/api/master/jurusan.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const jurusan = await prisma.jurusan.findMany({
            include: {
                prodi: true,
            },
        });
        res.status(200).json(jurusan);
    } catch (error) {
        console.error("Fetch Jurusan Error:", error);
        res.status(500).json({ message: "Gagal mengambil data jurusan" });
    }
}