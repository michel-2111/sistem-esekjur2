// pages/api/users/[id].js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            include: {
                prodi: {
                    select: {
                        nama: true,
                        jurusan: {
                            select: { nama: true }
                        }
                    }
                },
                jurusan: {
                    select: { nama: true }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Hapus password dari objek sebelum dikirim
        delete user.password;
        res.status(200).json(user);

    } catch (error) {
        console.error("Fetch User Detail Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}