// pages/api/sekjur/dokumen.js
import { formidable } from 'formidable';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export const config = {
    api: {
        bodyParser: false,
    },
};

const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
};

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    let decoded;
    try {
        decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

    if (decoded.selectedRole !== 'sekjur') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.method === 'GET') {
        try {
            const [templates, sentDocuments, recipients] = await Promise.all([
                prisma.document_Template.findMany({ orderBy: { title: 'asc' } }),
                prisma.document.findMany({ where: { sender_id: decoded.id }, include: { recipients: { include: { user: { select: { nama: true } } } } }, orderBy: { timestamp: 'desc' } }),
                prisma.user.findMany({ where: { roles: { some: { role: { nama_role: { in: ['dosen', 'kaprodi', 'kajur', 'wadir', 'p4m'] } } } } }, select: { id: true, nama: true, roles: { include: { role: true } } }, orderBy: { nama: 'asc' } })
            ]);
            return res.status(200).json({ templates, sentDocuments, recipients });
        } catch (error) {
            return res.status(500).json({ message: "Gagal mengambil data." });
        }
    }

    if (req.method === 'POST') {
        try {
            const { fields, files } = await parseForm(req);
            const action = fields.action ? fields.action[0] : 'CREATE';
            const file = files.file[0];

            if (!file) {
                return res.status(400).json({ message: 'File tidak ditemukan.' });
            }

            const fileContent = fs.readFileSync(file.filepath);
            const fileName = `${decoded.id}-${Date.now()}-${file.originalFilename}`;
            
            const { error: uploadError } = await supabase.storage.from('dokumen-sistem').upload(fileName, fileContent, { contentType: file.mimetype });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('dokumen-sistem').getPublicUrl(fileName);

            if (action === 'UPDATE_TEMPLATE') {
                const templateId = fields.templateId[0];
                const updatedTemplate = await prisma.document_Template.update({
                    where: { id: templateId },
                    data: { file_url: publicUrl }
                });
                return res.status(200).json({ type: 'template', data: updatedTemplate });
            }

            if (action === 'CREATE') {
                const title = fields.title[0];
                const isTemplate = fields.isTemplate[0] === 'true';
                if (isTemplate) {
                    const templateType = fields.templateType[0];
                    const newTemplate = await prisma.document_Template.create({ data: { id: `TPL_${Date.now()}`, title, file_url: publicUrl, type: templateType, uploader_id: decoded.id } });
                    return res.status(201).json({ type: 'template', data: newTemplate });
                } else {
                    const recipientIds = JSON.parse(fields.recipientIds[0]);
                    const newDocument = await prisma.document.create({ data: { title, file_url: publicUrl, sender_id: decoded.id, recipients: { create: recipientIds.map(id => ({ user_id: id })) } }, include: { recipients: { include: { user: { select: { nama: true } } } } } });
                    return res.status(201).json({ type: 'document', data: newDocument });
                }
            }

            return res.status(400).json({ message: 'Aksi tidak dikenal.' });

        } catch (error) {
            console.error("Document POST Error:", error);
            return res.status(500).json({ message: 'Gagal memproses file.', details: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}