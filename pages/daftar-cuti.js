// pages/daftar-cuti.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { FileDown, ClipboardList, Search, GraduationCap, BookOpen, CalendarClock } from 'lucide-react';

const DURATION_COLOR = {
    '2 Semester (1 Tahun)': { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
    '4 Semester (2 Tahun)': { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

export default function DaftarCutiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [leaveList, setLeaveList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        const allowed = ['sekjur', 'kajur'];
        if (user && allowed.includes(user.selectedRole)) {
            fetch('/api/jurusan/mahasiswa-cuti')
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setLeaveList(data); })
                .catch(console.error)
                .finally(() => setLoading(false));
        } else { setLoading(false); }
    }, [isAuthenticated, router, user]);

    const handleExport = () => {
        if (leaveList.length === 0) { alert('Tidak ada data untuk diekspor.'); return; }
        let csv = 'data:text/csv;charset=utf-8,NIM,Nama Mahasiswa,Program Studi,Durasi Cuti\r\n';
        leaveList.forEach(app => {
            csv += [app.mahasiswa.identifier, app.mahasiswa.nama, app.mahasiswa.prodi.nama, `"${app.durasi}"`].join(',') + '\r\n';
        });
        const link = document.createElement('a');
        link.setAttribute('href', encodeURI(csv));
        link.setAttribute('download', 'daftar_mahasiswa_cuti.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = leaveList.filter(app =>
        app.mahasiswa.nama.toLowerCase().includes(search.toLowerCase()) ||
        app.mahasiswa.identifier.includes(search) ||
        app.mahasiswa.prodi.nama.toLowerCase().includes(search.toLowerCase())
    );

    const getInitials = (name = '') => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    const COLORS = ['#3b5bdb','#0ea5e9','#7c3aed','#059669','#d97706','#dc2626'];
    const getColor = (name = '') => COLORS[name.charCodeAt(0) % COLORS.length];

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .dc-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .dc-skeleton { background: #f1f3f5; border-radius: 6px; height: 14px; animation: dc-pulse 1.4s ease-in-out infinite; }
        @keyframes dc-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        .dc-table { width: 100%; border-collapse: collapse; }
        .dc-table thead tr { background: #f9fafb; }
        .dc-table th { padding: 11px 16px; font-size: 0.7rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.07em; text-align: left; border-bottom: 1.5px solid #e5e7eb; white-space: nowrap; }
        .dc-table tbody tr { border-bottom: 1px solid #f1f3f5; transition: background 0.1s; }
        .dc-table tbody tr:last-child { border-bottom: none; }
        .dc-table tbody tr:hover { background: #fafbff; }
        .dc-table td { padding: 12px 16px; font-size: 0.875rem; color: #374151; vertical-align: middle; }
        .dc-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0; }
        .dc-name-cell { display: flex; align-items: center; gap: 10px; }
        .dc-name { font-weight: 600; color: #111827; }
        .dc-nim { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: #6b7280; }
        .dc-prodi-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 20px; background: #eff6ff; color: #1d4ed8; font-size: 0.75rem; font-weight: 600; }
        .dc-duration-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; border: 1px solid; }
        .dc-search { position: relative; flex: 1; max-width: 300px; }
        .dc-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .dc-search input { width: 100%; padding: 9px 14px 9px 34px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-family: 'DM Sans',sans-serif; font-size: 0.875rem; color: #111827; background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
        .dc-search input:focus { border-color: #3b5bdb; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }
        .dc-search input::placeholder { color: #c1c8d4; }
        .dc-export-btn { display: inline-flex; align-items: center; gap: 8px; padding: 9px 18px; border-radius: 10px; border: none; background: linear-gradient(135deg,#059669,#10b981); color: white; font-family: 'DM Sans',sans-serif; font-size: 0.875rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(5,150,105,0.3); transition: all 0.15s; white-space: nowrap; }
        .dc-export-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(5,150,105,0.4); }
        .dc-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; }
        .dc-empty-icon { width: 60px; height: 60px; border-radius: 16px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .dc-empty-title { font-size: 0.95rem; font-weight: 700; color: #374151; margin-bottom: 4px; }
        .dc-empty-sub { font-size: 0.8rem; color: #9ca3af; }
        .dc-card { background: white; border-radius: 16px; border: 1.5px solid #e5e7eb; box-shadow: 0 1px 4px rgba(0,0,0,0.04); overflow: hidden; }
        .dc-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
        .dc-count-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; background: #f3f4f6; font-size: 0.8rem; font-weight: 600; color: #374151; }
        .dc-count-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: #3b5bdb; }
        @media(max-width:640px){ .dc-table th:nth-child(3),.dc-table td:nth-child(3){ display:none; } }
    `;

    const allowed = ['sekjur', 'kajur'];

    if (loading) {
        return (
            <Layout>
                <style>{css}</style>
                <div className="dc-wrap">
                    <div style={{ height: 32, marginBottom: 24 }}><div className="dc-skeleton" style={{ width: '35%' }} /></div>
                    <div className="dc-card">
                        <table className="dc-table">
                            <thead><tr>{['NIM','Nama','Prodi','Durasi'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                            <tbody>{[1,2,3,4].map(i => (
                                <tr key={i}>{[1,2,3,4].map(j => (
                                    <td key={j}><div className="dc-skeleton" style={{ width: j===1?'40%':j===4?'30%':'60%' }} /></td>
                                ))}</tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user || !allowed.includes(user.selectedRole)) {
        return (
            <Layout>
                <style>{css}</style>
                <div style={{ textAlign: 'center', padding: '60px 24px', fontFamily: 'DM Sans, sans-serif' }}>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Anda tidak memiliki akses ke halaman ini.</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <style>{css}</style>
            <div className="dc-wrap">
                {/* Page Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f1923', letterSpacing: '-0.03em' }}>Daftar Mahasiswa Cuti</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4 }}>Rekap mahasiswa yang sedang menjalani cuti akademik</p>
                </div>

                {/* Toolbar */}
                <div className="dc-toolbar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: 1 }}>
                        <div className="dc-search">
                            <Search size={14} className="dc-search-icon" />
                            <input type="text" placeholder="Cari nama, NIM, atau prodi..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        {leaveList.length > 0 && (
                            <div className="dc-count-badge">
                                <span className="dot" />
                                {filtered.length} mahasiswa
                            </div>
                        )}
                    </div>
                    {leaveList.length > 0 && (
                        <button className="dc-export-btn" onClick={handleExport}>
                            <FileDown size={15} /> Ekspor CSV
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="dc-card">
                    {filtered.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="dc-table">
                                <thead>
                                    <tr>
                                        <th>NIM</th>
                                        <th>Nama Mahasiswa</th>
                                        <th>Program Studi</th>
                                        <th>Durasi Cuti</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(app => {
                                        const dur = DURATION_COLOR[app.durasi] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                                        return (
                                            <tr key={app.id}>
                                                <td><span className="dc-nim">{app.mahasiswa.identifier}</span></td>
                                                <td>
                                                    <div className="dc-name-cell">
                                                        <div className="dc-avatar" style={{ background: getColor(app.mahasiswa.nama) }}>
                                                            {getInitials(app.mahasiswa.nama)}
                                                        </div>
                                                        <span className="dc-name">{app.mahasiswa.nama}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="dc-prodi-badge">
                                                        <BookOpen size={11} />{app.mahasiswa.prodi.nama}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="dc-duration-badge" style={{ background: dur.bg, color: dur.color, borderColor: dur.border }}>
                                                        <CalendarClock size={12} />{app.durasi}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="dc-empty">
                            <div className="dc-empty-icon">
                                <ClipboardList size={26} color="#9ca3af" />
                            </div>
                            <div className="dc-empty-title">
                                {search ? 'Tidak ada hasil pencarian' : 'Tidak ada mahasiswa cuti'}
                            </div>
                            <div className="dc-empty-sub">
                                {search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada mahasiswa yang sedang menjalani cuti'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}