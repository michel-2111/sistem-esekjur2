// pages/verifikasi-cuti.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import LeaveVerificationModal from '../components/kajur/LeaveVerificationModal';
import StatusView from '../components/mahasiswa/StatusView';
import { ClipboardList } from 'lucide-react';

export default function VerifikasiCutiPage() {
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

        const userRole = user?.selectedRole;
        if (userRole === 'kajur' || userRole === 'wadir') {
            const apiEndpoint = userRole === 'kajur' ? '/api/kajur/verifikasi-cuti' : '/api/wadir/verifikasi-cuti';
            
            fetch(apiEndpoint)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setApplications(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, router, user]);

    const handleUpdate = (appId) => {
        setApplications(prev => prev.filter(app => app.id !== appId));
    };
    
    const allowedRoles = ['kajur', 'wadir'];
    if (!user || !allowedRoles.includes(user.selectedRole)) {
        return <Layout><p>Anda tidak memiliki akses ke halaman ini.</p></Layout>;
    }
    if (loading) return <Layout><p>Loading...</p></Layout>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Verifikasi Pengajuan Cuti</h1>
            {applications.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Mahasiswa</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Prodi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Durasi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {applications.map(app => (
                                <tr key={app.id}>
                                    <td className="px-6 py-4 text-sm text-gray-900">{app.mahasiswa.nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{app.mahasiswa.prodi.nama}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{app.durasi}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => setSelectedApp(app)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                                            Lihat & Verifikasi
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <StatusView message="Tidak ada pengajuan cuti yang perlu diverifikasi." icon={ClipboardList} />
            )}
            {selectedApp && (
                <LeaveVerificationModal 
                    application={selectedApp} 
                    userRole={user.selectedRole}
                    onClose={() => setSelectedApp(null)} 
                    onUpdate={handleUpdate} 
                />
            )}
        </Layout>
    );
}