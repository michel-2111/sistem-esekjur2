import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { auth_token } = req.cookies;

    if (!auth_token) {
        return res.status(401).json({ message: 'Tidak ada sesi aktif' });
    }

    try {
        // Dekripsi token JWT
        const decoded = jwt.verify(auth_token, process.env.JWT_SECRET);
        
        // Kembalikan data user ke frontend
        return res.status(200).json({ user: decoded });
    } catch (error) {
        // Token tidak valid atau sudah kadaluarsa
        return res.status(401).json({ message: 'Sesi tidak valid' });
    }
}