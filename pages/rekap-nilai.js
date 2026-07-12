// pages/rekap-nilai.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { FileDown, CheckSquare, ClipboardCheck, Users, BookOpen, RefreshCw, Search, GraduationCap, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../components/shared/ConfirmationModal';

const GRADE_CONFIG = {
    A: { color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
    B: { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
    C: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
    D: { color: '#ea580c', bg: '#ffedd5', border: '#fdba74' },
    E: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
};

function GradeBadge({ nilai }) {
    const raw = nilai ? String(nilai).trim() : null;
    const cfg = raw ? GRADE_CONFIG[raw] : null;
    if (!cfg) return (
        <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9', color: '#94a3b8' }}>
            {raw || '—'}
        </span>
    );
    return (
        <span
            className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
            {raw}
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full" style={{ background: '#f1f5f9' }} />
                    <div className="space-y-1.5">
                        <div className="h-3 w-32 rounded-full" style={{ background: '#f1f5f9' }} />
                        <div className="h-2.5 w-20 rounded-full" style={{ background: '#f1f5f9' }} />
                    </div>
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="space-y-2">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-center justify-between gap-8">
                            <div className="h-2.5 w-36 rounded-full" style={{ background: '#f1f5f9' }} />
                            <div className="h-5 w-8 rounded-lg" style={{ background: '#f1f5f9' }} />
                        </div>
                    ))}
                </div>
            </td>
        </tr>
    );
}

