import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        if (!decoded.roles.includes('panitia') && decoded.selectedRole !== 'panitia') {
            return res.status(403).json({ message: 'Forbidden: Khusus Panitia TA' });
        }

        const panitia = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { jurusan_id: true }
        });

        if (!panitia?.jurusan_id) return res.status(400).json({ message: 'Data panitia tidak valid.' });

        if (req.method === 'GET') {
            const applications = await prisma.tA_Application.findMany({
                where: {
                    mahasiswa: { jurusan_id: panitia.jurusan_id },
                    requirements_status: { in: ['pending', 'menunggu_validasi', 'valid', 'invalid'] } 
                },
                include: {
                    mahasiswa: {
                        select: { nama: true, identifier: true, prodi: { select: { nama: true } } }
                    },
                    documents: {
                        include: { requirement: true }
                    }
                },
                orderBy: { updated_at: 'desc' }
            });
            return res.status(200).json(applications);
        }

        if (req.method === 'POST') {
            const { appId, action, feedback } = req.body; 

            if (!['approve', 'reject'].includes(action)) {
                return res.status(400).json({ message: 'Aksi tidak valid.' });
            }

            const newStatus = action === 'approve' ? 'valid' : 'invalid';
            const docStatus = action === 'approve' ? 'disetujui' : 'ditolak';
            
            await prisma.$transaction(async (tx) => {
                await tx.tA_Application.update({
                    where: { id: Number(appId) },
                    data: {
                        requirements_status: newStatus,
                    }
                });

                await tx.tA_Document_Submission.updateMany({
                    where: { ta_application_id: Number(appId) },
                    data: {
                        status: docStatus,
                        feedback: action === 'reject' ? feedback : null
                    }
                });
            });

            return res.status(200).json({ message: `Pengajuan berhasil di-${action === 'approve' ? 'validasi' : 'tolak'}.` });
        }

        res.status(405).end();
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}