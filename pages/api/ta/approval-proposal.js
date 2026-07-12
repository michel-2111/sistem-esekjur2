import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const { selectedRole, id: userId, jurusan_id, prodi_id } = decoded;

        if (!['kaprodi', 'panitia'].includes(selectedRole)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // --- GET: Ambil Daftar Proposal ---
        if (req.method === 'GET') {
            let whereClause = {
                proposal_status: { in: ['menunggu_persetujuan', 'disetujui', 'ditolak'] }
            };

            if (selectedRole === 'kaprodi') {
                if (!prodi_id) return res.status(400).json({ message: 'Error: Identitas Prodi tidak ditemukan.' });
                whereClause.mahasiswa = { prodi_id: prodi_id };
            } else {
                whereClause.mahasiswa = { jurusan_id: jurusan_id };
            }

            const proposals = await prisma.tA_Application.findMany({
                where: whereClause,
                include: {
                    mahasiswa: {
                        select: { nama: true, identifier: true, prodi: { select: { nama: true } } }
                    }
                },
                orderBy: { updated_at: 'desc' }
            });

            const settings = await prisma.tA_Settings.findUnique({
                where: { jurusan_id: jurusan_id }
            });
            const mode = settings?.approval_mode || 'kaprodi';

            return res.status(200).json({ proposals, approval_mode: mode }); 
        }

        // --- POST: Proses Approval/Rejection ---
        if (req.method === 'POST') {
            const { appId, action, feedback } = req.body; 

            // 1. Ambil data aplikasi saat ini dan cek pengaturan jurusan
            const currentApp = await prisma.tA_Application.findUnique({
                where: { id: appId },
                include: { mahasiswa: { select: { jurusan_id: true } } }
            });

            if (!currentApp) return res.status(404).json({ message: 'Aplikasi tidak ditemukan' });

            const targetJurusanId = currentApp.mahasiswa.jurusan_id;
            const settings = await prisma.tA_Settings.findUnique({
                where: { jurusan_id: targetJurusanId }
            });

            const mode = settings?.approval_mode || 'kaprodi';

            // 2. PENJAGA GERBANG (GATEKEEPER) - Cek hak akses berdasarkan mode pengaturan
            if (mode === 'kaprodi' && selectedRole !== 'kaprodi') {
                return res.status(403).json({ message: 'Ditolak: Pengaturan saat ini mewajibkan hanya Kaprodi yang memvalidasi.' });
            }
            if (mode === 'panitia' && selectedRole !== 'panitia') {
                return res.status(403).json({ message: 'Ditolak: Pengaturan saat ini mewajibkan hanya Panitia yang memvalidasi.' });
            }

            // 3. Jika lolos penjagaan, tentukan data yang akan di-update
            let updateData = {};
            
            if (action === 'reject') {
                updateData = {
                    proposal_status: 'ditolak',
                    requirements_feedback: feedback // Opsional: Sesuaikan nama kolom jika ada catatan revisi khusus proposal
                };
            } else if (action === 'approve') {
                if (selectedRole === 'kaprodi') updateData.approved_by_kaprodi = true;
                if (selectedRole === 'panitia') updateData.approved_by_panitia = true;
            }

            // Gabungkan status persetujuan yang baru diklik dengan status yang sudah ada di database
            const isApprovedByKaprodi = selectedRole === 'kaprodi' && action === 'approve' ? true : currentApp.approved_by_kaprodi;
            const isApprovedByPanitia = selectedRole === 'panitia' && action === 'approve' ? true : currentApp.approved_by_panitia;

            let isFinalApproved = false;

            // 4. Kalkulasi Final Status
            if (mode === 'kaprodi' && isApprovedByKaprodi) isFinalApproved = true;
            else if (mode === 'panitia' && isApprovedByPanitia) isFinalApproved = true;
            else if (mode === 'both' && isApprovedByKaprodi && isApprovedByPanitia) isFinalApproved = true;
            else if (mode === 'either' && (isApprovedByKaprodi || isApprovedByPanitia)) isFinalApproved = true;

            if (isFinalApproved) {
                updateData.proposal_status = 'disetujui';
            }

            // 5. Simpan ke Database
            await prisma.tA_Application.update({
                where: { id: appId },
                data: updateData
            });

            return res.status(200).json({ message: 'Status proposal berhasil diperbarui.' });
        }

        res.status(405).end();
    } catch (error) {
        console.error("API Approval Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}