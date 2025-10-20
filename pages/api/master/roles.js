// pages/api/master/roles.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const roles = await prisma.role.findMany({
            orderBy: {
                id: 'asc',
            }
        });
        res.status(200).json(roles);
    } catch (error) {
        console.error("Fetch Roles Error:", error);
        res.status(500).json({ message: "Gagal mengambil data peran" });
    }
}