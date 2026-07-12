import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { id } = req.query;
    const requirementId = parseInt(id);

    if (isNaN(requirementId)) {
        return res.status(400).json({ error: 'ID tidak valid' });
    }

    if (req.method === 'PUT') {
        try {
        const { nama, deskripsi, is_active } = req.body;

        const updatedRequirement = await prisma.tA_Document_Requirement.update({
            where: { id: requirementId },
            data: {
            nama,
            deskripsi,
            is_active,
            },
        });

        return res.status(200).json(updatedRequirement);
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal memperbarui data' });
        }
    }

    if (req.method === 'DELETE') {
        try {
        const existingSubmissions = await prisma.tA_Document_Submission.findFirst({
            where: { requirement_id: requirementId }
        });

        if (existingSubmissions) {
            await prisma.tA_Document_Requirement.update({
            where: { id: requirementId },
            data: { is_active: false }
            });
            return res.status(200).json({ 
            message: 'Syarat dinonaktifkan karena sudah memiliki data file dari mahasiswa.' 
            });
        }

        await prisma.tA_Document_Requirement.delete({
            where: { id: requirementId },
        });

        return res.status(200).json({ message: 'Persyaratan berhasil dihapus permanen' });
        } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Gagal menghapus data' });
        }
    }

    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}