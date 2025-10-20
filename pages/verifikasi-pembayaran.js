// pages/verifikasi-pembayaran.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import VerificationModal from '../components/sekjur/VerificationModal'; // <-- IMPOR KOMPONEN BARU

export default function VerifikasiPembayaranPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        
        fetch('/api/sekjur/verifikasi')
            .then(res => res.json())
            .then(data => {
                setApplications(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [isAuthenticated, router]);

    const handleUpdate = (appId) => {
        setApplications(prev => prev.filter(app => app.id !== appId));
    };

    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p>Anda tidak memiliki akses ke halaman ini.</p></Layout>;
    }
    
    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Verifikasi Pembayaran Semester Antara</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                {loading ? <p>Memuat data...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-gray-900">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Mahasiswa</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIM</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Unggah</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.length > 0 ? applications.map(app => (
                                    <tr key={app.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{app.mahasiswa.nama}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{app.mahasiswa.identifier}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(app.tanggal_pembayaran).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => setSelectedApp(app)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                                                Lihat & Verifikasi
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">Tidak ada pengajuan yang perlu diverifikasi.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {selectedApp && <VerificationModal application={selectedApp} onClose={() => setSelectedApp(null)} onUpdate={handleUpdate} />}
        </Layout>
    );
}