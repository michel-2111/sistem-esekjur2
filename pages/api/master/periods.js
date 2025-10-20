// pages/api/master/periods.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Untuk sekarang, kita ambil periode pertama yang kita temukan.
            // Nanti bisa dikembangkan untuk mencari yang benar-benar aktif.
            const activePeriod = await prisma.academic_Period.findFirst({
                orderBy: { start_date: 'desc' }
            });

            if (!activePeriod) {
                return res.status(404).json({ message: "Tidak ada periode akademik yang ditemukan." });
            }
            res.status(200).json(activePeriod);
        } catch (error) {
            res.status(500).json({ message: "Gagal mengambil data periode." });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}