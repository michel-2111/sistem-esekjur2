import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const prodi = await prisma.prodi.findMany({
            select: { id: true, nama: true }
        });
        return res.status(200).json(prodi);
    }
    res.status(405).end();
}