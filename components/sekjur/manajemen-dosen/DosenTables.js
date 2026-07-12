// components/sekjur/manajemen-dosen/DosenTables.js
import { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, BookOpen, Users } from 'lucide-react';

const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    .dt-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    .dt-table { width: 100%; border-collapse: collapse; }
    .dt-table thead tr { background: #f9fafb; }
    .dt-table th {
        padding: 11px 16px; font-size: 0.7rem; font-weight: 600; color: #6b7280;
        text-transform: uppercase; letter-spacing: 0.07em; text-align: left;
        border-bottom: 1.5px solid #e5e7eb; white-space: nowrap;
    }
    .dt-table th.center { text-align: center; }
    .dt-table tbody tr { border-bottom: 1px solid #f1f3f5; transition: background 0.1s; }
    .dt-table tbody tr:last-child { border-bottom: none; }
    .dt-table tbody tr:hover { background: #fafbff; }
    .dt-table td { padding: 12px 16px; font-size: 0.875rem; color: #374151; vertical-align: middle; }
    .dt-table td.center { text-align: center; }
    .dt-avatar {
        width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.7rem; font-weight: 700; color: white;
    }
    .dt-name-cell { display: flex; align-items: center; gap: 10px; }
    .dt-name { font-weight: 600; color: #111827; }
    .dt-nip { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: #6b7280; }
    .dt-prodi-badge {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 20px;
        background: #eff6ff; color: #1d4ed8;
        font-size: 0.75rem; font-weight: 600;
    }
    .dt-sks-badge {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 44px; padding: 4px 10px; border-radius: 8px;
        font-weight: 700; font-size: 0.875rem;
    }
    .dt-sks-high { background: #dcfce7; color: #15803d; }
    .dt-sks-mid  { background: #fef9c3; color: #a16207; }
    .dt-sks-low  { background: #f3f4f6; color: #374151; }
    .dt-action-btn {
        width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
        display: inline-flex; align-items: center; justify-content: center;
        transition: all 0.15s;
    }
    .dt-btn-view  { background: #eff6ff; color: #3b82f6; }
    .dt-btn-view:hover  { background: #dbeafe; color: #1d4ed8; transform: translateY(-1px); }
    .dt-btn-edit  { background: #fffbeb; color: #f59e0b; }
    .dt-btn-edit:hover  { background: #fef3c7; color: #d97706; transform: translateY(-1px); }
    .dt-btn-del   { background: #fff1f2; color: #f43f5e; }
    .dt-btn-del:hover   { background: #ffe4e6; color: #e11d48; transform: translateY(-1px); }
    .dt-action-group { display: flex; align-items: center; justify-content: center; gap: 6px; }
    .dt-loading-row td { padding: 40px 16px; text-align: center; }
    .dt-skeleton { height: 14px; border-radius: 6px; background: #f1f3f5; animation: dt-pulse 1.4s ease-in-out infinite; }
    @keyframes dt-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .dt-empty { display: flex; flex-direction: column; align-items: center; padding: 48px 24px; }
    .dt-empty-icon { width: 52px; height: 52px; border-radius: 14px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
    .dt-empty-text { font-size: 0.9rem; font-weight: 600; color: #374151; }
    .dt-empty-sub  { font-size: 0.8rem; color: #9ca3af; margin-top: 4px; }
    .dt-pagination {
        display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
        padding: 12px 16px; border-top: 1px solid #f1f3f5;
        font-size: 0.8rem; color: #6b7280;
    }
    .dt-pg-info span { font-weight: 600; color: #111827; }
    .dt-pg-nav { display: flex; align-items: center; gap: 4px; }
    .dt-pg-btn {
        width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #e5e7eb;
        background: white; color: #374151; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
        transition: all 0.12s;
    }
    .dt-pg-btn:hover:not(:disabled) { border-color: #3b5bdb; color: #3b5bdb; background: #eef2ff; }
    .dt-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .dt-pg-btn.active { background: #3b5bdb; border-color: #3b5bdb; color: white; }
    .dt-pg-btn.arrow { color: #6b7280; }
`;

const AVATAR_COLORS = ['#3b5bdb','#0ea5e9','#7c3aed','#059669','#d97706','#dc2626','#0891b2'];
const getColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name = '') => name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();

function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    // Show max 5 page buttons
    let pages = [];
    if (totalPages <= 5) {
        pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
        pages = [1];
        if (currentPage > 3) pages.push('...');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
    }

    return (
        <div className="dt-pagination">
            <div className="dt-pg-info">
                Menampilkan <span>{start}–{end}</span> dari <span>{totalItems}</span> data
            </div>
            <div className="dt-pg-nav">
                <button className="dt-pg-btn arrow" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                    <ChevronLeft size={14} />
                </button>
                {pages.map((p, i) =>
                    p === '...'
                        ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#9ca3af', fontSize: '0.8rem' }}>…</span>
                        : <button key={p} className={`dt-pg-btn${currentPage === p ? ' active' : ''}`} onClick={() => onPageChange(p)}>{p}</button>
                )}
                <button className="dt-pg-btn arrow" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

function SkeletonRows({ cols }) {
    return [1,2,3].map(i => (
        <tr key={i}>
            {Array.from({ length: cols }).map((_, j) => (
                <td key={j}><div className="dt-skeleton" style={{ width: j === 0 ? '70%' : j === cols - 1 ? '30%' : '50%' }} /></td>
            ))}
        </tr>
    ));
}

export function RekapSksTable({ lecturers, loading, calculateSksFn, onDetail }) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS = 10;
    const paged = lecturers.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

    const getSksClass = (sks) => sks >= 12 ? 'dt-sks-high' : sks >= 6 ? 'dt-sks-mid' : 'dt-sks-low';

    return (
        <div className="dt-wrap">
            <style>{STYLES}</style>
            <div style={{ overflowX: 'auto' }}>
                <table className="dt-table">
                    <thead>
                        <tr>
                            <th>Nama Dosen</th>
                            <th>NIP</th>
                            <th className="center">Total SKS</th>
                            <th className="center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <SkeletonRows cols={4} /> :
                         paged.length === 0 ? (
                            <tr><td colSpan={4}>
                                <div className="dt-empty">
                                    <div className="dt-empty-icon"><Users size={22} color="#9ca3af" /></div>
                                    <div className="dt-empty-text">Tidak ada data dosen</div>
                                    <div className="dt-empty-sub">Belum ada dosen yang terdaftar saat ini</div>
                                </div>
                            </td></tr>
                         ) : paged.map(dosen => {
                            const sks = calculateSksFn(dosen.id);
                            return (
                                <tr key={dosen.id}>
                                    <td>
                                        <div className="dt-name-cell">
                                            <div className="dt-avatar" style={{ background: getColor(dosen.nama) }}>
                                                {getInitials(dosen.nama)}
                                            </div>
                                            <span className="dt-name">{dosen.nama}</span>
                                        </div>
                                    </td>
                                    <td><span className="dt-nip">{dosen.identifier}</span></td>
                                    <td className="center">
                                        <span className={`dt-sks-badge ${getSksClass(sks)}`}>{sks} SKS</span>
                                    </td>
                                    <td className="center">
                                        <button className="dt-action-btn dt-btn-view" title="Lihat Detail" onClick={() => onDetail(dosen)}>
                                            <Eye size={15} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {!loading && lecturers.length > 0 && (
                <Pagination totalItems={lecturers.length} itemsPerPage={ITEMS} currentPage={currentPage} onPageChange={setCurrentPage} />
            )}
        </div>
    );
}

export function CrudDosenTable({ lecturers, loading, onEdit, onDelete }) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS = 10;
    const paged = lecturers.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

    return (
        <div className="dt-wrap">
            <style>{STYLES}</style>
            <div style={{ overflowX: 'auto' }}>
                <table className="dt-table">
                    <thead>
                        <tr>
                            <th>Nama Dosen</th>
                            <th>NIP</th>
                            <th>Program Studi</th>
                            <th className="center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <SkeletonRows cols={4} /> :
                         paged.length === 0 ? (
                            <tr><td colSpan={4}>
                                <div className="dt-empty">
                                    <div className="dt-empty-icon"><Users size={22} color="#9ca3af" /></div>
                                    <div className="dt-empty-text">Tidak ada data dosen</div>
                                    <div className="dt-empty-sub">Belum ada dosen yang terdaftar saat ini</div>
                                </div>
                            </td></tr>
                         ) : paged.map(dosen => (
                            <tr key={dosen.id}>
                                <td>
                                    <div className="dt-name-cell">
                                        <div className="dt-avatar" style={{ background: getColor(dosen.nama) }}>
                                            {getInitials(dosen.nama)}
                                        </div>
                                        <span className="dt-name">{dosen.nama}</span>
                                    </div>
                                </td>
                                <td><span className="dt-nip">{dosen.identifier}</span></td>
                                <td>
                                    {dosen.prodi?.nama
                                        ? <span className="dt-prodi-badge"><BookOpen size={11} />{dosen.prodi.nama}</span>
                                        : <span style={{ color: '#d1d5db' }}>—</span>}
                                </td>
                                <td className="center">
                                    <div className="dt-action-group">
                                        <button className="dt-action-btn dt-btn-edit" title="Edit" onClick={() => onEdit(dosen)}>
                                            <Edit size={14} />
                                        </button>
                                        <button className="dt-action-btn dt-btn-del" title="Hapus" onClick={() => onDelete(dosen.id)}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && lecturers.length > 0 && (
                <Pagination totalItems={lecturers.length} itemsPerPage={ITEMS} currentPage={currentPage} onPageChange={setCurrentPage} />
            )}
        </div>
    );
}