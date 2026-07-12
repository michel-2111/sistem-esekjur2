// pages/detail-kelas.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import KelasCard from '../components/dosen/KelasCard';
import ScheduleModal from '../components/dosen/ScheduleModal';
import StatusView from '../components/mahasiswa/StatusView';
import { BookCopy, GraduationCap, RefreshCw } from 'lucide-react';

function SkeletonCard() {
    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
        >
            <div className="h-1.5 w-full" style={{ background: '#e2e8f0' }} />
            <div className="p-6 space-y-4 animate-pulse">
                <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                        <div className="h-3 w-16 rounded-full" style={{ background: '#f1f5f9' }} />
                        <div className="h-4 w-2/3 rounded-lg" style={{ background: '#f1f5f9' }} />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-7 w-14 rounded-lg" style={{ background: '#f1f5f9' }} />
                        <div className="h-7 w-24 rounded-lg" style={{ background: '#f1f5f9' }} />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="h-3 w-32 rounded-full" style={{ background: '#f1f5f9' }} />
                    <div className="h-3 w-24 rounded-full" style={{ background: '#f1f5f9' }} />
                </div>
                <div className="rounded-xl overflow-hidden" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="h-9" style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }} />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <div className="w-6 h-6 rounded-full" style={{ background: '#e2e8f0' }} />
                            <div className="h-3 flex-1 rounded-full" style={{ background: '#e2e8f0' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DetailKelasPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKelas, setEditingKelas] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const res = await fetch('/api/dosen/kelas');
            const data = await res.json();
            if (res.ok) setClasses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else fetchData();
    }, [isAuthenticated, router]);

    if (!user || user.selectedRole !== 'dosen') {
        return (
            <Layout>
                <div
                    className="flex flex-col items-center justify-center min-h-48 rounded-2xl gap-3"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                >
                    <GraduationCap size={32} style={{ color: '#f87171' }} />
                    <p className="text-sm font-medium" style={{ color: '#991b1b' }}>
                        Hanya Dosen yang dapat mengakses halaman ini.
                    </p>
                </div>
            </Layout>
        );
    }

    const activeCount = classes.filter(k => !k.kelas_selesai).length;
    const doneCount = classes.filter(k => k.kelas_selesai).length;
    const totalStudents = classes.reduce((acc, k) => acc + (k.students?.length || 0), 0);

    return (
        <Layout>
            {/* Page header */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div
                                className="p-2 rounded-xl"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                            >
                                <GraduationCap size={18} style={{ color: '#fff' }} />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                                Semester Antara
                            </span>
                        </div>
                        <h1
                            className="text-2xl font-bold tracking-tight"
                            style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif" }}
                        >
                            Detail Kelas
                        </h1>
                        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                            Kelola jadwal, ruang, dan status kelas yang Anda ampu.
                        </p>
                    </div>

                    {!loading && classes.length > 0 && (
                        <button
                            onClick={() => fetchData(true)}
                            disabled={isRefreshing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                            style={{
                                background: '#f8fafc',
                                color: '#475569',
                                border: '1px solid #e2e8f0',
                                marginTop: '4px',
                            }}
                        >
                            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    )}
                </div>

                {/* Summary stats */}
                {!loading && classes.length > 0 && (
                    <div className="flex items-center gap-3 mt-5">
                        {[
                            { label: 'Total Kelas', value: classes.length, color: '#3b82f6', bg: '#eff6ff' },
                            { label: 'Kelas Aktif', value: activeCount, color: '#6366f1', bg: '#eef2ff' },
                            { label: 'Selesai', value: doneCount, color: '#10b981', bg: '#ecfdf5' },
                            { label: 'Total Mahasiswa', value: totalStudents, color: '#f59e0b', bg: '#fffbeb' },
                        ].map(stat => (
                            <div
                                key={stat.label}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                                style={{ background: stat.bg, border: `1px solid ${stat.color}20` }}
                            >
                                <span className="text-lg font-extrabold" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <span className="text-xs font-medium" style={{ color: stat.color + 'cc' }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {classes.map(kelas => (
                        <KelasCard
                            key={kelas.course_id}
                            kelas={kelas}
                            onEdit={setEditingKelas}
                            onStatusChange={() => fetchData(true)}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl"
                    style={{
                        background: '#f8fafc',
                        border: '2px dashed #cbd5e1',
                    }}
                >
                    <div
                        className="p-4 rounded-2xl"
                        style={{ background: '#e2e8f0' }}
                    >
                        <BookCopy size={28} style={{ color: '#94a3b8' }} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-sm" style={{ color: '#334155' }}>
                            Belum Ada Penugasan
                        </p>
                        <p className="text-xs mt-1 max-w-xs" style={{ color: '#94a3b8' }}>
                            Anda belum ditugaskan untuk mengampu kelas Semester Antara pada periode ini.
                        </p>
                    </div>
                </div>
            )}

            {editingKelas && (
                <ScheduleModal
                    kelas={editingKelas}
                    onClose={() => setEditingKelas(null)}
                    onSaveSuccess={() => {
                        setEditingKelas(null);
                        fetchData(true);
                    }}
                />
            )}
        </Layout>
    );
}