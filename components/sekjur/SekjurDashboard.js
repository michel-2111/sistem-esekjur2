// components/sekjur/SekjurDashboard.js
import { useEffect, useState } from 'react';
import { BadgeCheck, ClipboardList } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full ${color.bg}`}>
            <Icon className={`h-8 w-8 ${color.text}`} />
        </div>
        <div className="ml-4">
            <p className="text-gray-600">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    </div>
);

export default function SekjurDashboard() {
    const [data, setData] = useState({ waitingVerification: 0, waitingRecap: 0, jurusan: { nama: '...' } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sekjur/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Sekretaris Jurusan</h1>
            <p className="text-gray-900 mb-6">
                Menampilkan data untuk Jurusan: <span className="font-medium">{data.jurusan?.nama}</span>
            </p>
            {loading ? <p>Memuat statistik...</p> : (
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
            )}
        </div>
    );
}