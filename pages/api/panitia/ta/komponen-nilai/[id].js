import prisma from '../../../../../lib/prisma';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    const { id } = req.query;
    const componentId = parseInt(id);

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (!decoded.roles.includes('panitia') && decoded.selectedRole !== 'panitia') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'PUT') {
            const { nama, bobot, is_active } = req.body;

            const updatedComponent = await prisma.tA_Assessment_Component.update({
                where: { id: componentId },
                data: {
                    nama,
                    bobot: parseFloat(bobot),
                    is_active,
                },
            });

            return res.status(200).json(updatedComponent);
        }

        if (req.method === 'DELETE') {
            const existingGrades = await prisma.tA_Grade.findFirst({
                where: { component_id: componentId }
            });

            if (existingGrades) {
                await prisma.tA_Assessment_Component.update({
                    where: { id: componentId },
                    data: { is_active: false }
                });
                return res.status(200).json({ message: 'Komponen dinonaktifkan karena sudah memiliki data nilai mahasiswa.' });
            }

            await prisma.tA_Assessment_Component.delete({
                where: { id: componentId },
            });

            return res.status(200).json({ message: 'Komponen berhasil dihapus permanen.' });
        }

        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}