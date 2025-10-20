// pages/api/auth/switch-role.js
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { auth_token } = req.cookies;
    if (!auth_token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const { newRole } = req.body;

        // Validasi keamanan: Pastikan peran baru ada dalam daftar peran asli pengguna
        if (!decoded.roles || !decoded.roles.includes(newRole)) {
            return res.status(403).json({ message: 'Invalid role selection.' });
        }

        // Buat payload baru dengan selectedRole yang diperbarui
        const newPayload = {
            ...decoded,
            selectedRole: newRole,
        };
        
        // Hapus properti iat dan exp dari token lama untuk membuat yang baru
        delete newPayload.iat;
        delete newPayload.exp;

        // Buat token baru
        const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Set token baru di cookie, menimpa yang lama
        res.setHeader('Set-Cookie', serialize('auth_token', newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 hari
            path: '/',
        }));

        // Kirim kembali data pengguna yang sudah diperbarui
        res.status(200).json({ user: newPayload });

    } catch (error) {
        console.error("Switch Role Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}