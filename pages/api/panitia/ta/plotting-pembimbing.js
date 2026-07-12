import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;
    if (!auth_token) return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (!decoded.roles.includes('panitia') && decoded.selectedRole !== 'panitia') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const panitia = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { jurusan_id: true }
        });

        if (!panitia?.jurusan_id) {
            return res.status(400).json({ message: 'Data panitia tidak valid.' });
        }

        const jurusanId = panitia.jurusan_id;

        if (req.method === 'GET') {
            const applications = await prisma.tA_Application.findMany({
                where: {
                    mahasiswa: { jurusan_id: jurusanId },
                    proposal_status: 'disetujui'
                },
                include: {
                    mahasiswa: { select: { id: true, nama: true, identifier: true } }
                },
                orderBy: { updated_at: 'desc' }
            });

            const supervisors = await prisma.tA_Supervisor.findMany({
                where: { mahasiswa: { jurusan_id: jurusanId } },
                include: { dosen: { select: { id: true, nama: true } } },
                orderBy: { id: 'asc' }
            });

            const lecturers = await prisma.user.findMany({
                where: {
                    jurusan_id: jurusanId,
                    roles: { some: { role: { nama_role: 'dosen' } } }
                },
                select: { id: true, nama: true },
                orderBy: { nama: 'asc' }
            });

            const data = applications.map(app => {
                const spvs = supervisors.filter(s => s.mahasiswa_id === app.mahasiswa.id);
                return {
                    app_id: app.id,
                    mahasiswa_id: app.mahasiswa.id,
                    proposal_title: app.proposal_title,
                    mahasiswa: app.mahasiswa,
                    supervisors: spvs
                };
            });

            return res.status(200).json({ data, lecturers });
        }

        if (req.method === 'POST') {
            const { mahasiswa_id, dosen_ids } = req.body;

            if (!mahasiswa_id || !Array.isArray(dosen_ids) || dosen_ids.length === 0) {
                return res.status(400).json({ message: 'Data tidak valid.' });
            }

            const mahasiswaIdNum = Number(mahasiswa_id);
            const dosenIdsNum = dosen_ids.map(Number);

            const checkApproval = await prisma.tA_Supervisor.findFirst({
                where: { mahasiswa_id: mahasiswaIdNum, status_kajur: 'disetujui' }
            });

            if (checkApproval) {
                return res.status(403).json({ message: 'Gagal! Plotting ini sudah disetujui Kajur dan tidak dapat diubah lagi.' });
            }

            await prisma.$transaction(async (tx) => {
                const existingSpv = await tx.tA_Supervisor.findMany({
                    where: { mahasiswa_id: mahasiswaIdNum }
                });

                const existingDosenIds = existingSpv.map(s => s.dosen_id);

                const toDeleteIds = existingSpv
                    .filter(s => !dosenIdsNum.includes(s.dosen_id))
                    .map(s => s.id);

                const toAddDosenIds = dosenIdsNum.filter(id => !existingDosenIds.includes(id));

                if (toDeleteIds.length > 0) {
                    await tx.tA_Supervisor.deleteMany({
                        where: { id: { in: toDeleteIds } }
                    });
                }

                if (toAddDosenIds.length > 0) {
                    await tx.tA_Supervisor.createMany({
                        data: toAddDosenIds.map(id => ({
                            mahasiswa_id: mahasiswaIdNum,
                            dosen_id: id,
                            status_kajur: 'menunggu_persetujuan'
                        }))
                    });
                }

                await tx.tA_Supervisor.updateMany({
                    where: { mahasiswa_id: mahasiswaIdNum },
                    data: { status_kajur: 'menunggu_persetujuan' }
                });
            });

            return res.status(200).json({ message: 'Pembimbing berhasil diupdate.' });
        }

        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}