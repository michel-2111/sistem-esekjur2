// pages/api/mahasiswa/cuti.js
import { formidable } from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

// Konfigurasi Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });
    const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const activePeriod = await prisma.academic_Period.findFirst({ orderBy: { start_date: 'desc' }});

    if (req.method === 'GET') {
        const leaveApplication = await prisma.leave_Application.findFirst({
            where: { mahasiswa_id: userId, period_id: activePeriod.id },
        });
        if (!leaveApplication) return res.status(404).json({ message: 'No application found' });
        return res.status(200).json(leaveApplication);
    }
    
    if (req.method === 'POST') {
        const form = formidable({});
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ message: 'Error parsing form' });

            const file = files.formFile[0];
            const durasi = fields.durasi[0];
            const filePath = file.filepath;
            const fileName = `${userId}-${Date.now()}-${file.originalFilename}`;
            
            try {
                const fileContent = fs.readFileSync(filePath);
                const { data, error } = await supabase.storage
                    .from('formulir-cuti')
                    .upload(fileName, fileContent, {
                        contentType: file.mimetype,
                        upsert: true,
                    });

                if (error) throw error;
                
                const { data: { publicUrl } } = supabase.storage.from('formulir-cuti').getPublicUrl(fileName);
                
                const newLeaveApp = await prisma.leave_Application.create({
                    data: {
                        mahasiswa_id: userId,
                        period_id: activePeriod.id,
                        form_url: publicUrl,
                        durasi,
                        status: 'menunggu_kajur',
                    }
                });

                return res.status(201).json(newLeaveApp);

            } catch (error) {
                console.error("Upload/DB Error:", error);
                return res.status(500).json({ message: 'Failed to process application.' });
            }
        });
    }
}