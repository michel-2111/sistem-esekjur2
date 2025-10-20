// pages/api/auth/login.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { identifier, password, role } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { identifier },
            include: {
                roles: { include: { role: true } },
                prodi: { include: { jurusan: true } },
                jurusan: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: 'NIM/NIP tidak ditemukan' });
        }

        const userRoles = user.roles.map(r => r.role.nama_role);

        if (!userRoles.includes(role)) {
            return res.status(401).json({ message: 'Anda tidak memiliki akses sebagai ' + role });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Password salah' });
        }

        const userForToken = {
            id: user.id,
            nama: user.nama,
            identifier: user.identifier,
            roles: userRoles,
            prodi_id: user.prodi_id,
            jurusan_id: user.jurusan_id,
            prodi: user.prodi,
            jurusan: user.jurusan,
            nomor_rekening: user.nomor_rekening,
            telepon: user.telepon,
        }
        delete userForToken.password; 

        const token = jwt.sign(
            { ...userForToken, selectedRole: role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.setHeader('Set-Cookie', serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
            path: '/',
        }));

        res.status(200).json({ user: { ...userForToken, selectedRole: role } });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}