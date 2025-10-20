import bcrypt from 'bcryptjs';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { nama, identifier, password, prodiId } = req.body;

    if (!nama || !identifier || !password || !prodiId) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { identifier },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'NIM sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const studentRole = await prisma.role.findUnique({
            where: { nama_role: 'mahasiswa' },
        });

        if (!studentRole) {
            return res.status(500).json({ message: 'Role mahasiswa tidak ditemukan. Jalankan seeding.' });
        }

        await prisma.user.create({
            data: {
                nama,
                identifier,
                password: hashedPassword,
                prodi_id: prodiId,
                roles: {
                    create: {
                        role_id: studentRole.id,
                    },
                },
            },
        });

        res.status(201).json({ message: 'Registrasi berhasil!' });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
}