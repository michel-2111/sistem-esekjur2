// pages/daftar-cuti.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { FileDown } from 'lucide-react';
import StatusView from '../components/mahasiswa/StatusView';
import { ClipboardList } from 'lucide-react';

export default function DaftarCutiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [leaveList, setLeaveList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        const allowedRoles = ['sekjur', 'kajur'];
        if (user && allowedRoles.includes(user.selectedRole)) {
            fetch('/api/jurusan/mahasiswa-cuti')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setLeaveList(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, router, user]);

    const handleExport = () => {
        if (leaveList.length === 0) {
            alert('Tidak ada data untuk diekspor.');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "NIM,Nama Mahasiswa,Program Studi,Durasi Cuti\r\n";

        leaveList.forEach(app => {
            const row = [
                app.mahasiswa.identifier,
                app.mahasiswa.nama,
                app.mahasiswa.prodi.nama,
                `"${app.durasi}"` // Pakai kutip untuk menangani koma di dalam string durasi
            ].join(",");
            csvContent += row + "\r\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "daftar_mahasiswa_cuti.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const allowedRoles = ['sekjur', 'kajur'];
    if (loading) return <Layout><p>Loading...</p></Layout>;
    if (!user || !allowedRoles.includes(user.selectedRole)) {
        return <Layout><p>Anda tidak memiliki akses ke halaman ini.</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Daftar Mahasiswa Cuti</h1>
            {leaveList.length > 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleExport} className="flex items-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md text-sm">
                            <FileDown size={16} className="mr-2" /> Export ke Excel
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900">
                                <tr>
                                    <th className="p-3">NIM</th>
                                    <th className="p-3">Nama Mahasiswa</th>
                                    <th className="p-3">Program Studi</th>
                                    <th className="p-3">Durasi Cuti</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {leaveList.map(app => (
                                    <tr key={app.id}>
                                        <td className="p-3 text-gray-900">{app.mahasiswa.identifier}</td>
                                        <td className="p-3 font-medium text-gray-900">{app.mahasiswa.nama}</td>
                                        <td className="p-3 text-gray-900">{app.mahasiswa.prodi.nama}</td>
                                        <td className="p-3 text-gray-900">{app.durasi}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <StatusView message="Tidak ada mahasiswa yang sedang cuti di jurusan ini." icon={ClipboardList} />
            )}
        </Layout>
    );
}