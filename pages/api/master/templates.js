// pages/api/master/templates.js
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();
    const { type } = req.query;
    if (!type) return res.status(400).json({ message: 'Tipe template dibutuhkan.' });

    try {
        const template = await prisma.document_Template.findFirst({ where: { type } });
        if (!template) return res.status(404).json({ message: 'Template tidak ditemukan.' });
        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}