import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        if (!decoded.roles.includes('kajur') && decoded.selectedRole !== 'kajur') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const kajur = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { jurusan_id: true }
        });

        if (!kajur?.jurusan_id) {
            return res.status(400).json({ message: 'Data Kajur tidak valid.' });
        }

        const jurusanId = kajur.jurusan_id;

        // ── GET: Ambil Data Plotting Pembimbing ──
        if (req.method === 'GET') {
            const supervisors = await prisma.tA_Supervisor.findMany({
                where: { mahasiswa: { jurusan_id: jurusanId } },
                include: {
                    mahasiswa: { select: { id: true, nama: true, identifier: true } },
                    dosen: { select: { id: true, nama: true } }
                },
                orderBy: { updated_at: 'desc' }
            });

            const applications = await prisma.tA_Application.findMany({
                where: { mahasiswa: { jurusan_id: jurusanId } },
                select: { mahasiswa_id: true, proposal_title: true }
            });
            
            const appMap = Object.fromEntries(
                applications.map(a => [a.mahasiswa_id, a.proposal_title])
            );

            const groupedData = [];
            supervisors.forEach(spv => {
                let existing = groupedData.find(g => g.mahasiswa_id === spv.mahasiswa_id);
                if (!existing) {
                    existing = {
                        mahasiswa_id: spv.mahasiswa_id,
                        mahasiswa: spv.mahasiswa,
                        status_kajur: spv.status_kajur,
                        proposal_title: appMap[spv.mahasiswa_id] ?? null,
                        pembimbing: []
                    };
                    groupedData.push(existing);
                }
                existing.pembimbing.push({
                    id: spv.id,
                    dosen_id: spv.dosen_id,
                    nama_dosen: spv.dosen.nama
                    // Catatan: spv.peran telah dihapus dari sini
                });
            });

            const lecturers = await prisma.user.findMany({
                where: {
                    jurusan_id: jurusanId,
                    roles: { some: { role: { nama_role: 'dosen' } } }
                },
                select: { id: true, nama: true },
                orderBy: { nama: 'asc' }
            });

            return res.status(200).json({ data: groupedData, lecturers });
        }

        // ── PUT: Update / Simpan Persetujuan Kajur ──
        if (req.method === 'PUT') {
            const { mahasiswa_id, status, dosen_ids, batch } = req.body;

            // Fitur Batch Approve (Setujui Semua)
            if (batch) {
                await prisma.tA_Supervisor.updateMany({
                    where: { 
                        mahasiswa: { jurusan_id: jurusanId },
                        status_kajur: 'menunggu_persetujuan' 
                    },
                    data: { status_kajur: 'disetujui' }
                });
                return res.status(200).json({ message: 'Semua plotting berhasil disetujui.' });
            }

            if (!mahasiswa_id || !['disetujui', 'ditolak'].includes(status)) {
                return res.status(400).json({ message: 'Data tidak valid.' });
            }

            const mahasiswaIdNum = Number(mahasiswa_id);

            // Fitur Edit (Ubah Susunan Dosen) lalu Simpan
            if (dosen_ids && Array.isArray(dosen_ids) && dosen_ids.length > 0) {
                const dosenIdsNum = dosen_ids.map(Number);

                await prisma.$transaction(async (tx) => {
                    const existingSpv = await tx.tA_Supervisor.findMany({
                        where: { mahasiswa_id: mahasiswaIdNum }
                    });

                    const existingDosenIds = existingSpv.map(s => s.dosen_id);
                    
                    // Cari dosen yang dihapus oleh Kajur
                    const toDeleteIds = existingSpv
                        .filter(s => !dosenIdsNum.includes(s.dosen_id))
                        .map(s => s.id);
                        
                    // Cari dosen baru yang ditambahkan oleh Kajur
                    const toAddDosenIds = dosenIdsNum.filter(id => !existingDosenIds.includes(id));

                    if (toDeleteIds.length > 0) {
                        await tx.tA_Supervisor.deleteMany({ where: { id: { in: toDeleteIds } } });
                    }

                    if (toAddDosenIds.length > 0) {
                        await tx.tA_Supervisor.createMany({
                            data: toAddDosenIds.map((id) => ({
                                mahasiswa_id: mahasiswaIdNum,
                                dosen_id: id,
                                // Catatan: Variabel "peran" telah dihapus dari sini agar Prisma tidak error
                                status_kajur: status
                            }))
                        });
                    }

                    await tx.tA_Supervisor.updateMany({
                        where: { mahasiswa_id: mahasiswaIdNum },
                        data: { status_kajur: status }
                    });
                });
            } else {
                // Fitur Setujui Langsung (Tanpa Edit)
                await prisma.tA_Supervisor.updateMany({
                    where: { mahasiswa_id: mahasiswaIdNum },
                    data: { status_kajur: status }
                });
            }

            return res.status(200).json({ message: `Plotting pembimbing berhasil ${status}.` });
        }

        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}