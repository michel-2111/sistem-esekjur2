// pages/kajur/persetujuan-pembimbing.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import {
    Check, Clock, CheckCircle, Edit, Trash2, Save,
    X, CheckSquare, Users, GraduationCap, Plus,
    ShieldCheck, AlertTriangle, BookOpen,
} from 'lucide-react';

export default function PersetujuanPembimbingKajurPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [data, setData] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formDosenIds, setFormDosenIds] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kajur/ta/persetujuan-pembimbing');
            if (res.ok) {
                const result = await res.json();
                setData(result.data);
                setLecturers(result.lecturers);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetchData();
    }, [isAuthenticated, router]);

    const pendingCount  = data.filter(i => i.status_kajur === 'menunggu_persetujuan').length;
    const approvedCount = data.filter(i => i.status_kajur === 'disetujui').length;

    const handleBatchApproval = async () => {
        if (!confirm(`Setujui SEMUA (${pendingCount}) usulan yang sedang menunggu?`)) return;
        setIsProcessing(true);
        try {
            const res = await fetch('/api/kajur/ta/persetujuan-pembimbing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ batch: true, status: 'disetujui' }),
            });
            if (!res.ok) throw new Error('Gagal menyetujui masal');
            alert(`Berhasil menyetujui ${pendingCount} plotting pembimbing!`);
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsProcessing(false); }
    };

    const handleApproval = async (mahasiswa_id, status) => {
        if (!confirm('Setujui usulan ini?')) return;
        setIsProcessing(true);
        try {
            const res = await fetch('/api/kajur/ta/persetujuan-pembimbing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mahasiswa_id, status }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan persetujuan');
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsProcessing(false); }
    };

    const openModal = (item) => {
        setSelectedStudent(item);
        setFormDosenIds(
            item.pembimbing?.length > 0
                ? item.pembimbing.map(p => p.dosen_id)
                : ['']
        );
        setIsModalOpen(true);
    };

    const handleFormChange = (index, value) => {
        const arr = [...formDosenIds];
        arr[index] = value ? Number(value) : '';
        setFormDosenIds(arr);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        const validIds = [...new Set(formDosenIds.filter(id => id !== ''))];
        if (validIds.length === 0) return alert('Pilih minimal 1 dosen pembimbing!');
        setIsProcessing(true);
        try {
            const res = await fetch('/api/kajur/ta/persetujuan-pembimbing', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mahasiswa_id: selectedStudent.mahasiswa_id,
                    status: 'disetujui',
                    dosen_ids: validIds,
                }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan perubahan');
            alert('Plotting berhasil diubah dan disetujui!');
            setIsModalOpen(false);
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsProcessing(false); }
    };

    if (!user) return null;

    return (
        <Layout>
            <style>{pageStyles}</style>

            {/* ── Page Header ── */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <div style={s.headerIcon}>
                        <ShieldCheck size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={s.pageTitle}>Persetujuan Pembimbing TA</h1>
                        <p style={s.pageSubtitle}>Review dan setujui usulan plotting pembimbing dari panitia</p>
                    </div>
                </div>

                <button
                    className="btn-batch"
                    style={pendingCount === 0 || isProcessing
                        ? { ...s.btnBatch, opacity: 0.5, cursor: 'not-allowed' }
                        : s.btnBatch
                    }
                    onClick={handleBatchApproval}
                    disabled={isProcessing || pendingCount === 0}
                >
                    <CheckSquare size={16} />
                    Setujui Semua
                    {pendingCount > 0 && (
                        <span style={s.batchCountPill}>{pendingCount}</span>
                    )}
                </button>
            </div>

            {/* ── Pending alert banner ── */}
            {pendingCount > 0 && !loading && (
                <div style={s.pendingBanner}>
                    <AlertTriangle size={16} color="#92400e" />
                    <p style={s.pendingBannerText}>
                        Terdapat <strong>{pendingCount}</strong> usulan pembimbing yang menunggu review Anda.
                    </p>
                </div>
            )}

            {/* ── Stat Cards ── */}
            <div style={s.statsGrid}>
                <div style={{ ...s.statCard, borderTop: '3px solid #1a3c6e' }}>
                    <Users size={20} color="#1a3c6e" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{data.length}</span>
                        <span style={s.statLbl}>Total Usulan</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #d97706' }}>
                    <Clock size={20} color="#d97706" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{pendingCount}</span>
                        <span style={s.statLbl}>Menunggu Review</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #16a34a' }}>
                    <CheckCircle size={20} color="#16a34a" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{approvedCount}</span>
                        <span style={s.statLbl}>Disetujui</span>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={s.tableCard}>
                <div style={s.tableTopBar}>
                    <span style={s.tableTitle}>Daftar Usulan Pembimbing</span>
                    {!loading && <span style={s.tableBadge}>{data.length} entri</span>}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.theadRow}>
                                <th style={{ ...s.th, width: 32 }}>#</th>
                                <th style={s.th}>Mahasiswa</th>
                                {/* ── Kolom baru ── */}
                                <th style={s.th}>Judul Proposal</th>
                                <th style={s.th}>Usulan Pembimbing</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={s.tdEmpty}>
                                        <div style={s.dotRow}>
                                            <span className="dot" /><span className="dot" /><span className="dot" />
                                        </div>
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Memuat data…</p>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={s.tdEmpty}>
                                        <GraduationCap size={36} color="#cbd5e0" />
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Belum ada usulan pembimbing.</p>
                                    </td>
                                </tr>
                            ) : data.map((item, idx) => {
                                const isApproved = item.status_kajur === 'disetujui';

                                return (
                                    <tr key={item.mahasiswa_id} className="approval-row" style={s.tr}>
                                        <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>

                                        {/* Mahasiswa */}
                                        <td style={s.td}>
                                            <div style={s.studentName}>{item.mahasiswa.nama}</div>
                                            <div style={s.studentId}>{item.mahasiswa.identifier}</div>
                                        </td>

                                        {/* ── Judul Proposal ── */}
                                        <td style={{ ...s.td, maxWidth: 240 }}>
                                            {item.proposal_title ? (
                                                <div style={s.proposalTitleWrap}>
                                                    <BookOpen size={11} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                                                    <p style={s.proposalTitle}>{item.proposal_title}</p>
                                                </div>
                                            ) : (
                                                <span style={s.noData}>—</span>
                                            )}
                                        </td>

                                        {/* Pembimbing */}
                                        <td style={s.td}>
                                            <div style={s.supervisorList}>
                                                {item.pembimbing.map((p, i) => (
                                                    <div key={p.id} style={s.supervisorItem}>
                                                        <span style={s.supervisorNum}>{i + 1}</span>
                                                        <span style={s.supervisorName}>{p.nama_dosen}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            {isApproved ? (
                                                <span style={s.badgeApproved}>
                                                    <CheckCircle size={12} /> Disetujui
                                                </span>
                                            ) : (
                                                <span style={s.badgePending}>
                                                    <Clock size={12} /> Menunggu Review
                                                </span>
                                            )}
                                        </td>

                                        {/* Aksi */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <div style={s.actionCol}>
                                                <button
                                                    className="btn-approve"
                                                    style={isApproved || isProcessing
                                                        ? { ...s.btnApprove, opacity: 0.4, cursor: 'not-allowed' }
                                                        : s.btnApprove
                                                    }
                                                    onClick={() => handleApproval(item.mahasiswa_id, 'disetujui')}
                                                    disabled={isProcessing || isApproved}
                                                    title="Setujui usulan"
                                                >
                                                    <Check size={13} /> Setuju
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    style={isProcessing
                                                        ? { ...s.btnEdit, opacity: 0.4, cursor: 'not-allowed' }
                                                        : s.btnEdit
                                                    }
                                                    onClick={() => openModal(item)}
                                                    disabled={isProcessing}
                                                    title="Ubah & Setujui"
                                                >
                                                    <Edit size={13} /> Edit &amp; Setuju
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal Edit & Setuju ── */}
            {isModalOpen && selectedStudent && (
                <>
                    <div style={s.backdrop} onClick={() => setIsModalOpen(false)} />
                    <div style={s.modalWrapper}>
                        <div className="modal-panel" style={s.modal}>

                            {/* Header */}
                            <div style={s.modalHeader}>
                                <div style={s.modalHeaderLeft}>
                                    <div style={s.modalHeaderIcon}>
                                        <ShieldCheck size={17} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={s.modalTitle}>Edit &amp; Setujui Pembimbing</h3>
                                        <p style={s.modalSubtitle}>Ubah susunan dosen jika diperlukan, lalu setujui</p>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)} style={s.closeBtn}>
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Student banner */}
                            <div style={s.studentBanner}>
                                <div style={s.bannerIcon}>
                                    <GraduationCap size={18} color="#1a3c6e" />
                                </div>
                                <div>
                                    <p style={s.bannerName}>{selectedStudent.mahasiswa.nama}</p>
                                    <p style={s.bannerIdentifier}>{selectedStudent.mahasiswa.identifier}</p>
                                    {/* ── Judul proposal di banner modal ── */}
                                    {selectedStudent.proposal_title && (
                                        <p style={s.bannerProposal}>{selectedStudent.proposal_title}</p>
                                    )}
                                </div>
                            </div>

                            {/* Form */}
                            <form id="form-edit-kajur" onSubmit={handleSaveEdit} style={s.modalForm}>
                                <div style={s.dosenSection}>
                                    <div style={s.dosenSectionHeader}>
                                        <span style={s.dosenSectionTitle}>Dosen Pembimbing</span>
                                        <span style={s.dosenCount}>
                                            {formDosenIds.filter(v => v !== '').length} dipilih
                                        </span>
                                    </div>

                                    <div style={s.dosenList}>
                                        {formDosenIds.map((val, idx) => (
                                            <div key={idx} style={s.dosenRow}>
                                                <div style={s.dosenRowLabel}>Pembimbing {idx + 1}</div>
                                                <div style={s.dosenRowInputs}>
                                                    <select
                                                        required
                                                        className="form-input"
                                                        style={s.select}
                                                        value={val}
                                                        onChange={e => handleFormChange(idx, e.target.value)}
                                                    >
                                                        <option value="" disabled>— Pilih Dosen —</option>
                                                        {lecturers.map(d => (
                                                            <option
                                                                key={d.id} value={d.id}
                                                                disabled={formDosenIds.includes(d.id) && val !== d.id}
                                                            >
                                                                {d.nama}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {formDosenIds.length > 1 && (
                                                        <button
                                                            type="button"
                                                            className="remove-btn"
                                                            onClick={() => setFormDosenIds(formDosenIds.filter((_, i) => i !== idx))}
                                                            style={s.removeBtn}
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        type="button"
                                        className="add-btn"
                                        onClick={() => setFormDosenIds([...formDosenIds, ''])}
                                        style={s.addBtn}
                                    >
                                        <Plus size={13} /> Tambah Pembimbing
                                    </button>
                                </div>

                                <div style={s.modalFooter}>
                                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>
                                        Batal
                                    </button>
                                    <button
                                        form="form-edit-kajur" type="submit"
                                        disabled={isProcessing}
                                        className="submit-btn"
                                        style={isProcessing ? { ...s.submitBtn, opacity: 0.65, cursor: 'not-allowed' } : s.submitBtn}
                                    >
                                        {isProcessing ? (
                                            <><span className="spinner" style={s.spinner} /> Memproses…</>
                                        ) : (
                                            <><Save size={15} /> Simpan &amp; Setujui</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
}

/* ─────────── Styles ─────────── */
const s = {
    pageHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, flexWrap: 'wrap', gap: 12,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerIcon: {
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
    },
    pageTitle: {
        fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif", letterSpacing: '-0.3px',
    },
    pageSubtitle: { fontSize: 13, color: '#64748b', margin: '2px 0 0' },

    btnBatch: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 700, color: '#fff',
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        boxShadow: '0 3px 10px rgba(5,150,105,0.3)', transition: 'all 0.2s',
    },
    batchCountPill: {
        background: 'rgba(255,255,255,0.25)', borderRadius: 20,
        padding: '1px 8px', fontSize: 12, fontWeight: 800,
    },

    pendingBanner: {
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#fffbeb', border: '1.5px solid #fde68a',
        borderRadius: 10, padding: '10px 16px', marginBottom: 20,
    },
    pendingBannerText: { fontSize: 13, color: '#78350f', margin: 0 },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 },
    statCard: {
        background: '#fff', borderRadius: 12, padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
    },
    statInfo: { display: 'flex', flexDirection: 'column' },
    statVal:  { fontSize: 24, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 },
    statLbl:  { fontSize: 12, color: '#64748b', marginTop: 2 },

    tableCard: {
        background: '#fff', borderRadius: 14, overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.05)',
    },
    tableTopBar: {
        padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#f8fafc',
    },
    tableTitle: { fontSize: 14, fontWeight: 600, color: '#1e293b', letterSpacing: 0.2 },
    tableBadge: {
        fontSize: 11, fontWeight: 600, color: '#475569',
        background: '#e2e8f0', borderRadius: 20, padding: '2px 10px',
    },
    table:    { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    theadRow: { background: '#f1f5f9' },
    th: {
        padding: '11px 20px', textAlign: 'left',
        fontSize: 11, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
    },
    tr:      { transition: 'background 0.15s' },
    td:      { padding: '13px 20px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', color: '#1e293b' },
    tdEmpty: { padding: '52px 20px', textAlign: 'center' },
    dotRow:  { display: 'flex', gap: 6, justifyContent: 'center' },

    studentName: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    studentId:   { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' },

    // Judul proposal
    proposalTitleWrap: { display: 'flex', alignItems: 'flex-start', gap: 6 },
    proposalTitle: {
        fontSize: 12, color: '#334155', lineHeight: 1.5, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    noData: { color: '#cbd5e0', fontSize: 12 },

    supervisorList: { display: 'flex', flexDirection: 'column', gap: 5 },
    supervisorItem: { display: 'flex', alignItems: 'center', gap: 7 },
    supervisorNum: {
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        background: '#eff6ff', border: '1px solid #bfdbfe',
        fontSize: 10, fontWeight: 700, color: '#2563eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    supervisorName: { fontSize: 12, fontWeight: 600, color: '#1d4ed8' },

    badgeApproved: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#15803d',
        background: '#f0fdf4', border: '1px solid #bbf7d0',
        borderRadius: 20, padding: '3px 10px',
    },
    badgePending: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#92400e',
        background: '#fffbeb', border: '1px solid #fde68a',
        borderRadius: 20, padding: '3px 10px',
    },

    actionCol: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch', minWidth: 120 },
    btnApprove: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 7, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: '#fff',
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        boxShadow: '0 2px 8px rgba(5,150,105,0.25)', transition: 'all 0.15s',
    },
    btnEdit: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff', border: '1.5px solid #bfdbfe', transition: 'all 0.15s',
    },

    // Modal
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 49,
        background: 'rgba(15,23,42,0.56)', backdropFilter: 'blur(4px)',
    },
    modalWrapper: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500,
        maxHeight: '90vh', boxShadow: '0 20px 60px rgba(15,23,42,0.28)',
        pointerEvents: 'all', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column',
    },
    modalHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 14px', flexShrink: 0,
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    },
    modalHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    modalHeaderIcon: {
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(5,150,105,0.3)',
    },
    modalTitle: {
        fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif",
    },
    modalSubtitle: { fontSize: 11, color: '#64748b', margin: '2px 0 0' },
    closeBtn: {
        width: 30, height: 30, borderRadius: 7,
        border: '1px solid #e2e8f0', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b',
    },

    studentBanner: {
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '12px 22px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderBottom: '1px solid #bfdbfe', flexShrink: 0,
    },
    bannerIcon: {
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: '#dbeafe', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginTop: 2,
    },
    bannerName:       { fontSize: 13, fontWeight: 700, color: '#1a3c6e', margin: 0 },
    bannerIdentifier: { fontSize: 11, color: '#3b82f6', margin: '2px 0 0', fontFamily: 'monospace' },
    // ── style baru untuk judul di banner modal ──
    bannerProposal: {
        fontSize: 11, color: '#475569', margin: '5px 0 0',
        lineHeight: 1.5, fontStyle: 'italic',
    },

    modalForm: { padding: '18px 22px 22px', overflowY: 'auto', flex: 1 },

    dosenSection: {
        background: '#f8fafc', borderRadius: 12,
        border: '1.5px solid #e2e8f0', overflow: 'hidden', marginBottom: 16,
    },
    dosenSectionHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 14px', borderBottom: '1px solid #e2e8f0', background: '#fff',
    },
    dosenSectionTitle: {
        fontSize: 11, fontWeight: 700, color: '#1a3c6e',
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    dosenCount: {
        fontSize: 10, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff', borderRadius: 20, padding: '1px 8px',
        border: '1px solid #bfdbfe',
    },
    dosenList: { padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
    dosenRow:  { display: 'flex', flexDirection: 'column', gap: 4 },
    dosenRowLabel: {
        fontSize: 11, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.4px',
    },
    dosenRowInputs: { display: 'flex', alignItems: 'center', gap: 7 },
    select: {
        flex: 1, padding: '9px 12px', borderRadius: 8, fontSize: 13,
        border: '1.5px solid #e2e8f0', outline: 'none',
        color: '#1e293b', background: '#fff', cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s', fontFamily: 'inherit',
    },
    removeBtn: {
        width: 36, height: 36, flexShrink: 0, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fef2f2', border: '1.5px solid #fecaca',
        color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s',
    },
    addBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        margin: '6px 14px 14px', fontSize: 12, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 7, padding: '6px 12px', cursor: 'pointer', transition: 'all 0.15s',
    },
    modalFooter: {
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 16, borderTop: '1px solid #f1f5f9',
    },
    cancelBtn: {
        padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        color: '#64748b', background: '#f1f5f9',
        border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s',
    },
    submitBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        color: '#fff', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        boxShadow: '0 3px 12px rgba(5,150,105,0.35)', transition: 'all 0.2s',
    },
    spinner: {
        width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff', display: 'inline-block',
    },
};

const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .approval-row:hover td { background: #f8fafc !important; }
    .btn-batch:hover:not(:disabled)   { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5,150,105,0.38) !important; }
    .btn-approve:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(5,150,105,0.35) !important; }
    .btn-edit:hover:not(:disabled)    { background: #dbeafe !important; border-color: #93c5fd !important; }
    .add-btn:hover    { background: #dbeafe !important; border-color: #93c5fd !important; }
    .remove-btn:hover { background: #fee2e2 !important; }
    .cancel-btn:hover { background: #e2e8f0 !important; color: #334155 !important; }
    .submit-btn:hover:not(:disabled)  { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(5,150,105,0.4) !important; }
    .close-btn:hover  { background: #f1f5f9 !important; }
    .form-input:focus { border-color: #059669 !important; box-shadow: 0 0 0 3px rgba(5,150,105,0.12) !important; }

    .modal-panel { animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes modal-in {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .spinner { animation: spin 0.7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #cbd5e0; display: inline-block;
        animation: pulse-dot 1.2s ease-in-out infinite;
    }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse-dot {
        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
        40%            { transform: scale(1.2); opacity: 1; }
    }
`;