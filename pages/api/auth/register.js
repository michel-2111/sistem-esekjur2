// pages/api/auth/register.js
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { nama, identifier, password, prodiId } = req.body; // Ubah sesuai frontend

    if (!nama || !identifier || !password || !prodiId) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { identifier: identifier } // Ubah dari nim ke identifier
        });

        if (existingUser) {
            return res.status(400).json({ message: 'NIM sudah terdaftar.' });
        }

        const prodiInfo = await prisma.prodi.findUnique({
            where: { id: prodiId }, // Ubah dari prodi_id ke prodiId
            select: { jurusan_id: true }
        });

        if (!prodiInfo) {
            return res.status(400).json({ message: 'Program Studi tidak valid.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                nama,
                identifier: identifier,
                password: hashedPassword,
                prodi_id: prodiId,
                jurusan_id: prodiInfo.jurusan_id,
                roles: {
                    create: { role: { connect: { nama_role: 'mahasiswa' } } }
                }
            }
        });

        return res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });

    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
    }
}