export default function RekapNilaiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isFinalizing, setIsFinalizing] = useState(false);

    const fetchData = async (silent = false) => {
        if (silent) setIsRefreshing(true);
        else setLoading(true);
        try {
            const res = await fetch('/api/sekjur/rekap-nilai');
            const data = await res.json();
            if (res.ok) setApplications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else if (user?.selectedRole === 'sekjur') fetchData();
    }, [isAuthenticated, router, user]);

    const handleExport = () => {
        if (applications.length === 0) return;
        let csvContent = "data:text/csv;charset=utf-8,NIM,Nama Mahasiswa,Mata Kuliah,Nilai\r\n";
        applications.forEach(app => {
            app.application_courses.forEach(ac => {
                const row = [app.mahasiswa.identifier, app.mahasiswa.nama, ac.course.nama, ac.nilai].join(",");
                csvContent += row + "\r\n";
            });
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "rekap_nilai_sa.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const confirmFinalize = async () => {
        setIsConfirmModalOpen(false);
        setIsFinalizing(true);
        const applicationIds = applications.map(app => app.id);
        try {
            const res = await fetch('/api/sekjur/rekap-nilai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationIds }),
            });
            if (!res.ok) throw new Error('Gagal memfinalisasi nilai.');
            fetchData(true);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsFinalizing(false);
        }
    };

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

    const filtered = applications.filter(app =>
        app.mahasiswa.nama.toLowerCase().includes(search.toLowerCase()) ||
        app.mahasiswa.identifier.toLowerCase().includes(search.toLowerCase())
    );

    const totalMhs = applications.length;
    const totalMatkul = applications.reduce((a, app) => a + app.application_courses.length, 0);

    return (
        <>
            <Layout>
                {/* Page header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <div
                                    className="p-2 rounded-xl"
                                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                                >
                                    <ClipboardCheck size={18} style={{ color: '#fff' }} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                                    Semester Antara
                                </span>
                            </div>
                            <h1
                                className="text-2xl font-bold tracking-tight"
                                style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif" }}
                            >
                                Rekapitulasi Nilai
                            </h1>
                            <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                                Tinjau, finalisasi, dan ekspor nilai akhir seluruh mahasiswa.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <button
                                onClick={() => fetchData(true)}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50"
                                style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }}
                            >
                                <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    {!loading && applications.length > 0 && (
                        <div className="flex items-center gap-3 mt-5 flex-wrap">
                            {[
                                { label: 'Mahasiswa', value: totalMhs, color: '#6366f1', bg: '#eef2ff', icon: Users },
                                { label: 'Total Mata Kuliah', value: totalMatkul, color: '#3b82f6', bg: '#eff6ff', icon: BookOpen },
                            ].map(stat => (
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

                {/* Main card */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
                    }}
                >
                    {/* Color bar */}
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />

                    {/* Toolbar */}
                    <div
                        className="flex items-center justify-between gap-4 px-5 py-4 flex-wrap"
                        style={{ borderBottom: '1px solid #f1f5f9' }}
                    >
                        {/* Search */}
                        <div className="relative">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama atau NIM..."
                                className="pl-8 pr-3 py-2 rounded-xl text-sm transition-all duration-150"
                                style={{
                                    border: '1px solid #e2e8f0',
                                    background: '#f8fafc',
                                    color: '#334155',
                                    outline: 'none',
                                    width: '220px',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => applications.length > 0 && setIsConfirmModalOpen(true)}
                                disabled={applications.length === 0 || isFinalizing}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    boxShadow: applications.length > 0 ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
                                }}
                                onMouseEnter={e => { if (applications.length > 0) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            >
                                {isFinalizing ? (
                                    <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                ) : <CheckSquare size={14} />}
                                {isFinalizing ? 'Memfinalisasi...' : 'Rekap Semua Nilai'}
                            </button>

                            <button
                                onClick={handleExport}
                                disabled={applications.length === 0}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    background: '#f0fdf4',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                }}
                                onMouseEnter={e => { if (applications.length > 0) e.currentTarget.style.background = '#dcfce7'; }}
                                onMouseLeave={e => e.currentTarget.style.background = '#f0fdf4'}
                            >
                                <FileDown size={14} />
                                Export CSV
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>
                                        Mahasiswa
                                    </th>
                                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>
                                        Mata Kuliah &amp; Nilai
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [1, 2, 3].map(i => <SkeletonRow key={i} />)
                                ) : filtered.length > 0 ? (
                                    filtered.map((app, idx) => (
                                        <tr
                                            key={app.id}
                                            className="transition-colors duration-100"
                                            style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fafafe'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            {/* Mahasiswa */}
                                            <td className="px-5 py-4 align-top" style={{ width: '220px' }}>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                        style={{ background: '#eef2ff', color: '#6366f1' }}
                                                    >
                                                        {app.mahasiswa.nama?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm leading-tight" style={{ color: '#0f172a' }}>
                                                            {app.mahasiswa.nama}
                                                        </p>
                                                        <p className="text-xs mt-0.5 font-mono" style={{ color: '#94a3b8' }}>
                                                            {app.mahasiswa.identifier}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Courses */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-2">
                                                    {app.application_courses.map(ac => (
                                                        <div
                                                            key={ac.course.id}
                                                            className="flex items-center justify-between gap-6 px-3 py-2 rounded-xl"
                                                            style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen size={11} style={{ color: '#94a3b8', flexShrink: 0 }} />
                                                                <span className="text-sm" style={{ color: '#334155' }}>
                                                                    {ac.course.nama}
                                                                </span>
                                                            </div>
                                                            <GradeBadge nilai={ac.nilai} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">
                                            <div className="flex flex-col items-center justify-center gap-3 py-16">
                                                <div className="p-3 rounded-2xl" style={{ background: '#f1f5f9' }}>
                                                    {search ? (
                                                        <Search size={24} style={{ color: '#94a3b8' }} />
                                                    ) : (
                                                        <ClipboardCheck size={24} style={{ color: '#94a3b8' }} />
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold" style={{ color: '#334155' }}>
                                                        {search ? 'Mahasiswa tidak ditemukan' : 'Tidak Ada Data Rekapitulasi'}
                                                    </p>
                                                    <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                                                        {search
                                                            ? `Tidak ada hasil untuk "${search}"`
                                                            : 'Tidak ada nilai yang perlu direkapitulasi saat ini.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    {!loading && filtered.length > 0 && (
                        <div
                            className="px-5 py-3 flex items-center justify-between"
                            style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}
                        >
                            <span className="text-xs" style={{ color: '#94a3b8' }}>
                                Menampilkan {filtered.length} dari {totalMhs} mahasiswa
                            </span>
                            {applications.length > 0 && (
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                                >
                                    <AlertTriangle size={11} style={{ color: '#d97706' }} />
                                    <span className="text-xs font-medium" style={{ color: '#92400e' }}>
                                        Finalisasi tidak dapat dibatalkan
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Layout>

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmFinalize}
                title="Konfirmasi Finalisasi Nilai"
                confirmText="Ya, Finalisasi"
                confirmColor="bg-indigo-600 hover:bg-indigo-700"
            >
                Anda yakin ingin memfinalisasi semua nilai? Aksi ini tidak dapat dibatalkan.
            </ConfirmationModal>
        </>
    );
}