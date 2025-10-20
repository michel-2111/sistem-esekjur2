// components/wadir/WadirDashboard.js
import { useEffect, useState } from 'react';
import { FileCheck, Mail } from 'lucide-react';

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

export default function WadirDashboard() {
    const [data, setData] = useState({ leaveApplicationsCount: 0, documentCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/wadir/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard Wakil Direktur</h1>
            {loading ? <p>Memuat statistik...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard 
                        icon={FileCheck} 
                        label="Pengajuan Cuti Perlu Persetujuan" 
                        value={data.leaveApplicationsCount} 
                        color={{ bg: 'bg-teal-100', text: 'text-teal-600' }} 
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