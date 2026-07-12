// pages/api/mahasiswa/ta/proposal.js
import { formidable } from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma'; // Pastikan path ini benar (3 level naik)

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

    if (req.method === 'POST') {
        const form = formidable({ multiples: false });

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ message: 'Error parsing form' });

            const title = fields.title ? fields.title[0] : '';
            const file = files.file ? files.file[0] : null;

            if (!title || !file) {
                return res.status(400).json({ message: 'Judul dan File Proposal wajib diisi.' });
            }

            try {
                // 1. Cek dulu apakah persyaratan sudah VALID
                const existingApp = await prisma.tA_Application.findFirst({
                    where: { mahasiswa_id: userId }
                });

                if (!existingApp || existingApp.requirements_status !== 'valid') {
                    return res.status(403).json({ message: 'Persyaratan administrasi belum divalidasi.' });
                }

                // 2. Upload ke Supabase
                const fileName = `${userId}-proposal-${Date.now()}-${file.originalFilename}`;
                const fileContent = fs.readFileSync(file.filepath);
                
                const { error: uploadError } = await supabase.storage
                    .from('dokumen-ta')
                    .upload(fileName, fileContent, { contentType: file.mimetype, upsert: true });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from('dokumen-ta').getPublicUrl(fileName);

                // 3. Update Database
                await prisma.tA_Application.update({
                    where: { id: existingApp.id },
                    data: {
                        proposal_title: title,
                        proposal_file_url: urlData.publicUrl,
                        proposal_status: 'menunggu_persetujuan',
                        // Reset approval jika upload ulang (revisi)
                        approved_by_kaprodi: false,
                        approved_by_panitia: false
                    }
                });

                res.status(200).json({ message: 'Proposal berhasil diajukan.' });

            } catch (error) {
                console.error("Upload Proposal Error:", error);
                res.status(500).json({ message: 'Gagal mengunggah proposal.' });
            }
        });
    } else {
        res.status(405).end();
    }
}