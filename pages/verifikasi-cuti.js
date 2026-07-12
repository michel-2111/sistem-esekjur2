// pages/verifikasi-cuti.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import LeaveVerificationModal from '../components/kajur/LeaveVerificationModal';
import { ClipboardList, Search, BookOpen, CalendarClock, ShieldCheck } from 'lucide-react';

const DURATION_COLOR = {
    '2 Semester (1 Tahun)': { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
    '4 Semester (2 Tahun)': { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

const AVATAR_COLORS = ['#3b5bdb','#0ea5e9','#7c3aed','#059669','#d97706','#dc2626'];
const getColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name = '') => name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();

const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    .vc-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    .vc-skeleton { background: #f1f3f5; border-radius: 6px; height: 14px; animation: vc-pulse 1.4s ease-in-out infinite; }
    @keyframes vc-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    .vc-table { width: 100%; border-collapse: collapse; }
    .vc-table thead tr { background: #f9fafb; }
    .vc-table th { padding: 11px 16px; font-size: 0.7rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.07em; text-align: left; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; }
    .vc-table tbody tr { border-bottom: 1px solid #f1f3f5; transition: background 0.1s; }
    .vc-table tbody tr:last-child { border-bottom: none; }
    .vc-table tbody tr:hover { background: #fafbff; }
    .vc-table td { padding: 12px 16px; font-size: 0.875rem; color: #374151; vertical-align: middle; }
    .vc-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0; }
    .vc-name-cell { display: flex; align-items: center; gap: 10px; }
    .vc-name { font-weight: 600; color: #111827; }
    .vc-prodi-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; font-size: 0.75rem; font-weight: 600; }
    .vc-duration-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; border: 1px solid; }
    .vc-verify-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 7px 14px; border-radius: 8px; border: none; cursor: pointer;
        background: linear-gradient(135deg, #3b5bdb, #5c7cfa); color: white;
        font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
        box-shadow: 0 3px 8px rgba(59,91,219,0.3); transition: all 0.15s; white-space: nowrap;
    }
    .vc-verify-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 12px rgba(59,91,219,0.4); }
    .vc-search { position: relative; flex: 1; max-width: 300px; }
    .vc-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
    .vc-search input { width: 100%; padding: 9px 14px 9px 34px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 0.875rem; color: #111827; background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    .vc-search input:focus { border-color: #3b5bdb; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }
    .vc-search input::placeholder { color: #c1c8d4; }
    .vc-count-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: #f3f4f6; font-size: 0.8rem; font-weight: 600; color: #374151; }
    .vc-count-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: #f59e0b; }
    .vc-card { background: white; border-radius: 16px; border: 1.5px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow: hidden; }
    .vc-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
    .vc-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; }
    .vc-empty-icon { width: 60px; height: 60px; border-radius: 16px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
    .vc-empty-title { font-size: 0.95rem; font-weight: 700; color: #374151; margin-bottom: 4px; }
    .vc-empty-sub { font-size: 0.8rem; color: #9ca3af; }
    @media(max-width:640px){ .vc-table th:nth-child(2),.vc-table td:nth-child(2){ display:none; } }
`;

export default function VerifikasiCutiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        const role = user?.selectedRole;
        if (role === 'kajur' || role === 'wadir') {
            const endpoint = role === 'kajur' ? '/api/kajur/verifikasi-cuti' : '/api/wadir/verifikasi-cuti';
            fetch(endpoint)
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setApplications(data); })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else { setLoading(false); }
    }, [isAuthenticated, router, user]);

    const handleUpdate = (appId) => setApplications(prev => prev.filter(a => a.id !== appId));

    const filtered = applications.filter(app =>
        app.mahasiswa.nama.toLowerCase().includes(search.toLowerCase()) ||
        app.mahasiswa.prodi.nama.toLowerCase().includes(search.toLowerCase())
    );

    const allowed = ['kajur', 'wadir'];
    if (!user || !allowed.includes(user.selectedRole)) {
        return <Layout><style>{css}</style><div style={{ padding: 24, fontFamily: 'DM Sans, sans-serif', color: '#6b7280', fontSize: '0.9rem' }}>Anda tidak memiliki akses ke halaman ini.</div></Layout>;
    }

    return (
        <Layout>
            <style>{css}</style>
            <div className="vc-wrap">
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f1923', letterSpacing: '-0.03em' }}>Verifikasi Pengajuan Cuti</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4 }}>Tinjau dan berikan keputusan atas pengajuan cuti mahasiswa</p>
                </div>

                {/* Toolbar */}
                <div className="vc-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, flexWrap: 'wrap' }}>
                        <div className="vc-search">
                            <Search size={14} className="vc-search-icon" />
                            <input type="text" placeholder="Cari nama atau prodi..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        {!loading && applications.length > 0 && (
                            <div className="vc-count-badge">
                                <span className="dot" />
                                {filtered.length} menunggu verifikasi
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Card */}
                <div className="vc-card">
                    {loading ? (
                        <table className="vc-table">
                            <thead><tr>{['Mahasiswa','Program Studi','Durasi','Aksi'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>{[1,2,3].map(i => (
                                <tr key={i}>{[1,2,3,4].map(j => (
                                    <td key={j}><div className="vc-skeleton" style={{ width: j===1?'55%':j===4?'35%':'50%' }} /></td>
                                ))}</tr>
                            ))}</tbody>
                        </table>
                    ) : filtered.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="vc-table">
                                <thead>
                                    <tr>
                                        <th>Mahasiswa</th>
                                        <th>Program Studi</th>
                                        <th>Durasi</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(app => {
                                        const dur = DURATION_COLOR[app.durasi] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                                        return (
                                            <tr key={app.id}>
                                                <td>
                                                    <div className="vc-name-cell">
                                                        <div className="vc-avatar" style={{ background: getColor(app.mahasiswa.nama) }}>
                                                            {getInitials(app.mahasiswa.nama)}
                                                        </div>
                                                        <span className="vc-name">{app.mahasiswa.nama}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="vc-prodi-badge"><BookOpen size={11} />{app.mahasiswa.prodi.nama}</span>
                                                </td>
                                                <td>
                                                    <span className="vc-duration-badge" style={{ background: dur.bg, color: dur.color, borderColor: dur.border }}>
                                                        <CalendarClock size={12} />{app.durasi}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className="vc-verify-btn" onClick={() => setSelectedApp(app)}>
                                                        <ShieldCheck size={14} /> Lihat &amp; Verifikasi
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="vc-empty">
                            <div className="vc-empty-icon"><ClipboardList size={26} color="#9ca3af" /></div>
                            <div className="vc-empty-title">{search ? 'Tidak ada hasil pencarian' : 'Semua pengajuan telah diverifikasi'}</div>
                            <div className="vc-empty-sub">{search ? `Tidak ada hasil untuk "${search}"` : 'Tidak ada pengajuan cuti yang perlu ditinjau saat ini'}</div>
                        </div>
                    )}
                </div>
            </div>

            {selectedApp && (
                <LeaveVerificationModal
                    application={selectedApp}
                    userRole={user.selectedRole}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </Layout>
    );
}