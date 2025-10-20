// components/kaprodi/KaprodiDashboard.js
import { useEffect, useState } from 'react';
import { UserPlus, Mail } from 'lucide-react';

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

export default function KaprodiDashboard() {
    const [data, setData] = useState({ waitingAssignment: 0, documentCount: 0, prodi: { nama: '...' } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/kaprodi/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Ketua Program Studi</h1>
            <p className="text-gray-600 mb-6">
                Menampilkan data untuk Program Studi: <span className="font-medium">{data.prodi?.nama}</span>
            </p>
            {loading ? <p>Memuat statistik...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
                    <StatCard 
                        icon={UserPlus} 
                        label="Pengajuan Menunggu Penugasan" 
                        value={data.waitingAssignment} 
                        color={{ bg: 'bg-purple-100', text: 'text-purple-600' }} 
                    />
                    <StatCard 
                        icon={Mail} 
                        label="Total Dokumen Diterima" 
                        value={data.documentCount} 
                        color={{ bg: 'bg-orange-100', text: 'text-orange-600' }} 
                    />
                </div>
            )}
        </div>
    );
}