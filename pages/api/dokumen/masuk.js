import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const { auth_token } = req.cookies;
    if (!auth_token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const receivedDocuments = await prisma.document.findMany({
            where: {
                recipients: {
                    some: {
                        user_id: userId,
                    },
                },
            },
            include: {
                sender: { // Mengambil detail pengirim
                    select: {
                        nama: true,
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
        });

        res.status(200).json(receivedDocuments);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}