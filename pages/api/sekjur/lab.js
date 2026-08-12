import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // GET: Ambil daftar Lab & Dosen
    if (req.method === 'GET') {
        try {
        const { jurusan_id } = req.query;

        const labs = await prisma.laboratorium.findMany({
            where: jurusan_id ? { jurusan_id } : undefined,
            include: {
            kepala_lab: { select: { id: true, nama: true, identifier: true } },
            },
            orderBy: { id: 'asc' },
        });

        // Ambil dosen untuk dropdown
        const dosenList = await prisma.user.findMany({
            where: { roles: { some: { role: { nama_role: 'dosen' } } } },
            select: { id: true, nama: true, identifier: true },
            orderBy: { nama: 'asc' },
        });

        return res.status(200).json({ labs, dosen: dosenList });
        } catch (error) {
        console.error('Error GET Lab:', error);
        return res.status(500).json({ message: 'Gagal mengambil data' });
        }
    }

    // POST: Tambah / Edit Lab & Assign Kepala Lab
    if (req.method === 'POST') {
        const { id, nama_lab, jurusan_id, kepala_lab_id } = req.body;

        if (!nama_lab || !jurusan_id) {
        return res.status(400).json({ message: 'Nama Lab dan Jurusan wajib diisi' });
        }

        const newKepalaLabId = kepala_lab_id ? Number(kepala_lab_id) : null;

        try {
        await prisma.$transaction(async (tx) => {
            // Pastikan role KEPALA_LAB ada di database
            let roleKalab = await tx.role.findUnique({ where: { nama_role: 'kepala_lab' } });
            if (!roleKalab) {
            roleKalab = await tx.role.create({ data: { nama_role: 'kepala_lab' } });
            }

            let oldKepalaLabId = null;

            // Jika Edit, cari tahu kepala lab lama
            if (id) {
            const existingLab = await tx.laboratorium.findUnique({ where: { id: Number(id) } });
            oldKepalaLabId = existingLab?.kepala_lab_id;
            }

            // Simpan / Perbarui Lab
            const savedLab = await tx.laboratorium.upsert({
            where: { id: id ? Number(id) : 0 },
            update: { nama_lab, kepala_lab_id: newKepalaLabId },
            create: { nama_lab, jurusan_id, kepala_lab_id: newKepalaLabId },
            });

            // Sinkronisasi Role
            if (oldKepalaLabId && oldKepalaLabId !== newKepalaLabId) {
            await tx.user_Roles.deleteMany({
                where: { user_id: oldKepalaLabId, role_id: roleKalab.id },
            });
            }

            if (newKepalaLabId) {
            await tx.user_Roles.upsert({
                where: {
                user_id_role_id: { user_id: newKepalaLabId, role_id: roleKalab.id },
                },
                update: {},
                create: { user_id: newKepalaLabId, role_id: roleKalab.id },
            });
            }
        });

        return res.status(200).json({ message: 'Data Lab berhasil disimpan!' });
        } catch (error) {
        console.error('Error POST Lab:', error);
        if (error.code === 'P2002') return res.status(400).json({ message: 'Dosen sudah menjadi Kepala Lab di tempat lain.' });
        return res.status(500).json({ message: 'Kesalahan Server' });
        }
    }

    // DELETE: Hapus Lab (opsional, jika Sekjur butuh menghapus)
    if (req.method === 'DELETE') {
        const { id } = req.query;
        try {
        await prisma.laboratorium.delete({ where: { id: Number(id) } });
        return res.status(200).json({ message: 'Lab berhasil dihapus' });
        } catch (error) {
        return res.status(500).json({ message: 'Gagal menghapus lab' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}