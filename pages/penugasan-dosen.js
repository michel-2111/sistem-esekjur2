// pages/penugasan-dosen.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import AssignmentModal from '../components/kaprodi/AssignmentModal'; // <-- Impor modal baru
import StatusView from '../components/mahasiswa/StatusView';
import { ClipboardX, UserPlus } from 'lucide-react';

export default function PenugasanDosenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [dosenList, setDosenList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null); // State untuk modal

    const fetchData = async () => {
        setLoading(true);
        try {
            const [appRes, dosenRes] = await Promise.all([
                fetch('/api/kaprodi/penugasan'),
                fetch('/api/master/dosen')
            ]);
            const appData = await appRes.json();
            const dosenData = await dosenRes.json();
            setApplications(appData);
            setDosenList(dosenData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else fetchData();
    }, [isAuthenticated, router]);

    const handleSaveSuccess = (appId) => {
        // Hapus aplikasi dari daftar setelah berhasil disimpan
        setApplications(prev => prev.filter(app => app.id !== appId));
    };
    
    if (!user || user.selectedRole !== 'kaprodi') {
        return <Layout><p>Hanya Kaprodi yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Penugasan Dosen</h1>
            {/* Di sini bisa ditambahkan nama prodi jika perlu */}
            <p className="text-gray-600 mb-6">Menampilkan pengajuan dari Program Studi Anda.</p>

            {loading ? <p>Memuat data...</p> : (
                <>
                    {applications.length > 0 ? (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mahasiswa</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah Diajukan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {applications.map(app => (
                                        <tr key={app.id}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{app.mahasiswa.nama}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <ul className="list-disc list-inside">
                                                    {app.application_courses.map(({ course }) => (
                                                        <li key={course.id}>{course.nama}</li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button onClick={() => setSelectedApp(app)} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                                                    <UserPlus size={16} className="mr-2"/>
                                                    Tugaskan Dosen
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <StatusView 
                            message="Tidak ada pengajuan yang memerlukan penugasan dosen saat ini."
                            icon={ClipboardX} 
                        />
                    )}
                </>
            )}

            {/* Render Modal jika ada aplikasi yang dipilih */}
            {selectedApp && (
                <AssignmentModal
                    application={selectedApp}
                    dosenList={dosenList}
                    onClose={() => setSelectedApp(null)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </Layout>
    );
}