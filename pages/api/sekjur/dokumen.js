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

    // decoded.id dari JWT bisa saja string, pastikan selalu number
    const currentUserId = Number(decoded.id);

    if (req.method === 'GET') {
        try {
            const [templates, sentDocuments, recipients] = await Promise.all([
                prisma.document_Template.findMany({ orderBy: { title: 'asc' } }),
                prisma.document.findMany({ where: { sender_id: currentUserId }, include: { recipients: { include: { user: { select: { nama: true } } } } }, orderBy: { timestamp: 'desc' } }),
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
            const uploadedFile = files.file ? files.file[0] : null;

            // File wajib untuk CREATE & UPDATE_TEMPLATE, opsional untuk UPDATE_DOCUMENT
            if (!uploadedFile && action !== 'UPDATE_DOCUMENT') {
                return res.status(400).json({ message: 'File tidak ditemukan.' });
            }

            let publicUrl = null;
            if (uploadedFile) {
                const fileContent = fs.readFileSync(uploadedFile.filepath);
                const fileName = `${currentUserId}-${Date.now()}-${uploadedFile.originalFilename}`;

                const { error: uploadError } = await supabase.storage.from('dokumen-sistem').upload(fileName, fileContent, { contentType: uploadedFile.mimetype });
                if (uploadError) throw uploadError;

                publicUrl = supabase.storage.from('dokumen-sistem').getPublicUrl(fileName).data.publicUrl;
            }

            if (action === 'UPDATE_TEMPLATE') {
                const templateId = fields.templateId[0]; // String, sesuai schema Document_Template.id
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
                    const newTemplate = await prisma.document_Template.create({ data: { id: `TPL_${Date.now()}`, title, file_url: publicUrl, type: templateType, uploader_id: currentUserId } });
                    return res.status(201).json({ type: 'template', data: newTemplate });
                } else {
                    const recipientIds = JSON.parse(fields.recipientIds[0]).map(Number);
                    const newDocument = await prisma.document.create({
                        data: {
                            title,
                            file_url: publicUrl,
                            sender_id: currentUserId,
                            recipients: { create: recipientIds.map(id => ({ user_id: id })) }
                        },
                        include: { recipients: { include: { user: { select: { nama: true } } } } }
                    });
                    return res.status(201).json({ type: 'document', data: newDocument });
                }
            }

            if (action === 'UPDATE_DOCUMENT') {
                const documentId = parseInt(fields.documentId[0], 10);
                const title = fields.title[0];
                const recipientIds = JSON.parse(fields.recipientIds[0]).map(Number);

                if (isNaN(documentId)) {
                    return res.status(400).json({ message: 'ID dokumen tidak valid.' });
                }

                // Pastikan dokumen ini milik sekjur yang login
                const existing = await prisma.document.findUnique({ where: { id: documentId } });
                if (!existing || existing.sender_id !== currentUserId) {
                    return res.status(403).json({ message: 'Anda tidak berhak mengubah dokumen ini.' });
                }

                const updatedDocument = await prisma.$transaction(async (tx) => {
                    // Ganti daftar penerima
                    await tx.document_Recipient.deleteMany({ where: { document_id: documentId } });

                    return tx.document.update({
                        where: { id: documentId },
                        data: {
                            title,
                            ...(publicUrl ? { file_url: publicUrl } : {}),
                            recipients: { create: recipientIds.map(id => ({ user_id: id })) },
                        },
                        include: { recipients: { include: { user: { select: { nama: true } } } } },
                    });
                });

                return res.status(200).json({ type: 'document', data: updatedDocument });
            }

            return res.status(400).json({ message: 'Aksi tidak dikenal.' });

        } catch (error) {
            console.error("Document POST Error:", error);
            return res.status(500).json({ message: 'Gagal memproses file.', details: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const documentId = parseInt(req.query.id, 10);
            if (!documentId || isNaN(documentId)) {
                return res.status(400).json({ message: 'ID dokumen tidak ditemukan atau tidak valid.' });
            }

            const existing = await prisma.document.findUnique({ where: { id: documentId } });
            if (!existing) return res.status(404).json({ message: 'Dokumen tidak ditemukan.' });
            if (existing.sender_id !== currentUserId) {
                return res.status(403).json({ message: 'Anda tidak berhak menghapus dokumen ini.' });
            }

            await prisma.$transaction([
                prisma.document_Recipient.deleteMany({ where: { document_id: documentId } }),
                prisma.document.delete({ where: { id: documentId } }),
            ]);

            // Hapus file dari storage (best-effort, tidak menggagalkan request jika error)
            try {
                const path = decodeURIComponent(existing.file_url.split('/dokumen-sistem/')[1]);
                if (path) await supabase.storage.from('dokumen-sistem').remove([path]);
            } catch (storageErr) {
                console.warn('Gagal menghapus file di storage:', storageErr.message);
            }

            return res.status(200).json({ message: 'Dokumen berhasil dihapus.' });
        } catch (error) {
            console.error("Document DELETE Error:", error);
            return res.status(500).json({ message: 'Gagal menghapus dokumen.', details: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}