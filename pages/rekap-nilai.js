// pages/rekap-nilai.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { FileDown, CheckSquare } from 'lucide-react';
import ConfirmationModal from '../components/shared/ConfirmationModal';

export default function RekapNilaiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sekjur/rekap-nilai');
            const data = await res.json();
            if (res.ok) {
                setApplications(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (user?.selectedRole === 'sekjur') {
            fetchData();
        }
    }, [isAuthenticated, router, user]);

    const handleExport = () => {
        if (applications.length === 0) return;
        let csvContent = "data:text/csv;charset=utf-8,NIM,Nama Mahasiswa,Mata Kuliah,Nilai\r\n";
        applications.forEach(app => {
            app.application_courses.forEach(ac => {
                const row = [app.mahasiswa.identifier, app.mahasiswa.nama, ac.course.nama, ac.nilai].join(",");
                csvContent += row + "\r\n";
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rekap_nilai_sa.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFinalizeAll = () => {
        if (applications.length === 0) return;
        setIsConfirmModalOpen(true);
    };

    const confirmFinalize = async () => {
        setIsConfirmModalOpen(false); // Tutup modal dulu
        const applicationIds = applications.map(app => app.id);
        try {
            const res = await fetch('/api/sekjur/rekap-nilai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationIds }),
            });
            if (!res.ok) throw new Error('Gagal memfinalisasi nilai.');
            fetchData(); // Refresh data
        } catch (error) {
            alert(error.message);
        }
    };

    if (loading) return <Layout><p>Loading...</p></Layout>;
    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p>Hanya Sekjur yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <>
            <Layout>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Rekapitulasi Nilai</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 text-gray-800">
                        <h2 className="text-xl font-bold">Mahasiswa Siap Rekapitulasi</h2>
                        <div className="flex space-x-2">
                            <button onClick={handleFinalizeAll} disabled={applications.length === 0} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md text-sm disabled:bg-gray-400">
                                <CheckSquare size={16} className="mr-2" /> Rekap Semua Nilai
                            </button>
                            <button onClick={handleExport} disabled={applications.length === 0} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm disabled:bg-gray-400">
                                <FileDown size={16} className="mr-2" /> Export ke Excel
                            </button>
                        </div>
                    </div>
                    {loading ? (
                        <p>Memuat data...</p>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="p-3">Nama Mahasiswa</th>
                                    <th className="p-3">NIM</th>
                                    <th className="p-3">Mata Kuliah & Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {applications.length > 0 ? (
                                    applications.map(app => (
                                        <tr key={app.id}>
                                            <td className="p-3 font-medium text-gray-900">{app.mahasiswa.nama}</td>
                                            <td className="p-3 text-gray-900">{app.mahasiswa.identifier}</td>
                                            <td className="p-3 text-gray-900">
                                                <ul className="space-y-1">
                                                    {app.application_courses.map(ac => (
                                                        <li key={ac.course.id} className="flex justify-between">
                                                            <span>{ac.course.nama}</span>
                                                            <span className="font-bold">{ac.nilai}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-10 text-gray-500">
                                            Tidak ada nilai yang perlu direkapitulasi saat ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </Layout>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmFinalize}
                title="Konfirmasi Finalisasi Nilai"
                confirmText="Ya, Finalisasi"
                confirmColor="bg-indigo-600 hover:bg-indigo-700"
            >
                Anda yakin ingin memfinalisasi semua nilai? Aksi ini tidak dapat dibatalkan.
            </ConfirmationModal>
        </>
    );
}