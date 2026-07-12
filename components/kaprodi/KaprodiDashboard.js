// components/kaprodi/KaprodiDashboard.js
import { useEffect, useState } from 'react';
import { UserPlus, Mail, BookOpen } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
        <div className={`p-3 rounded-xl shrink-0 ${accent.bg}`}>
            <Icon className={`h-6 w-6 ${accent.text}`} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-1 leading-snug">{label}</p>
            <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
        </div>
    </div>
);

const Skeleton = ({ className }) => (
    <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />
);

export default function KaprodiDashboard() {
    const [data, setData]       = useState({ waitingAssignment: 0, documentCount: 0, prodi: { nama: '' } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/kaprodi/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const STATS = [
        {
            icon:   UserPlus,
            label:  'Pengajuan Menunggu Penugasan',
            value:  data.waitingAssignment,
            accent: { bg: 'bg-violet-50', text: 'text-violet-600' },
        },
        {
            icon:   Mail,
            label:  'Total Dokumen Diterima',
            value:  data.documentCount,
            accent: { bg: 'bg-orange-50', text: 'text-orange-600' },
        },
    ];

    return (
        <div className="space-y-6 p-1">
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Portal Akademik</p>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Ketua Program Studi</h1>
            </div>

            {!loading && data.prodi?.nama && (
                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <BookOpen className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Program Studi:</span>
                    <span className="text-sm font-semibold text-slate-800">{data.prodi.nama}</span>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STATS.map(s => <StatCard key={s.label} {...s} />)}
                </div>
            )}
        </div>
    );
}