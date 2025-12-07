// pages/api/sekjur/dosen-crud.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'sekjur' || !decoded.jurusan_id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'POST') {
            const { nama, nip, prodi_id, password } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { identifier: nip } });
            if (existingUser) {
                return res.status(400).json({ message: 'NIP sudah terdaftar.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await prisma.user.create({
                data: {
                    nama,
                    identifier: nip,
                    password: hashedPassword,
                    jurusan_id: decoded.jurusan_id,
                    prodi_id: prodi_id,
                    roles: {
                        create: { role: { connect: { nama_role: 'dosen' } } }
                    }
                }
            });

            return res.status(201).json({ message: 'Dosen berhasil ditambahkan.' });
        }

        if (req.method === 'PUT') {
            const { id, nama, nip, prodi_id, password } = req.body;

            const updateData = {
                nama,
                identifier: nip,
                prodi_id,
            };

            if (password && password.trim() !== "") {
                updateData.password = await bcrypt.hash(password, 10);
            }

            await prisma.user.update({
                where: { id: Number(id) },
                data: updateData
            });

            return res.status(200).json({ message: 'Data dosen berhasil diperbarui.' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;

            await prisma.user_Roles.deleteMany({
                where: { user_id: Number(id) }
            });

            await prisma.user.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({ message: 'Dosen berhasil dihapus.' });
        }

        res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}