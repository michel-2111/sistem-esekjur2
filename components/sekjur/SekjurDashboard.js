// components/sekjur/SekjurDashboard.js
import { useEffect, useState } from 'react';
import { BadgeCheck, ClipboardList, AlertCircle, RefreshCw, Building2 } from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center gap-5">
        <div className={`p-3 rounded-xl flex-shrink-0 ${accent.bg}`}>
            <Icon className={`h-6 w-6 ${accent.text}`} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-1 leading-snug">{label}</p>
            <p className="text-3xl font-bold text-slate-900 leading-none">{value}</p>
        </div>
    </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
    <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SekjurDashboard() {
    const [data, setData]       = useState({ waitingVerification: 0, waitingRecap: 0, jurusan: { nama: '' } });
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState('');

    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/sekjur/dashboard', {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(errorData.message || `Error: ${res.status}`);
            }
            setData(await res.json());
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const STATS = [
        {
            icon:   BadgeCheck,
            label:  'Pembayaran Menunggu Verifikasi',
            value:  data.waitingVerification,
            accent: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
        },
        {
            icon:   ClipboardList,
            label:  'Nilai Menunggu Rekapitulasi',
            value:  data.waitingRecap,
            accent: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        },
    ];

    return (
        <div className="space-y-6 p-1">
            {/* Page Header */}
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Portal Akademik</p>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Sekretaris Jurusan</h1>
            </div>

            {/* Jurusan Badge */}
            {!loading && !error && data.jurusan?.nama && (
                <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Jurusan:</span>
                    <span className="text-sm font-semibold text-slate-800">{data.jurusan.nama}</span>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-24" />
                    <Skeleton className="h-24" />
                </div>
            )}

            {/* Error State */}
            {!loading && error && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-xl shrink-0">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-red-800 mb-0.5">Gagal memuat data</p>
                        <p className="text-xs text-red-600 mb-3">{error}</p>
                        <button
                            onClick={fetchDashboardData}
                            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <RefreshCw className="h-3 w-3" /> Coba Lagi
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {STATS.map(s => <StatCard key={s.label} {...s} />)}
                </div>
            )}
        </div>
    );
}