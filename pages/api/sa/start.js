// pages/api/sa/start.js
import { formidable } from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ANON_KEY,
);

// Disable Next.js's default body parser to allow formidable to handle the stream
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { auth_token } = req.cookies;
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const form = formidable({});
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(500).json({ message: 'Error parsing form data.' });
            }

            const file = files.file[0];
            const periodId = fields.periodId[0];

            if (!file || !periodId) {
                return res.status(400).json({ message: 'File or period ID is missing.' });
            }

            try {
                // 1. Read the file from its temporary path
                const fileContent = fs.readFileSync(file.filepath);
                const fileName = `${userId}-${Date.now()}-${file.originalFilename}`;

                // 2. Upload the file to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('bukti-pembayaran')
                    .upload(fileName, fileContent, {
                        contentType: file.mimetype,
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                // 3. Get the public URL of the uploaded file
                const { data: { publicUrl } } = supabase.storage.from('bukti-pembayaran').getPublicUrl(fileName);

                // 4. Create the application record in the database with the real URL
                const newApplication = await prisma.sA_Application.create({
                    data: {
                        mahasiswa_id: userId,
                        period_id: periodId,
                        status: 'menunggu_verifikasi_pembayaran',
                        tanggal_pembayaran: new Date(),
                        bukti_pembayaran_url: publicUrl, // Use the real URL
                    }
                });

                return res.status(201).json(newApplication);

            } catch (error) {
                console.error("Upload/DB Error:", error);
                return res.status(500).json({ message: 'Failed to process application.' });
            }
        });

    } catch (error) {
        console.error("Auth Error:", error);
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}