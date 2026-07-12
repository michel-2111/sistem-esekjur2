import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';
import crypto from 'crypto';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const jurusanId = decoded.jurusan_id || decoded.jurusanId;
        
        if (!decoded.roles.includes('dosen') && decoded.selectedRole !== 'dosen') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (req.method === 'GET') {
            const components = await prisma.tA_Assessment_Component.findMany({
                where: { 
                    jurusan_id: jurusanId,
                    is_active: true 
                },
                orderBy: { id: 'asc' }
            });
            return res.status(200).json(components);
        }

        if (req.method === 'POST') {
            const { examinerId, appId, scores, catatan } = req.body;

            if (!examinerId || !scores || Object.keys(scores).length === 0) {
                return res.status(400).json({ message: 'Data nilai tidak lengkap.' });
            }

            const token = crypto.randomBytes(16).toString('hex');

            await prisma.$transaction(async (tx) => {
                const gradePromises = Object.entries(scores).map(([compId, score]) => {
                    return tx.tA_Grade.upsert({
                        where: {
                            examiner_id_component_id: {
                                examiner_id: Number(examinerId),
                                component_id: Number(compId)
                            }
                        },
                        update: { score: Number(score) },
                        create: {
                            examiner_id: Number(examinerId),
                            component_id: Number(compId),
                            score: Number(score)
                        }
                    });
                });
                await Promise.all(gradePromises);

                await tx.tA_Examiner.update({
                    where: { id: Number(examinerId) },
                    data: {
                        status_penilaian: 'sudah_menilai',
                        catatan_revisi: catatan || null,
                        waktu_penilaian: new Date(),
                        berita_acara_token: token
                    }
                });
            });

            return res.status(200).json({ message: 'Nilai berhasil disimpan.', token });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}