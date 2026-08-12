import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
        const jurusanList = await prisma.jurusan.findMany({
            include: {
            kajur: { select: { id: true, nama: true, identifier: true } },
            sekjur: { select: { id: true, nama: true, identifier: true } },
            },
            orderBy: { id: 'asc' },
        });

        // HANYA mengambil user yang memiliki role 'DOSEN'
        const dosenList = await prisma.user.findMany({
            where: {
            roles: {
                some: {
                role: {
                    nama_role: 'dosen', // Sesuaikan kapitalisasi 'DOSEN' dengan data di database Anda
                },
                },
            },
            },
            select: {
            id: true,
            nama: true,
            identifier: true,
            },
            orderBy: { nama: 'asc' },
        });

        return res.status(200).json({ jurusan: jurusanList, dosen: dosenList });
        } catch (error) {
        console.error('Error GET /api/admin/jurusan:', error);
        return res.status(500).json({ message: 'Gagal mengambil data jurusan' });
        }
    }

    // -------------------------------------------------------------
    // POST: Simpan/Update Jurusan + Otomatisasi Sinkronisasi User_Roles
    // -------------------------------------------------------------
    if (req.method === 'POST') {
        const { id, nama, kajur_id, sekjur_id } = req.body;

        if (!id || !nama) {
        return res.status(400).json({ message: 'Kode/ID Jurusan dan Nama Jurusan wajib diisi' });
        }

        const newKajurId = kajur_id ? Number(kajur_id) : null;
        const newSekjurId = sekjur_id ? Number(sekjur_id) : null;

        try {
        await prisma.$transaction(async (tx) => {
            // 1. Ambil data jurusan saat ini untuk mengetahui Kajur & Sekjur lama
            const existingJurusan = await tx.jurusan.findUnique({
            where: { id: id },
            });

            const oldKajurId = existingJurusan?.kajur_id;
            const oldSekjurId = existingJurusan?.sekjur_id;

            // 2. Ambil data ID Role 'KAJUR' dan 'SEKJUR' dari tabel Role
            const roleKajur = await tx.role.findUnique({ where: { nama_role: 'kajur' } });
            const roleSekjur = await tx.role.findUnique({ where: { nama_role: 'sekjur' } });

            // 3. Upsert data Jurusan (Simpan / Perbarui)
            await tx.jurusan.upsert({
            where: { id: id },
            update: {
                nama: nama,
                kajur_id: newKajurId,
                sekjur_id: newSekjurId,
            },
            create: {
                id: id,
                nama: nama,
                kajur_id: newKajurId,
                sekjur_id: newSekjurId,
            },
            });

            // 4. Sinkronisasi Role KAJUR pada User_Roles
            if (roleKajur) {
            // Jika Kajur berganti orang, cabut role KAJUR dari dosen lama
            if (oldKajurId && oldKajurId !== newKajurId) {
                await tx.user_Roles.deleteMany({
                where: {
                    user_id: oldKajurId,
                    role_id: roleKajur.id,
                },
                });
            }

            // Tambahkan role KAJUR ke dosen baru
            if (newKajurId) {
                await tx.user_Roles.upsert({
                where: {
                    user_id_role_id: {
                    user_id: newKajurId,
                    role_id: roleKajur.id,
                    },
                },
                update: {},
                create: {
                    user_id: newKajurId,
                    role_id: roleKajur.id,
                },
                });
            }
            }

            // 5. Sinkronisasi Role SEKJUR pada User_Roles
            if (roleSekjur) {
            // Jika Sekjur berganti orang, cabut role SEKJUR dari dosen lama
            if (oldSekjurId && oldSekjurId !== newSekjurId) {
                await tx.user_Roles.deleteMany({
                where: {
                    user_id: oldSekjurId,
                    role_id: roleSekjur.id,
                },
                });
            }

            // Tambahkan role SEKJUR ke dosen baru
            if (newSekjurId) {
                await tx.user_Roles.upsert({
                where: {
                    user_id_role_id: {
                    user_id: newSekjurId,
                    role_id: roleSekjur.id,
                    },
                },
                update: {},
                create: {
                    user_id: newSekjurId,
                    role_id: roleSekjur.id,
                },
                });
            }
            }
        });

        return res.status(200).json({
            message: 'Data Jurusan dan Hak Akses Role Pejabat berhasil disinkronkan!',
        });
        } catch (error) {
        console.error('Error POST /api/admin/jurusan:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
            message: 'Dosen yang Anda pilih sudah terdaftar sebagai Kajur/Sekjur di jurusan lain.',
            });
        }

        return res.status(500).json({ message: 'Terjadi kesalahan server saat menyimpan data.' });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}