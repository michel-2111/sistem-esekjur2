import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // =========================================================================
  // 1. ROUTE PROTECTION
  // =========================================================================
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: 'Akses ditolak. Anda belum login.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userRoles = decoded.roles.map(r => r.toLowerCase());
        if (!userRoles.includes('admin')) {
        return res.status(403).json({ message: 'Akses ditolak. Hanya Admin yang diizinkan.' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Sesi tidak valid atau telah berakhir.' });
    }

    // =========================================================================
    // 2. GET: Ambil Data Roles, Users, Jurusan, dan Prodi
    // =========================================================================
    if (req.method === 'GET') {
        try {
        const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
        const jurusan = await prisma.jurusan.findMany({ orderBy: { nama: 'asc' } });
        const prodi = await prisma.prodi.findMany({ orderBy: { nama: 'asc' } });
        
        const users = await prisma.user.findMany({
            include: { 
            roles: { include: { role: true } },
            jurusan: true, // Relasi untuk menampilkan nama jurusan di tabel
            prodi: true    // Relasi untuk menampilkan nama prodi di tabel
            },
            orderBy: { id: 'desc' },
        });
        
        return res.status(200).json({ roles, users, jurusan, prodi });
        } catch (error) {
        console.error('Error GET /api/admin/users:', error);
        return res.status(500).json({ message: 'Gagal mengambil data dari server.' });
        }
    }

    // =========================================================================
    // 3. POST: Tambah User Baru
    // =========================================================================
    if (req.method === 'POST') {
        const { nama, identifier, password, roleIds, jurusan_id, prodi_id } = req.body;
        
        if (!nama || !identifier || !password || !roleIds || roleIds.length === 0) {
        return res.status(400).json({ message: 'Nama, Identifier, Password, dan minimal 1 Role wajib diisi.' });
        }

        try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
            nama,
            identifier,
            password: hashedPassword,
            jurusan_id: jurusan_id || null, // Simpan jika ada, jadikan null jika kosong
            prodi_id: prodi_id || null,
            roles: {
                create: roleIds.map((roleId) => ({ role_id: Number(roleId) })),
            },
            },
        });
        return res.status(201).json({ message: 'Pengguna berhasil ditambahkan!', user: newUser });
        } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ message: 'Identifier sudah digunakan.' });
        return res.status(500).json({ message: 'Terjadi kesalahan server.' });
        }
    }

    // =========================================================================
    // 4. PUT: Update Data User
    // =========================================================================
    if (req.method === 'PUT') {
        const { id, nama, password, roleIds, jurusan_id, prodi_id } = req.body;
        if (!id || !nama || !roleIds || roleIds.length === 0) {
        return res.status(400).json({ message: 'Nama dan minimal 1 Role wajib diisi.' });
        }

        try {
        const updateData = { 
            nama,
            jurusan_id: jurusan_id || null,
            prodi_id: prodi_id || null
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await prisma.$transaction(async (tx) => {
            await tx.user.update({
            where: { id: Number(id) },
            data: updateData,
            });

            await tx.user_Roles.deleteMany({
            where: { user_id: Number(id) },
            });

            if (roleIds.length > 0) {
            await tx.user_Roles.createMany({
                data: roleIds.map((roleId) => ({
                user_id: Number(id),
                role_id: Number(roleId),
                })),
            });
            }
        });

        return res.status(200).json({ message: 'Data pengguna berhasil diperbarui!' });
        } catch (error) {
        console.error('Update Error:', error);
        return res.status(500).json({ message: 'Gagal memperbarui pengguna.' });
        }
    }

    // =========================================================================
    // 5. DELETE: Hapus Data User
    // =========================================================================
    if (req.method === 'DELETE') {
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: 'ID pengguna tidak ditemukan.' });

        try {
        await prisma.$transaction(async (tx) => {
            await tx.user_Roles.deleteMany({ where: { user_id: Number(id) } });
            await tx.user.delete({ where: { id: Number(id) } });
        });
        return res.status(200).json({ message: 'Pengguna berhasil dihapus!' });
        } catch (error) {
        console.error('Delete Error:', error);
        return res.status(500).json({ message: 'Gagal menghapus pengguna.' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}