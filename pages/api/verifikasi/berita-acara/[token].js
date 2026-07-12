import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { token } = req.query;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (!token) {
        return res.status(400).json({ message: 'Token tidak valid' });
    }

    try {
        const examinerData = await prisma.tA_Examiner.findUnique({
            where: { berita_acara_token: token },
            include: {
                dosen: { select: { nama: true, identifier: true } },
                ta_application: {
                    select: {
                        proposal_title: true,
                        exam_date: true,
                        mahasiswa: {
                            select: { nama: true, identifier: true, prodi: { select: { nama: true } } }
                        }
                    }
                },
                grades: {
                    include: { component: { select: { nama: true, bobot: true } } }
                }
            }
        });

        if (!examinerData) {
            return res.status(404).json({ message: 'Dokumen tidak ditemukan atau token tidak valid.' });
        }

        let totalNilai = 0;
        examinerData.grades.forEach(grade => {
            totalNilai += (grade.score * grade.component.bobot) / 100;
        });

        return res.status(200).json({
            status: 'valid',
            waktu_penilaian: examinerData.waktu_penilaian,
            dosen: examinerData.dosen,
            peran: examinerData.peran,
            mahasiswa: examinerData.ta_application.mahasiswa,
            judul_proposal: examinerData.ta_application.proposal_title,
            tanggal_ujian: examinerData.ta_application.exam_date,
            catatan: examinerData.catatan_revisi,
            total_nilai: totalNilai.toFixed(2)
        });

    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}