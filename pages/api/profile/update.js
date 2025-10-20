import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'PUT') {
        return res.status(405).end();
    }

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const { nama, telepon, nomor_rekening } = req.body;

        const dataToUpdate = {};
        if (nama) dataToUpdate.nama = nama;
        if (telepon) dataToUpdate.telepon = telepon;

        if (nomor_rekening && !decoded.roles.includes('mahasiswa')) {
            dataToUpdate.nomor_rekening = nomor_rekening;
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
        });

        delete updatedUser.password;

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}