// pages/dokumen-masuk.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { Download, Inbox, Search, FileText, ChevronDown } from 'lucide-react';
import StatusView from '../components/mahasiswa/StatusView';

export default function DokumenMasukPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user) {
            fetch('/api/dokumen/masuk')
                .then(res => res.json())
                .then(data => { if (Array.isArray(data)) setDocuments(data); })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isAuthenticated, router, user]);

    const filtered = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.sender.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (ts) => {
        const d = new Date(ts);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const formatTime = (ts) => {
        return new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name = '') => name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

    const avatarColors = ['#3b5bdb','#0ea5e9','#7c3aed','#059669','#d97706','#dc2626'];
    const getColor = (name = '') => avatarColors[name.charCodeAt(0) % avatarColors.length];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .dm-page * { box-sizing: border-box; }
                .dm-page { font-family: 'DM Sans', sans-serif; color: #0f1923; }
                .dm-page-header { margin-bottom: 28px; }
                .dm-breadcrumb { font-size: 0.75rem; color: #9ca3af; font-weight: 500; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
                .dm-breadcrumb-sep { color: #d1d5db; }
                .dm-page-title { font-size: 1.75rem; font-weight: 700; color: #0f1923; letter-spacing: -0.03em; }
                .dm-page-subtitle { font-size: 0.875rem; color: #6b7280; margin-top: 4px; }
                .dm-toolbar {
                    display: flex; align-items: center; justify-content: space-between;
                    flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
                }
                .dm-search {
                    position: relative; flex: 1; max-width: 320px;
                }
                .dm-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
                .dm-search input {
                    width: 100%; padding: 9px 14px 9px 36px;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #0f1923;
                    background: white; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
                }
                .dm-search input:focus { border-color: #3b5bdb; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }
                .dm-search input::placeholder { color: #9ca3af; }
                .dm-count-badge {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 6px 14px; border-radius: 20px;
                    background: #f3f4f6; font-size: 0.8rem; font-weight: 600; color: #374151;
                }
                .dm-count-badge .dot { width: 7px; height: 7px; border-radius: 50%; background: #3b5bdb; }
                .dm-card {
                    background: white; border-radius: 16px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
                    overflow: hidden;
                }
                .dm-table { width: 100%; border-collapse: collapse; }
                .dm-table thead tr {
                    background: #f9fafb; border-bottom: 1px solid #e5e7eb;
                }
                .dm-table th {
                    padding: 12px 18px; font-size: 0.72rem; font-weight: 600;
                    color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em;
                    text-align: left; white-space: nowrap;
                }
                .dm-table th .sort-icon { margin-left: 4px; vertical-align: middle; opacity: 0.4; }
                .dm-table tbody tr {
                    border-bottom: 1px solid #f1f3f5;
                    transition: background 0.1s;
                }
                .dm-table tbody tr:last-child { border-bottom: none; }
                .dm-table tbody tr:hover { background: #fafbff; }
                .dm-table td { padding: 14px 18px; font-size: 0.875rem; }
                .dm-doc-cell { display: flex; align-items: center; gap: 12px; }
                .dm-doc-icon {
                    width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
                    background: linear-gradient(135deg, #eef2ff, #e0e7ff);
                    display: flex; align-items: center; justify-content: center;
                }
                .dm-doc-title { font-weight: 600; color: #111827; font-size: 0.875rem; }
                .dm-sender-cell { display: flex; align-items: center; gap: 10px; }
                .dm-avatar {
                    width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.65rem; font-weight: 700; color: white;
                }
                .dm-sender-name { font-weight: 500; color: #374151; }
                .dm-date-primary { font-weight: 500; color: #374151; }
                .dm-date-secondary { font-size: 0.72rem; color: #9ca3af; margin-top: 1px; font-family: 'DM Mono', monospace; }
                .dm-download-btn {
                    display: inline-flex; align-items: center; gap: 7px;
                    padding: 7px 14px; border-radius: 8px;
                    background: #f3f4f6; color: #374151;
                    font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
                    text-decoration: none; border: 1px solid #e5e7eb;
                    transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
                    white-space: nowrap;
                }
                .dm-download-btn:hover {
                    background: #3b5bdb; color: white; border-color: #3b5bdb;
                    transform: translateY(-1px); box-shadow: 0 4px 10px rgba(59,91,219,0.25);
                }
                .dm-empty {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    padding: 72px 24px; text-align: center;
                }
                .dm-empty-icon-wrap {
                    width: 72px; height: 72px; border-radius: 20px;
                    background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
                    display: flex; align-items: center; justify-content: center;
                    margin-bottom: 20px;
                }
                .dm-empty-title { font-size: 1rem; font-weight: 700; color: #374151; margin-bottom: 6px; }
                .dm-empty-desc { font-size: 0.875rem; color: #9ca3af; max-width: 280px; line-height: 1.5; }
                .dm-skeleton { background: #f1f3f5; border-radius: 6px; height: 14px; animation: dm-pulse 1.4s ease-in-out infinite; }
                @keyframes dm-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
                .dm-skeleton-row td { padding: 14px 18px; }
                @media (max-width: 640px) {
                    .dm-table th:nth-child(2), .dm-table td:nth-child(2),
                    .dm-table th:nth-child(3), .dm-table td:nth-child(3) { display: none; }
                }
            `}</style>
            <Layout>
                <div className="dm-page">
                    {/* Page Header */}
                    <div className="dm-page-header">
                        <h1 className="dm-page-title">Dokumen Masuk</h1>
                        <p className="dm-page-subtitle">Daftar seluruh dokumen yang telah dikirimkan kepada Anda</p>
                    </div>

                    {/* Toolbar */}
                    <div className="dm-toolbar">
                        <div className="dm-search">
                            <Search size={15} className="dm-search-icon" />
                            <input
                                type="text"
                                placeholder="Cari dokumen atau pengirim..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {!loading && (
                            <div className="dm-count-badge">
                                <span className="dot" />
                                {filtered.length} dokumen
                            </div>
                        )}
                    </div>

                    {/* Table Card */}
                    <div className="dm-card">
                        {loading ? (
                            <table className="dm-table">
                                <thead>
                                    <tr>
                                        <th>Judul Dokumen</th>
                                        <th>Pengirim</th>
                                        <th>Tanggal Kirim</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4].map(i => (
                                        <tr key={i} className="dm-skeleton-row">
                                            <td><div className="dm-skeleton" style={{ width: '60%' }} /></td>
                                            <td><div className="dm-skeleton" style={{ width: '40%' }} /></td>
                                            <td><div className="dm-skeleton" style={{ width: '50%' }} /></td>
                                            <td><div className="dm-skeleton" style={{ width: '30%' }} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : filtered.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="dm-table">
                                    <thead>
                                        <tr>
                                            <th>Judul Dokumen <ChevronDown size={11} className="sort-icon" /></th>
                                            <th>Pengirim</th>
                                            <th>Tanggal Kirim <ChevronDown size={11} className="sort-icon" /></th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(doc => (
                                            <tr key={doc.id}>
                                                <td>
                                                    <div className="dm-doc-cell">
                                                        <div className="dm-doc-icon">
                                                            <FileText size={16} color="#3b5bdb" />
                                                        </div>
                                                        <span className="dm-doc-title">{doc.title}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="dm-sender-cell">
                                                        <div
                                                            className="dm-avatar"
                                                            style={{ background: getColor(doc.sender.nama) }}
                                                        >
                                                            {getInitials(doc.sender.nama)}
                                                        </div>
                                                        <span className="dm-sender-name">{doc.sender.nama}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="dm-date-primary">{formatDate(doc.timestamp)}</div>
                                                    <div className="dm-date-secondary">{formatTime(doc.timestamp)}</div>
                                                </td>
                                                <td>
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="dm-download-btn"
                                                    >
                                                        <Download size={13} />
                                                        Unduh
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="dm-empty">
                                <div className="dm-empty-icon-wrap">
                                    <Inbox size={30} color="#9ca3af" />
                                </div>
                                <div className="dm-empty-title">
                                    {searchQuery ? 'Tidak ditemukan' : 'Kotak masuk kosong'}
                                </div>
                                <div className="dm-empty-desc">
                                    {searchQuery
                                        ? `Tidak ada dokumen yang cocok dengan pencarian "${searchQuery}".`
                                        : 'Belum ada dokumen yang dikirimkan kepada Anda saat ini.'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Layout>
        </>
    );
}