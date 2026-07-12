import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        if (!decoded.roles.includes('dosen') && decoded.selectedRole !== 'dosen') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const myExams = await prisma.tA_Examiner.findMany({
            where: {
                dosen_id: decoded.id
            },
            include: {
                ta_application: {
                    select: {
                        id: true,
                        proposal_title: true,
                        proposal_file_url: true,
                        exam_date: true,
                        exam_room: true,
                        mahasiswa: {
                            select: { nama: true, identifier: true, prodi: { select: { nama: true } } }
                        }
                    }
                }
            },
            orderBy: {
                ta_application: { exam_date: 'asc' } 
            }
        });

        const formattedData = myExams.map(exam => ({
            id: exam.id,
            appId: exam.ta_application.id,
            peran: exam.peran, 
            status_penilaian: exam.status_penilaian,
            berita_acara_token: exam.berita_acara_token,
            mahasiswa: exam.ta_application.mahasiswa.nama,
            nim: exam.ta_application.mahasiswa.identifier,
            prodi: exam.ta_application.mahasiswa.prodi?.nama || '-',
            judul: exam.ta_application.proposal_title,
            file_url: exam.ta_application.proposal_file_url,
            tanggal: exam.ta_application.exam_date,
            ruangan: exam.ta_application.exam_room
        }));

        return res.status(200).json(formattedData);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}