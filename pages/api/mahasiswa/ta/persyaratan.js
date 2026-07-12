import prisma from '../../../../lib/prisma';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

export const config = {
    api: {
        bodyParser: false,
    },
};

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    let decoded;
    try {
        decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ message: 'Token invalid' });
    }

    const mahasiswaId = decoded.id;
    const jurusanId = decoded.jurusan_id || decoded.jurusanId;

    if (req.method === 'GET') {
        try {
            const requirements = await prisma.tA_Document_Requirement.findMany({
                where: { jurusan_id: jurusanId, is_active: true },
                orderBy: { id: 'asc' },
            });

            const application = await prisma.tA_Application.findFirst({
            where: { mahasiswa_id: mahasiswaId },
            include: { 
                documents: {
                    include: { requirement: true }
                },
                examiners: {                     
                    include: { 
                        dosen: true,
                        grades: {
                            include: { component: true }
                        }
                    }
                }
            }
        });

            return res.status(200).json({ requirements, application });
        } catch (error) {
            console.error("GET Error:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    if (req.method === 'POST') {
        const form = formidable({ multiples: true, keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error("Formidable Error:", err);
                return res.status(500).json({ message: 'Gagal memproses file upload' });
            }

            try {
                const submittedDocuments = [];

                for (const key in files) {
                    if (key.startsWith('file_')) {
                        const requirement_id = parseInt(key.replace('file_', ''));

                        const file = Array.isArray(files[key]) ? files[key][0] : files[key];

                        const fileContent = fs.readFileSync(file.filepath);
                        
                        const fileName = `syarat_ta_${mahasiswaId}_req_${requirement_id}_${Date.now()}.pdf`;

                        const { data: uploadData, error: uploadError } = await supabase.storage
                            .from('dokumen-ta') 
                            .upload(fileName, fileContent, {
                                contentType: file.mimetype || 'application/pdf',
                                upsert: false
                            });

                        if (uploadError) {
                            console.error("Supabase Upload Error:", uploadError);
                            throw new Error('Gagal upload ke Supabase');
                        }

                        const { data: publicUrlData } = supabase.storage
                            .from('dokumen-ta')
                            .getPublicUrl(fileName);

                        submittedDocuments.push({
                            requirement_id: requirement_id,
                            file_url: publicUrlData.publicUrl
                        });
                    }
                }

                if (submittedDocuments.length === 0) {
                    return res.status(400).json({ message: 'Tidak ada dokumen valid yang dikirim.' });
                }

                await prisma.$transaction(async (tx) => {
                    let application = await tx.tA_Application.findFirst({
                        where: { mahasiswa_id: mahasiswaId }
                    });

                    if (!application) {
                        application = await tx.tA_Application.create({
                            data: { 
                                mahasiswa_id: mahasiswaId,
                                requirements_status: 'pending' 
                            }
                        });
                    } else {
                        await tx.tA_Application.update({
                            where: { id: application.id },
                            data: { requirements_status: 'pending' }
                        });
                    }

                    for (const doc of submittedDocuments) {
                        await tx.tA_Document_Submission.upsert({
                            where: {
                                ta_application_id_requirement_id: {
                                    ta_application_id: application.id,
                                    requirement_id: doc.requirement_id
                                }
                            },
                            update: {
                                file_url: doc.file_url,
                                status: 'pending',
                                feedback: null 
                            },
                            create: {
                                ta_application_id: application.id,
                                requirement_id: doc.requirement_id,
                                file_url: doc.file_url,
                                status: 'pending'
                            }
                        });
                    }
                });

                return res.status(200).json({ message: 'Persyaratan berhasil dikirim!' });

            } catch (error) {
                console.error("POST Processing Error:", error);
                return res.status(500).json({ message: error.message || 'Internal Server Error' });
            }
        });
        
        return;
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}