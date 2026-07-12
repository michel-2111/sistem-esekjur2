// pages/api/sekjur/ta/panitia.js
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const jurusanId = decoded.jurusan_id;

        if (decoded.selectedRole !== 'sekjur' || !jurusanId) {
            return res.status(403).json({ message: 'Forbidden: Akses khusus Sekjur' });
        }

        // --- GET: Ambil Data (Tidak berubah) ---
        if (req.method === 'GET') {
            const [committee, lecturers, settings] = await Promise.all([
                prisma.tA_Committee.findMany({
                    where: { jurusan_id: jurusanId, is_active: true },
                    include: { dosen: { select: { id: true, nama: true } } }
                }),
                prisma.user.findMany({
                    where: { 
                        jurusan_id: jurusanId, 
                        roles: { some: { role: { nama_role: 'dosen' } } } 
                    },
                    select: { id: true, nama: true },
                    orderBy: { nama: 'asc' }
                }),
                prisma.tA_Settings.findUnique({
                    where: { jurusan_id: jurusanId }
                })
            ]);

            return res.status(200).json({ 
                committee, 
                lecturers, 
                approvalMode: settings?.approval_mode || 'kaprodi' 
            });
        }

        // --- POST: Simpan Perubahan (UPDATE LOGIKA) ---
        if (req.method === 'POST') {
            const { type, ketuaId, sekretarisId, approvalMode } = req.body;

            await prisma.$transaction(async (tx) => {
                
                // 1. JIKA UPDATE PANITIA
                if (type === 'committee') {
                    // Bersihkan panitia lama di jurusan ini
                    await tx.tA_Committee.deleteMany({ where: { jurusan_id: jurusanId } });

                    // Simpan Ketua
                    if (ketuaId) {
                        await tx.tA_Committee.create({
                            data: { jurusan_id: jurusanId, dosen_id: Number(ketuaId), position: 'ketua', is_active: true }
                        });
                        // Tambah role panitia jika belum ada
                        const existingRole = await tx.user_Roles.findFirst({ where: { user_id: Number(ketuaId), role: { nama_role: 'panitia' } } });
                        if (!existingRole) {
                            const rolePanitia = await tx.role.findFirst({ where: { nama_role: 'panitia' } });
                            if (rolePanitia) await tx.user_Roles.create({ data: { user_id: Number(ketuaId), role_id: rolePanitia.id } });
                        }
                    }

                    // Simpan Sekretaris
                    if (sekretarisId) {
                        await tx.tA_Committee.create({
                            data: { jurusan_id: jurusanId, dosen_id: Number(sekretarisId), position: 'sekretaris', is_active: true }
                        });
                        // Tambah role panitia jika belum ada
                        const existingRoleSec = await tx.user_Roles.findFirst({ where: { user_id: Number(sekretarisId), role: { nama_role: 'panitia' } } });
                        if (!existingRoleSec) {
                            const rolePanitia = await tx.role.findFirst({ where: { nama_role: 'panitia' } });
                            if (rolePanitia) await tx.user_Roles.create({ data: { user_id: Number(sekretarisId), role_id: rolePanitia.id } });
                        }
                    }
                }

                // 2. JIKA UPDATE SETTINGS (APPROVAL MODE)
                if (type === 'mode' && approvalMode) {
                    await tx.tA_Settings.upsert({
                        where: { jurusan_id: jurusanId },
                        update: { approval_mode: approvalMode },
                        create: { jurusan_id: jurusanId, approval_mode: approvalMode }
                    });
                }
            });

            return res.status(200).json({ message: 'Pengaturan berhasil disimpan.' });
        }

        res.status(405).end();
    } catch (error) {
        console.error("API Panitia Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}