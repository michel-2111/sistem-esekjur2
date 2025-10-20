// pages/manajemen-dosen.js
import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { Eye } from 'lucide-react';
import UserInfoModal from '../components/shared/UserInfoModal';

export default function ManajemenDosenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [data, setData] = useState({ lecturers: [], saCourses: [] });
    const [loading, setLoading] = useState(true);
    const [selectedDosen, setSelectedDosen] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.selectedRole === 'sekjur') {
            fetch('/api/sekjur/manajemen-dosen')
                .then(res => res.json())
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, router, user]);

    // Fungsi untuk menghitung total SKS per dosen
    const calculateSksForDosen = useCallback((dosenId) => {
        return data.saCourses
            .filter(course => course.dosen_id === dosenId)
            .reduce((total, course) => total + course.course.sks, 0);
    }, [data.saCourses]);

    if (loading) return <Layout><p>Loading...</p></Layout>;
    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p>Hanya Sekjur yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <>
            <Layout>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Manajemen Dosen & Honorarium</h1>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Rekapitulasi SKS Dosen (Periode SA Aktif)</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="p-3">Nama Dosen</th>
                                    <th className="p-3">NIP</th>
                                    <th className="p-3">Total SKS Diampu</th>
                                    <th className="p-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.lecturers.map(dosen => (
                                    <tr key={dosen.id}>
                                        <td className="p-3 font-medium text-gray-700">{dosen.nama}</td>
                                        <td className="p-3 text-gray-700">{dosen.identifier}</td>
                                        <td className="p-3 font-bold text-gray-900">{calculateSksForDosen(dosen.id)} SKS</td>
                                        <td className="p-3 ">
                                            <button 
                                                onClick={() => setSelectedDosen(dosen)} 
                                                className="flex items-center text-blue-600 hover:underline"
                                            >
                                                <Eye size={16} className="mr-1" /> Lihat Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.lecturers.length === 0 && (
                            <p className="text-center text-gray-500 py-6">Tidak ada dosen di jurusan ini.</p>
                        )}
                    </div>
                </div>
            </Layout>
            {selectedDosen && <UserInfoModal user={selectedDosen} onClose={() => setSelectedDosen(null)} />}
        </>
    );
}