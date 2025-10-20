// pages/api/sekjur/verifikasi.js
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    const { auth_token } = req.cookies;

    if (!auth_token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        if (decoded.selectedRole !== 'sekjur') {
            return res.status(403).json({ message: 'Forbidden: Access is restricted to Sekjur' });
        }

        // Handle GET request: Ambil daftar pengajuan
        if (req.method === 'GET') {
            const applications = await prisma.sA_Application.findMany({
                where: {
                    status: 'menunggu_verifikasi_pembayaran',
                    mahasiswa: {
                        prodi: {
                            jurusan_id: decoded.jurusanId,
                        },
                    },
                },
                include: {
                    mahasiswa: {
                        select: {
                            nama: true,
                            identifier: true, // NIM
                        },
                    },
                },
                orderBy: {
                    tanggal_pembayaran: 'asc',
                },
            });
            return res.status(200).json(applications);
        }

        // Handle POST request: Proses persetujuan/penolakan
        if (req.method === 'POST') {
            const { applicationId, action, maxSks, alasanDitolak } = req.body;

            let dataToUpdate = {};
            if (action === 'approve') {
                if (!maxSks || maxSks <= 0) {
                    return res.status(400).json({ message: 'Jumlah SKS maksimal harus diisi.' });
                }
                dataToUpdate = {
                    status: 'menunggu_pengajuan_mk',
                    max_sks: parseInt(maxSks, 10),
                    alasan_ditolak: null,
                };
            } else if (action === 'reject') {
                if (!alasanDitolak) {
                    return res.status(400).json({ message: 'Alasan penolakan harus diisi.' });
                }
                dataToUpdate = {
                    status: 'pembayaran_ditolak',
                    alasan_ditolak: alasanDitolak,
                    max_sks: null,
                };
            } else {
                return res.status(400).json({ message: 'Aksi tidak valid.' });
            }

            const updatedApplication = await prisma.sA_Application.update({
                where: { id: applicationId },
                data: dataToUpdate,
            });

            return res.status(200).json(updatedApplication);
        }

        // Jika method bukan GET atau POST
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}