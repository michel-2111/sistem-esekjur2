// pages/manajemen-akademik.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import ProdiManager from '../components/sekjur/akademik/ProdiManager';
import CourseManager from '../components/sekjur/akademik/CourseManager';
import PeriodManager from '../components/sekjur/akademik/PeriodManager';
import { Settings, RefreshCw, AlertCircle, GraduationCap, BookOpen, Users, CalendarDays } from 'lucide-react';

function SkeletonBlock({ height = 'h-48' }) {
    return (
        <div
            className={`rounded-2xl overflow-hidden animate-pulse ${height}`}
            style={{ background: '#fff', border: '1px solid #e2e8f0' }}
        >
            <div className="h-1" style={{ background: '#e2e8f0' }} />
            <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                    <div className="h-4 w-36 rounded-lg" style={{ background: '#f1f5f9' }} />
                    <div className="h-7 w-20 rounded-xl" style={{ background: '#f1f5f9' }} />
                </div>
                <div className="h-3 w-48 rounded-full" style={{ background: '#f1f5f9' }} />
                <div className="mt-4 space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-10 rounded-xl" style={{ background: '#f8fafc' }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ManajemenAkademikPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [data, setData] = useState({ prodiList: [], courseList: [], dosenList: [], period: null });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchData = async (silent = false) => {
        if (silent) setIsRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const [akademikRes, periodRes] = await Promise.all([
                fetch('/api/sekjur/akademik'),
                fetch('/api/sekjur/periods'),
            ]);
            if (!akademikRes.ok) {
                const e = await akademikRes.json();
                throw new Error(`Gagal mengambil data akademik: ${e.message || akademikRes.statusText}`);
            }
            if (!periodRes.ok) {
                const e = await periodRes.json();
                throw new Error(`Gagal mengambil data periode: ${e.message || periodRes.statusText}`);
            }
            const akademikData = await akademikRes.json();
            const periodData = await periodRes.json();
            setData({ ...akademikData, period: periodData });
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else if (user?.selectedRole === 'sekjur') fetchData();
    }, [isAuthenticated, router, user]);

    if (!user || user.selectedRole !== 'sekjur') {
        return (
            <Layout>
                <div
                    className="flex flex-col items-center justify-center min-h-48 rounded-2xl gap-3"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                >
                    <GraduationCap size={32} style={{ color: '#f87171' }} />
                    <p className="text-sm font-medium" style={{ color: '#991b1b' }}>
                        Hanya Sekretaris Jurusan yang dapat mengakses halaman ini.
                    </p>
                </div>
            </Layout>
        );
    }

    const stats = [
        { label: 'Program Studi', value: data.prodiList?.length ?? 0, color: '#6366f1', bg: '#eef2ff', icon: GraduationCap },
        { label: 'Mata Kuliah', value: data.courseList?.length ?? 0, color: '#3b82f6', bg: '#eff6ff', icon: BookOpen },
        { label: 'Dosen', value: data.dosenList?.length ?? 0, color: '#10b981', bg: '#ecfdf5', icon: Users },
    ];

    return (
        <Layout>
            {/* Page header */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="p-2 rounded-xl"
                                style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                            >
                                <Settings size={18} style={{ color: '#fff' }} />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                                Sekretaris Jurusan
                            </span>
                        </div>
                        <h1
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif" }}
                        >
                            Manajemen Akademik
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                            Kelola periode, program studi, mata kuliah, dan penugasan dosen.
                        </p>
                    </div>

                    <button
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing || loading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50 mt-1"
                        style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}
                    >
                        <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                </div>

                {/* Stats chips */}
                {!loading && !error && (
                    <div className="flex items-center gap-3 mt-5 flex-wrap">
                        {/* Period chip */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 rounded-xl"
                            style={{
                                background: data.period ? '#fffbeb' : '#f8fafc',
                                border: `1px solid ${data.period ? '#fde68a' : '#e2e8f0'}`,
                            }}
                        >
                            <CalendarDays size={13} style={{ color: data.period ? '#d97706' : '#94a3b8' }} />
                            <span className="text-xs font-semibold" style={{ color: data.period ? '#92400e' : '#94a3b8' }}>
                                {data.period ? `Periode: ${data.period.nama || 'Aktif'}` : 'Belum Ada Periode'}
                            </span>
                        </div>

                        {stats.map(stat => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ background: stat.bg, border: `1px solid ${stat.color}20` }}
                            >
                                <stat.icon size={13} style={{ color: stat.color }} />
                                <span className="text-lg font-extrabold" style={{ color: stat.color }}>{stat.value}</span>
                                <span className="text-xs font-medium" style={{ color: stat.color + 'bb' }}>{stat.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="space-y-5">
                    <SkeletonBlock height="h-36" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <SkeletonBlock height="h-64" />
                        <div className="lg:col-span-2">
                            <SkeletonBlock height="h-64" />
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div
                    className="flex items-start gap-3 px-5 py-4 rounded-2xl"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                >
                    <AlertCircle size={18} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: '#dc2626' }}>Gagal Memuat Data</p>
                        <p className="text-xs mt-0.5" style={{ color: '#ef4444' }}>{error}</p>
                        <button
                            onClick={() => fetchData()}
                            className="mt-2 text-xs font-semibold underline"
                            style={{ color: '#dc2626' }}
                        >
                            Coba lagi
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Period section */}
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
                        }}
                    >
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #059669, #10b981)' }} />
                        <PeriodManager period={data.period} onDataChange={() => fetchData(true)} />
                    </div>

                    {/* Prodi + Course grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div
                            className="lg:col-span-1 rounded-2xl overflow-hidden"
                            style={{
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
                            }}
                        >
                            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                            <ProdiManager
                                prodiList={data.prodiList || []}
                                onDataChange={() => fetchData(true)}
                            />
                        </div>

                        <div
                            className="lg:col-span-2 rounded-2xl overflow-hidden"
                            style={{
                                border: '1px solid #e2e8f0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
                            }}
                        >
                            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #0ea5e9)' }} />
                            <CourseManager
                                prodiList={data.prodiList || []}
                                courseList={data.courseList || []}
                                dosenList={data.dosenList || []}
                                onDataChange={() => fetchData(true)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}