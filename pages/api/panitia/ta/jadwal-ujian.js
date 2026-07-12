// pages/api/panitia/ta/jadwal-ujian.js
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        // Pastikan user memiliki akses panitia
        const hasAccess = decoded.selectedRole === 'panitia' || decoded.roles.includes('panitia');
        if (!hasAccess) return res.status(403).json({ message: 'Forbidden' });

        const jurusanId = decoded.jurusan_id || decoded.jurusanId; // Handle snake/camel case issue just in case

        // --- GET: Ambil Data untuk Tabel & Dropdown ---
        if (req.method === 'GET') {
            const [readyProposals, lecturers] = await Promise.all([
                // 1. Ambil aplikasi yang proposalnya SUDAH DISETUJUI
                prisma.tA_Application.findMany({
                    where: {
                        proposal_status: 'disetujui',
                        mahasiswa: { jurusan_id: jurusanId }
                    },
                    include: {
                        mahasiswa: { select: { nama: true, identifier: true } },
                        examiners: { include: { dosen: { select: { id: true, nama: true } } } }
                    },
                    orderBy: { updated_at: 'desc' }
                }),
                // 2. Ambil daftar Dosen untuk Dropdown Penguji
                prisma.user.findMany({
                    where: {
                        jurusan_id: jurusanId,
                        roles: { some: { role: { nama_role: 'dosen' } } }
                    },
                    select: { id: true, nama: true },
                    orderBy: { nama: 'asc' }
                })
            ]);

            return res.status(200).json({ proposals: readyProposals, lecturers });
        }

        // --- POST: Simpan Jadwal & Penguji ---
        // --- POST: Simpan Jadwal & Penguji ---
        if (req.method === 'POST') {
            // Kita terima array 'penguji'
            const { appId, date, time, room, penguji } = req.body;

            if (!date || !time || !room || !penguji || penguji.length === 0) {
                return res.status(400).json({ message: 'Data jadwal dan minimal 1 penguji wajib diisi.' });
            }

            const examDateTime = new Date(`${date}T${time}:00`);

            await prisma.$transaction(async (tx) => {
                // 1. Update Jadwal
                await tx.tA_Application.update({
                    where: { id: appId },
                    data: {
                        exam_date: examDateTime,
                        exam_room: room
                    }
                });

                // 2. Reset Penguji Lama
                await tx.tA_Examiner.deleteMany({ where: { ta_application_id: appId } });

                // 3. Simpan Penguji Baru secara Dinamis
                const examinersData = penguji.map((dosenId, index) => ({
                    ta_application_id: appId,
                    dosen_id: Number(dosenId),
                    peran: index === 0 ? 'ketua' : 'anggota' // Index 0 otomatis jadi ketua
                }));

                await tx.tA_Examiner.createMany({ data: examinersData });
            });

            return res.status(200).json({ message: 'Jadwal ujian berhasil disimpan.' });
        }

        res.status(405).end();
    } catch (error) {
        console.error("API Jadwal Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}