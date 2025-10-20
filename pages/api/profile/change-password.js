import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Semua field password wajib diisi.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Password baru dan konfirmasi tidak cocok.' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password lama salah.' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ message: 'Password berhasil diubah.' });

    } catch (error) {
        console.error("Change Password Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}