// pages/login.js
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Link from 'next/link';
import { BookOpenCheck, LogIn as LoginIcon } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAppContext();
    const [roles, setRoles] = useState([]); // State untuk menyimpan daftar peran
    const [role, setRole] = useState('mahasiswa');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Mengambil daftar peran dari API saat komponen dimuat
    useEffect(() => {
        fetch('/api/master/roles')
            .then(res => res.json())
            .then(data => setRoles(data))
            .catch(err => console.error("Failed to fetch roles:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal untuk login');
            login(data.user);
        } catch (err) {
            setError(err.message);
        }
    };
    
    const identifierLabel = role === 'Mahasiswa' ? 'NIM' : 'NIP';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <BookOpenCheck className="mx-auto h-12 w-12 text-blue-600" />
                    <h1 className="text-2xl font-bold mt-2">Sistem Esekjur</h1>
                    <p>Silakan login untuk melanjutkan</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Login Sebagai</label>
                        <select id="role" value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                            {roles.map(r => (
                                <option key={r.id} value={r.nama_role} className="capitalize">{r.nama_role}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">{identifierLabel}</label>
                        <input type="text" id="identifier" value={identifier} onChange={e => setIdentifier(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <LoginIcon className="h-5 w-5 mr-2" /> Login
                    </button>
                    <p className="text-center text-sm">
                        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Belum punya akun? Daftar di sini
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}