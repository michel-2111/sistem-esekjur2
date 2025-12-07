// components/sekjur/SekjurDashboard.js
import { useEffect, useState } from 'react';
import { BadgeCheck, ClipboardList, AlertCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full ${color.bg}`}>
            <Icon className={`h-8 w-8 ${color.text}`} />
        </div>
        <div className="ml-4">
            <p className="text-gray-600 text-sm">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    </div>
);

export default function SekjurDashboard() {
    const [data, setData] = useState({ 
        waitingVerification: 0, 
        waitingRecap: 0, 
        jurusan: { nama: '...' } 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/sekjur/dashboard', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Error: ${res.status}`);
            }
            
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Dashboard Sekretaris Jurusan
                </h1>
                <div className="flex items-center justify-center py-12">
                    <p className="text-gray-600">Memuat statistik...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Dashboard Sekretaris Jurusan
                </h1>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                        <div>
                            <p className="text-red-700 font-semibold">Error: {error}</p>
                            <button 
                                onClick={fetchDashboardData}
                                className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Dashboard Sekretaris Jurusan
            </h1>
            <p className="text-gray-900 mb-6">
                Menampilkan data untuk Jurusan: <span className="font-medium">{data.jurusan?.nama || '-'}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                <StatCard 
                    icon={BadgeCheck} 
                    label="Pembayaran Menunggu Verifikasi" 
                    value={data.waitingVerification} 
                    color={{ bg: 'bg-cyan-100', text: 'text-cyan-600' }} 
                />
                <StatCard 
                    icon={ClipboardList} 
                    label="Nilai Menunggu Rekapitulasi" 
                    value={data.waitingRecap} 
                    color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }} 
                />
            </div>
        </div>
    );
}