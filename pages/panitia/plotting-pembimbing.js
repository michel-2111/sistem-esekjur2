// pages/panitia/plotting-pembimbing.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import {
    Save, UserPlus, Clock, XCircle, CheckCircle,
    Trash2, X, Users, Plus, Lock, GraduationCap, BookOpen,
} from 'lucide-react';

export default function PlottingPembimbingPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [students, setStudents] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formDosenIds, setFormDosenIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/panitia/ta/plotting-pembimbing');
            if (res.ok) {
                const { data, lecturers } = await res.json();
                setStudents(data);
                setLecturers(lecturers);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetchData();
    }, [isAuthenticated, router]);

    const openModal = (student) => {
        setSelectedStudent(student);
        setFormDosenIds(
            student.supervisors?.length > 0
                ? student.supervisors.map(s => s.dosen.id)
                : ['']
        );
        setIsModalOpen(true);
    };

    const handleFormChange = (index, value) => {
        const arr = [...formDosenIds];
        arr[index] = value ? Number(value) : '';
        setFormDosenIds(arr);
    };

    const addField    = () => setFormDosenIds([...formDosenIds, '']);
    const removeField = (i) => setFormDosenIds(formDosenIds.filter((_, idx) => idx !== i));

    const handleSave = async (e) => {
        e.preventDefault();
        const validIds = [...new Set(formDosenIds.filter(id => id !== ''))];
        if (validIds.length === 0) return alert('Pilih minimal 1 dosen pembimbing!');
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/panitia/ta/plotting-pembimbing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mahasiswa_id: selectedStudent.mahasiswa_id, dosen_ids: validIds }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan plotting');
            alert('Plotting berhasil diperbarui!');
            setIsModalOpen(false);
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsSubmitting(false); }
    };

    if (!user) return null;

    const totalStudents  = students.length;
    const sudahPlotting  = students.filter(s => s.supervisors?.length > 0).length;
    const disetujuiCount = students.filter(s => s.supervisors?.[0]?.status_kajur === 'disetujui').length;

    const statusConfig = {
        disetujui:            { icon: CheckCircle, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Disetujui Kajur' },
        menunggu_persetujuan: { icon: Clock,       color: '#92400e', bg: '#fffbeb', border: '#fde68a', label: 'Menunggu Kajur'  },
        ditolak:              { icon: XCircle,     color: '#b91c1c', bg: '#fef2f2', border: '#fecaca', label: 'Ditolak Kajur'   },
    };

    const StatusBadge = ({ status }) => {
        const cfg = statusConfig[status];
        if (!cfg) return <span style={{ color: '#cbd5e0' }}>—</span>;
        const Icon = cfg.icon;
        return (
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600, color: cfg.color,
                background: cfg.bg, border: `1px solid ${cfg.border}`,
                borderRadius: 20, padding: '3px 10px',
            }}>
                <Icon size={12} />{cfg.label}
            </span>
        );
    };

    return (
        <Layout>
            <style>{pageStyles}</style>

            {/* ── Page Header ── */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <div style={s.headerIcon}>
                        <Users size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={s.pageTitle}>Plotting Pembimbing TA</h1>
                        <p style={s.pageSubtitle}>Tugaskan dosen pembimbing untuk setiap mahasiswa</p>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div style={s.statsGrid}>
                <div style={{ ...s.statCard, borderTop: '3px solid #1a3c6e' }}>
                    <GraduationCap size={20} color="#1a3c6e" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{totalStudents}</span>
                        <span style={s.statLbl}>Total Mahasiswa</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #2563eb' }}>
                    <UserPlus size={20} color="#2563eb" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{sudahPlotting}</span>
                        <span style={s.statLbl}>Sudah di-Plot</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #16a34a' }}>
                    <CheckCircle size={20} color="#16a34a" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{disetujuiCount}</span>
                        <span style={s.statLbl}>Disetujui Kajur</span>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={s.tableCard}>
                <div style={s.tableTopBar}>
                    <span style={s.tableTitle}>Daftar Mahasiswa TA</span>
                    {!loading && <span style={s.tableBadge}>{totalStudents} mahasiswa</span>}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.theadRow}>
                                <th style={{ ...s.th, width: 32 }}>#</th>
                                <th style={s.th}>Mahasiswa</th>
                                {/* ── ① Kolom baru ── */}
                                <th style={s.th}>Judul Proposal</th>
                                <th style={s.th}>Dosen Pembimbing</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Status Kajur</th>
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
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={s.tdEmpty}>
                                        <GraduationCap size={36} color="#cbd5e0" />
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>
                                            Belum ada mahasiswa yang mengajukan TA.
                                        </p>
                                    </td>
                                </tr>
                            ) : students.map((item, idx) => {
                                const groupStatus = item.supervisors?.[0]?.status_kajur ?? null;
                                const isLocked    = groupStatus === 'disetujui';

                                return (
                                    <tr key={item.mahasiswa_id} className="student-row" style={s.tr}>
                                        <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>

                                        {/* Mahasiswa */}
                                        <td style={s.td}>
                                            <div style={s.studentName}>{item.mahasiswa.nama}</div>
                                            <div style={s.studentId}>{item.mahasiswa.identifier}</div>
                                        </td>

                                        {/* ── ② Cell judul proposal ── */}
                                        <td style={{ ...s.td, maxWidth: 260 }}>
                                            {item.proposal_title ? (
                                                <div style={s.proposalTitleWrap}>
                                                    <BookOpen size={11} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />
                                                    <p style={s.proposalTitle}>{item.proposal_title}</p>
                                                </div>
                                            ) : (
                                                <span style={s.noPembimbing}>Belum ada judul</span>
                                            )}
                                        </td>

                                        {/* Pembimbing */}
                                        <td style={s.td}>
                                            {item.supervisors?.length > 0 ? (
                                                <div style={s.supervisorList}>
                                                    {item.supervisors.map((spv, i) => (
                                                        <div key={spv.id} style={s.supervisorItem}>
                                                            <span style={s.supervisorNum}>{i + 1}</span>
                                                            <span style={s.supervisorName}>{spv.dosen.nama}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={s.noPembimbing}>Belum ada pembimbing</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <StatusBadge status={groupStatus} />
                                        </td>

                                        {/* Aksi */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            {isLocked ? (
                                                <span style={s.lockedBtn} title="Plotting sudah dikunci oleh Kajur">
                                                    <Lock size={12} /> Terkunci
                                                </span>
                                            ) : (
                                                <button
                                                    className="btn-plot"
                                                    style={s.btnPlot}
                                                    onClick={() => openModal(item)}
                                                >
                                                    <UserPlus size={13} />
                                                    {item.supervisors?.length > 0 ? 'Edit Plotting' : 'Atur Pembimbing'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal ── */}
            {isModalOpen && selectedStudent && (
                <>
                    <div style={s.backdrop} onClick={() => setIsModalOpen(false)} />
                    <div style={s.modalWrapper}>
                        <div className="modal-panel" style={s.modal}>

                            {/* Header */}
                            <div style={s.modalHeader}>
                                <div style={s.modalHeaderLeft}>
                                    <div style={s.modalHeaderIcon}>
                                        <UserPlus size={17} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={s.modalTitle}>Atur Pembimbing TA</h3>
                                        <p style={s.modalSubtitle}>Tetapkan 1 atau lebih dosen pembimbing</p>
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
                                </div>
                            </div>

                            {/* Form */}
                            <form id="form-plotting" onSubmit={handleSave} style={s.modalForm}>

                                <div style={s.dosenSection}>
                                    <div style={s.dosenSectionHeader}>
                                        <span style={s.dosenSectionTitle}>Dosen Pembimbing</span>
                                        <span style={s.dosenCount}>{formDosenIds.filter(v => v !== '').length} dipilih</span>
                                    </div>

                                    <div style={s.dosenList}>
                                        {formDosenIds.map((val, idx) => (
                                            <div key={idx} style={s.dosenRow}>
                                                <div style={s.dosenRowLabel}>
                                                    Pembimbing {idx + 1}
                                                </div>
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
                                                            onClick={() => removeField(idx)}
                                                            style={s.removeBtn}
                                                            title="Hapus baris"
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
                                        onClick={addField}
                                        style={s.addBtn}
                                    >
                                        <Plus size={14} /> Tambah Pembimbing Lain
                                    </button>
                                </div>

                                {/* Footer */}
                                <div style={s.modalFooter}>
                                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)} style={s.cancelBtn}>
                                        Batal
                                    </button>
                                    <button
                                        form="form-plotting" type="submit"
                                        disabled={isSubmitting}
                                        className="submit-btn"
                                        style={isSubmitting ? { ...s.submitBtn, opacity: 0.65, cursor: 'not-allowed' } : s.submitBtn}
                                    >
                                        <Save size={15} />
                                        {isSubmitting ? 'Menyimpan…' : 'Simpan Plotting'}
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
    pageHeader: { display: 'flex', alignItems: 'center', marginBottom: 24 },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    headerIcon: {
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
    },
    pageTitle: {
        fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif", letterSpacing: '-0.3px',
    },
    pageSubtitle: { fontSize: 13, color: '#64748b', margin: '2px 0 0' },

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
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    theadRow: { background: '#f1f5f9' },
    th: {
        padding: '11px 20px', textAlign: 'left',
        fontSize: 11, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
    },
    tr: { transition: 'background 0.15s' },
    td: { padding: '13px 20px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', color: '#1e293b' },
    tdEmpty: { padding: '52px 20px', textAlign: 'center' },
    dotRow:  { display: 'flex', gap: 6, justifyContent: 'center' },

    studentName: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    studentId:   { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' },

    // ── ③ Style baru untuk judul proposal ──
    proposalTitleWrap: { display: 'flex', alignItems: 'flex-start', gap: 6 },
    proposalTitle: {
        fontSize: 12, color: '#334155', lineHeight: 1.5, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },

    supervisorList: { display: 'flex', flexDirection: 'column', gap: 5 },
    supervisorItem: { display: 'flex', alignItems: 'center', gap: 7 },
    supervisorNum:  {
        width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
        background: '#eff6ff', border: '1px solid #bfdbfe',
        fontSize: 10, fontWeight: 700, color: '#2563eb',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    supervisorName: { fontSize: 12, fontWeight: 600, color: '#1d4ed8' },
    noPembimbing: {
        fontSize: 11, fontStyle: 'italic', color: '#94a3b8',
        background: '#f8fafc', borderRadius: 6, padding: '3px 9px',
        border: '1px dashed #e2e8f0',
    },

    btnPlot: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: '#fff',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
        transition: 'all 0.2s',
    },
    lockedBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 8,
        fontSize: 11, fontWeight: 600, color: '#94a3b8',
        background: '#f1f5f9', border: '1px solid #e2e8f0',
        cursor: 'not-allowed',
    },

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
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(15,23,42,0.28)',
        pointerEvents: 'all', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column',
    },
    modalHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 14px', flexShrink: 0,
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
    },
    modalHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    modalHeaderIcon: {
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
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
        display: 'flex', alignItems: 'center', gap: 10,
        margin: '0', padding: '12px 22px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderBottom: '1px solid #bfdbfe', flexShrink: 0,
    },
    bannerIcon: {
        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
        background: '#dbeafe', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
    },
    bannerName:       { fontSize: 13, fontWeight: 700, color: '#1a3c6e', margin: 0 },
    bannerIdentifier: { fontSize: 11, color: '#3b82f6', margin: '2px 0 0', fontFamily: 'monospace' },

    modalForm: { padding: '18px 22px 22px', overflowY: 'auto', flex: 1 },

    dosenSection: {
        background: '#f8fafc', borderRadius: 12,
        border: '1.5px solid #e2e8f0', overflow: 'hidden',
        marginBottom: 16,
    },
    dosenSectionHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 14px', borderBottom: '1px solid #e2e8f0',
        background: '#fff',
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
        transition: 'border-color 0.15s, box-shadow 0.15s',
        fontFamily: 'inherit',
    },
    removeBtn: {
        width: 36, height: 36, flexShrink: 0, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fef2f2', border: '1.5px solid #fecaca',
        color: '#ef4444', cursor: 'pointer', transition: 'all 0.15s',
    },
    addBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        margin: '6px 14px 14px',
        fontSize: 12, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 7, padding: '6px 12px', cursor: 'pointer',
        transition: 'all 0.15s',
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
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 3px 12px rgba(37,99,235,0.35)', transition: 'all 0.2s',
    },
};

const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .student-row:hover td { background: #f8fafc !important; }
    .btn-plot:hover  { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,99,235,0.35) !important; }
    .add-btn:hover   { background: #dbeafe !important; border-color: #93c5fd !important; }
    .remove-btn:hover { background: #fee2e2 !important; }
    .cancel-btn:hover { background: #e2e8f0 !important; color: #334155 !important; }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.4) !important; }
    .close-btn:hover  { background: #f1f5f9 !important; }
    .form-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important; }

    .modal-panel { animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes modal-in {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

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