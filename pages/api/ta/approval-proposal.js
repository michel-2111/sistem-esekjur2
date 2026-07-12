// pages/api/ta/approval-proposal.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        // Pastikan kita mengambil prodi_id juga dari token
        const { selectedRole, id: userId, jurusan_id, prodi_id } = decoded;

        // Cek Role: Hanya Kaprodi atau Panitia yang boleh akses
        if (!['kaprodi', 'panitia'].includes(selectedRole)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // --- GET: Ambil Daftar Proposal ---
        if (req.method === 'GET') {
            // Base filter: status proposal
            let whereClause = {
                proposal_status: { in: ['menunggu_persetujuan', 'disetujui', 'ditolak'] }
            };

            // --- PERBAIKAN LOGIKA FILTER ---
            if (selectedRole === 'kaprodi') {
                // Jika Kaprodi, HARUS filter spesifik ke prodi dia saja
                if (!prodi_id) {
                    return res.status(400).json({ message: 'Error: Identitas Prodi tidak ditemukan.' });
                }
                whereClause.mahasiswa = { prodi_id: prodi_id };
            } else {
                // Jika Panitia, filter satu Jurusan (bisa melihat semua prodi di jurusan tsb)
                whereClause.mahasiswa = { jurusan_id: jurusan_id };
            }
            // -------------------------------

            const proposals = await prisma.tA_Application.findMany({
                where: whereClause,
                include: {
                    mahasiswa: {
                        select: { nama: true, identifier: true, prodi: { select: { nama: true } } }
                    }
                },
                orderBy: { updated_at: 'desc' }
            });

            return res.status(200).json(proposals);
        }

        // --- POST: Proses Approval/Rejection ---
        if (req.method === 'POST') {
            const { appId, action, feedback } = req.body; // action: 'approve' | 'reject'

            // 1. Tentukan kolom mana yang diupdate berdasarkan role
            let updateData = {};
            
            if (action === 'reject') {
                updateData = {
                    proposal_status: 'ditolak',
                    requirements_feedback: feedback 
                };
            } else if (action === 'approve') {
                if (selectedRole === 'kaprodi') {
                    updateData.approved_by_kaprodi = true;
                } else if (selectedRole === 'panitia') {
                    updateData.approved_by_panitia = true;
                }
            }

            // 2. Update Database
            const updatedApp = await prisma.tA_Application.update({
                where: { id: appId },
                data: updateData
            });

            // 3. LOGIKA FINAL STATUS (Cek Pengaturan Jurusan)
            // Ambil setting jurusan mahasiswa tersebut (bukan jurusan user login, untuk keamanan)
            // Kita query ulang untuk ambil jurusan_id mahasiswa dari aplikasi ini
            const currentApp = await prisma.tA_Application.findUnique({
                where: { id: appId },
                include: { mahasiswa: { select: { jurusan_id: true } } }
            });
            
            const targetJurusanId = currentApp.mahasiswa.jurusan_id;

            if (action === 'approve') {
                const settings = await prisma.tA_Settings.findUnique({
                    where: { jurusan_id: targetJurusanId }
                });

                const mode = settings?.approval_mode || 'kaprodi'; // Default Kaprodi
                let isFinalApproved = false;

                if (mode === 'kaprodi' && updatedApp.approved_by_kaprodi) isFinalApproved = true;
                else if (mode === 'panitia' && updatedApp.approved_by_panitia) isFinalApproved = true;
                else if (mode === 'both' && updatedApp.approved_by_kaprodi && updatedApp.approved_by_panitia) isFinalApproved = true;
                else if (mode === 'either' && (updatedApp.approved_by_kaprodi || updatedApp.approved_by_panitia)) isFinalApproved = true;

                if (isFinalApproved) {
                    await prisma.tA_Application.update({
                        where: { id: appId },
                        data: { proposal_status: 'disetujui' }
                    });
                }
            }

            return res.status(200).json({ message: 'Status proposal berhasil diperbarui.' });
        }

        res.status(405).end();
    } catch (error) {
        console.error("API Approval Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}