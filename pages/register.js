// pages/register.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        nama: '',
        identifier: '', // NIM
        password: '',
        prodiId: '',
    });
    const [jurusanList, setJurusanList] = useState([]);
    const [selectedJurusan, setSelectedJurusan] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchJurusan = async () => {
            try {
                const res = await fetch('/api/master/jurusan');
                if (!res.ok) throw new Error('Gagal memuat data');
                const data = await res.json();
                setJurusanList(data);
            } catch (err) {
                setError('Tidak dapat memuat data jurusan & prodi.');
            } finally {
                setLoading(false);
            }
        };
        fetchJurusan();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleJurusanChange = (e) => {
        setSelectedJurusan(e.target.value);
        setFormData(prevState => ({ ...prevState, prodiId: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        if (!formData.nama || !formData.identifier || !formData.password || !formData.prodiId) {
            setError("Semua field wajib diisi.");
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            
            setSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login...');
            setTimeout(() => router.push('/login'), 2000);

        } catch (err) {
            setError(err.message || "Gagal melakukan registrasi.");
        }
    };
    
    const availableProdi = jurusanList.find(j => j.id === selectedJurusan)?.prodi || [];
    const inputClass = "mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-gray-900">
                <div className="text-center mb-8">
                    <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
                    <h1 className="text-2xl font-bold mt-2">Registrasi Mahasiswa</h1>
                </div>
                {loading ? <p>Loading...</p> : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" name="nama" onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">NIM</label>
                            <input type="text" name="identifier" onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jurusan</label>
                            <select value={selectedJurusan} onChange={handleJurusanChange} className={inputClass} required>
                                <option value="">-- Pilih Jurusan --</option>
                                {jurusanList.map(j => <option key={j.id} value={j.id}>{j.nama}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Studi</label>
                            <select name="prodiId" value={formData.prodiId} onChange={handleChange} className={`${inputClass} disabled:bg-gray-100`} disabled={!selectedJurusan} required>
                                <option value="">-- Pilih Program Studi --</option>
                                {availableProdi.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                            </select>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {success && <p className="text-sm text-green-600">{success}</p>}
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Daftar
                        </button>
                        <p className="text-center text-sm">
                            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sudah punya akun? Login</Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}