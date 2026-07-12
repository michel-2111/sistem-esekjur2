// pages/api/mahasiswa/ta/requirements.js
import { formidable } from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    let userId;
    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        userId = decoded.id;
    } catch (e) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    if (req.method === 'GET') {
        try {
            const taApp = await prisma.tA_Application.findFirst({
                where: { mahasiswa_id: userId },
                include: {
                    examiners: {
                        include: {
                            dosen: {
                                select: { nama: true } 
                            }
                        }
                    }
                }
            });

            if (!taApp) {
                return res.status(200).json({ status: 'belum_mendaftar' });
            }

            res.status(200).json(taApp);
        } catch (error) {
            console.error("Error fetching TA data:", error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    else if (req.method === 'POST') {
        const form = formidable({ multiples: true });
        
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ message: 'Error parsing form' });

            const transkripFile = files.transkrip ? files.transkrip[0] : null;
            const uktFile = files.ukt ? files.ukt[0] : null;

            if (!transkripFile || !uktFile) {
                return res.status(400).json({ message: 'Kedua file (Transkrip & Bukti UKT) wajib diunggah.' });
            }

            try {
                const transkripName = `${userId}-transkrip-${Date.now()}-${transkripFile.originalFilename}`;
                const transkripContent = fs.readFileSync(transkripFile.filepath);
                await supabase.storage.from('dokumen-ta').upload(transkripName, transkripContent, { contentType: transkripFile.mimetype, upsert: true });
                const { data: transkripData } = supabase.storage.from('dokumen-ta').getPublicUrl(transkripName);

                const uktName = `${userId}-ukt-${Date.now()}-${uktFile.originalFilename}`;
                const uktContent = fs.readFileSync(uktFile.filepath);
                await supabase.storage.from('dokumen-ta').upload(uktName, uktContent, { contentType: uktFile.mimetype, upsert: true });
                const { data: uktData } = supabase.storage.from('dokumen-ta').getPublicUrl(uktName);

                const existingApp = await prisma.tA_Application.findFirst({ where: { mahasiswa_id: userId } });

                let result;
                if (existingApp) {
                    result = await prisma.tA_Application.update({
                        where: { id: existingApp.id },
                        data: {
                            transcript_url: transkripData.publicUrl,
                            payment_proof_url: uktData.publicUrl,
                            requirements_status: 'menunggu_validasi',
                            requirements_feedback: null 
                        }
                    });
                } else {
                    result = await prisma.tA_Application.create({
                        data: {
                            mahasiswa_id: userId,
                            transcript_url: transkripData.publicUrl,
                            payment_proof_url: uktData.publicUrl,
                            requirements_status: 'menunggu_validasi'
                        }
                    });
                }

                res.status(200).json(result);

            } catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Gagal mengunggah dokumen.' });
            }
        });
    } 
    
    else {
        res.status(405).end();
    }
}