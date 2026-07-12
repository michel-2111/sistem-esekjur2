// pages/panitia/rekap-nilai.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import {
    FileText, CheckCircle, Clock, X, Users,
    CalendarDays, QrCode, ClipboardCheck, Hourglass,
} from 'lucide-react';
import BeritaAcaraQR from '../../components/BeritaAcaraQR';

export default function RekapNilaiPanitiaPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [rekap, setRekap] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetch('/api/panitia/ta/rekap-nilai')
            .then(res => res.json())
            .then(data => setRekap(data))
            .finally(() => setLoading(false));
    }, [isAuthenticated, router]);

    if (!user) return null;

    // Derived stats
    const totalUjian   = rekap.length;
    const selesaiCount = rekap.filter(app => {
        const total = app.examiners.length;
        const sudah = app.examiners.filter(e => e.status_penilaian === 'sudah_menilai').length;
        return total > 0 && total === sudah;
    }).length;
    const menungguCount = totalUjian - selesaiCount;

    return (
        <Layout>
            <style>{pageStyles}</style>

            {/* ── Page Header ── */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <div style={s.headerIcon}>
                        <ClipboardCheck size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={s.pageTitle}>Rekap Nilai &amp; Berita Acara Ujian</h1>
                        <p style={s.pageSubtitle}>Pantau status penilaian dan akses QR berita acara setiap penguji</p>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div style={s.statsGrid}>
                <div style={{ ...s.statCard, borderTop: '3px solid #1a3c6e' }}>
                    <FileText size={20} color="#1a3c6e" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{totalUjian}</span>
                        <span style={s.statLbl}>Total Ujian</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #16a34a' }}>
                    <CheckCircle size={20} color="#16a34a" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{selesaiCount}</span>
                        <span style={s.statLbl}>Penilaian Selesai</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #d97706' }}>
                    <Hourglass size={20} color="#d97706" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{menungguCount}</span>
                        <span style={s.statLbl}>Menunggu Penilaian</span>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={s.tableCard}>
                <div style={s.tableTopBar}>
                    <span style={s.tableTitle}>Daftar Rekap Ujian Proposal</span>
                    {!loading && <span style={s.tableBadge}>{totalUjian} entri</span>}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.theadRow}>
                                <th style={{ ...s.th, width: 32 }}>#</th>
                                <th style={s.th}>Mahasiswa</th>
                                <th style={s.th}>Judul &amp; Jadwal</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Status Penilaian</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Penguji</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Berita Acara</th>
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
                            ) : rekap.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={s.tdEmpty}>
                                        <FileText size={36} color="#cbd5e0" />
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Belum ada data ujian.</p>
                                    </td>
                                </tr>
                            ) : rekap.map((app, idx) => {
                                const totalPenguji = app.examiners.length;
                                const sudahMenilai = app.examiners.filter(e => e.status_penilaian === 'sudah_menilai').length;
                                const isSelesai    = totalPenguji > 0 && totalPenguji === sudahMenilai;
                                const progress     = totalPenguji > 0 ? (sudahMenilai / totalPenguji) * 100 : 0;

                                return (
                                    <tr key={app.id} className="rekap-row" style={s.tr}>
                                        {/* No */}
                                        <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>

                                        {/* Mahasiswa */}
                                        <td style={s.td}>
                                            <div style={s.studentName}>{app.mahasiswa.nama}</div>
                                            <div style={s.studentId}>{app.mahasiswa.identifier}</div>
                                            <div style={s.studentProdi}>{app.mahasiswa.prodi?.nama}</div>
                                        </td>

                                        {/* Judul & Jadwal */}
                                        <td style={{ ...s.td, maxWidth: 260 }}>
                                            <p style={s.proposalTitle} title={app.proposal_title}>
                                                {app.proposal_title}
                                            </p>
                                            <div style={s.examDate}>
                                                <CalendarDays size={11} color="#2563eb" />
                                                {new Date(app.exam_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                })}
                                            </div>
                                        </td>

                                        {/* Status Penilaian */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <div style={s.statusCell}>
                                                {isSelesai
                                                    ? <span style={s.badgeSelesai}><CheckCircle size={12} /> Selesai</span>
                                                    : <span style={s.badgeMenunggu}><Clock size={12} /> Menunggu</span>
                                                }
                                                {/* Progress bar */}
                                                <div style={s.progressWrap}>
                                                    <div style={s.progressTrack}>
                                                        <div style={{
                                                            ...s.progressFill,
                                                            width: `${progress}%`,
                                                            background: isSelesai
                                                                ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                                                                : 'linear-gradient(90deg,#d97706,#fbbf24)',
                                                        }} />
                                                    </div>
                                                    <span style={s.progressLabel}>{sudahMenilai}/{totalPenguji}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Penguji chips */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <div style={s.pengujiChips}>
                                                {app.examiners.map((e, i) => (
                                                    <span key={i} style={{
                                                        ...s.pengujiChip,
                                                        ...(e.status_penilaian === 'sudah_menilai'
                                                            ? s.chipDone : s.chipPending),
                                                    }}>
                                                        {i === 0 ? '👑' : '·'} {e.dosen.nama.split(' ')[0]}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Berita Acara */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <button
                                                className="btn-qr"
                                                style={s.btnQR}
                                                onClick={() => setSelectedApp(app)}
                                            >
                                                <QrCode size={13} /> Lihat QR
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── QR Modal ── */}
            {selectedApp && (
                <>
                    <div style={s.backdrop} onClick={() => setSelectedApp(null)} />
                    <div style={s.modalWrapper}>
                        <div className="modal-panel" style={s.modal}>

                            {/* Modal Header */}
                            <div style={s.modalHeader}>
                                <div style={s.modalHeaderLeft}>
                                    <div style={s.modalHeaderIcon}>
                                        <QrCode size={18} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={s.modalTitle}>Berita Acara &amp; QR Code</h3>
                                        <p style={s.modalSubtitle}>
                                            {selectedApp.mahasiswa.nama} · {selectedApp.mahasiswa.identifier}
                                        </p>
                                    </div>
                                </div>
                                <button className="close-btn" style={s.closeBtn} onClick={() => setSelectedApp(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Proposal info strip */}
                            <div style={s.modalInfoStrip}>
                                <div style={s.modalInfoItem}>
                                    <span style={s.modalInfoLabel}>Judul Proposal</span>
                                    <span style={s.modalInfoVal}>{selectedApp.proposal_title}</span>
                                </div>
                                <div style={s.modalInfoDivider} />
                                <div style={s.modalInfoItem}>
                                    <span style={s.modalInfoLabel}>Tanggal Ujian</span>
                                    <span style={s.modalInfoVal}>
                                        {new Date(selectedApp.exam_date).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Section label */}
                            <div style={s.qrSectionLabel}>
                                <Users size={14} color="#1a3c6e" />
                                <span>QR Code per Penguji</span>
                                <span style={s.qrSectionCount}>{selectedApp.examiners.length} penguji</span>
                            </div>

                            {/* QR Grid */}
                            <div style={s.qrGrid}>
                                {selectedApp.examiners.map((exam, i) => (
                                    <div key={exam.id} style={s.qrCard}>
                                        <div style={s.qrCardHeader}>
                                            <span style={i === 0 ? s.qrRoleBadgeKetua : s.qrRoleBadgeAnggota}>
                                                {i === 0 ? '👑 Ketua Penguji' : `Anggota ${i}`}
                                            </span>
                                            <span style={{
                                                ...s.qrStatusDot,
                                                background: exam.status_penilaian === 'sudah_menilai' ? '#22c55e' : '#fbbf24',
                                            }} />
                                        </div>
                                        <p style={s.qrDosenName}>{exam.dosen.nama}</p>
                                        <div style={s.qrCodeWrap}>
                                            <BeritaAcaraQR
                                                token={exam.berita_acara_token}
                                                dosenName={exam.dosen.nama}
                                                peran={exam.peran === 'ketua' ? 'Ketua Penguji' : 'Anggota Penguji'}
                                            />
                                        </div>
                                        <span style={{
                                            ...s.qrStatusLabel,
                                            ...(exam.status_penilaian === 'sudah_menilai' ? s.qrStatusDone : s.qrStatusPending),
                                        }}>
                                            {exam.status_penilaian === 'sudah_menilai'
                                                ? <><CheckCircle size={11} /> Sudah Menilai</>
                                                : <><Clock size={11} /> Belum Menilai</>
                                            }
                                        </span>
                                    </div>
                                ))}
                            </div>
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
        display: 'flex', alignItems: 'center', marginBottom: 24,
    },
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

    studentName:  { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    studentId:    { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' },
    studentProdi: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

    proposalTitle: {
        fontSize: 12, color: '#334155', lineHeight: 1.5, margin: '0 0 5px',
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    examDate: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#2563eb',
    },

    // Status cell
    statusCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
    badgeSelesai: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#15803d',
        background: '#f0fdf4', borderRadius: 20, padding: '3px 10px',
        border: '1px solid #bbf7d0',
    },
    badgeMenunggu: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#92400e',
        background: '#fffbeb', borderRadius: 20, padding: '3px 10px',
        border: '1px solid #fde68a',
    },
    progressWrap:  { display: 'flex', alignItems: 'center', gap: 6, width: '100%', maxWidth: 120 },
    progressTrack: { flex: 1, height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' },
    progressFill:  { height: '100%', borderRadius: 99, transition: 'width 0.4s ease' },
    progressLabel: { fontSize: 10, fontWeight: 700, color: '#64748b', minWidth: 24 },

    // Penguji chips
    pengujiChips: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
    pengujiChip:  { fontSize: 10, borderRadius: 20, padding: '2px 9px', fontWeight: 500, whiteSpace: 'nowrap' },
    chipDone:    { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    chipPending: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },

    btnQR: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: '#fff',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
        transition: 'all 0.2s',
    },

    // Modal
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 49,
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
    },
    modalWrapper: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 720,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(15,23,42,0.28)',
        pointerEvents: 'all', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
        display: 'flex', flexDirection: 'column',
    },
    modalHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 24px 14px', flexShrink: 0,
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
    },
    modalHeaderLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    modalHeaderIcon: {
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
    },
    modalTitle: {
        fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif",
    },
    modalSubtitle: { fontSize: 12, color: '#64748b', margin: '2px 0 0' },
    closeBtn: {
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid #e2e8f0', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b', flexShrink: 0,
    },

    modalInfoStrip: {
        display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap',
        padding: '12px 24px', background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9', gap: 16, flexShrink: 0,
    },
    modalInfoItem:    { display: 'flex', flexDirection: 'column', gap: 2 },
    modalInfoLabel:   { fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    modalInfoVal:     { fontSize: 12, fontWeight: 600, color: '#1e293b', maxWidth: 300 },
    modalInfoDivider: { width: 1, height: 32, background: '#e2e8f0', alignSelf: 'center' },

    qrSectionLabel: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '14px 24px 10px', fontSize: 12, fontWeight: 700,
        color: '#1a3c6e', flexShrink: 0,
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    qrSectionCount: {
        fontSize: 10, fontWeight: 600, color: '#475569',
        background: '#e2e8f0', borderRadius: 20, padding: '1px 8px',
        textTransform: 'none', letterSpacing: 0,
    },

    qrGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: 16, padding: '0 24px 24px', overflowY: 'auto',
    },
    qrCard: {
        background: '#f8fafc', borderRadius: 12,
        border: '1.5px solid #e2e8f0',
        padding: '14px 12px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        transition: 'box-shadow 0.15s',
    },
    qrCardHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%',
    },
    qrRoleBadgeKetua: {
        fontSize: 10, fontWeight: 700, color: '#6d28d9',
        background: '#ede9fe', borderRadius: 20, padding: '2px 8px',
        border: '1px solid #ddd6fe',
    },
    qrRoleBadgeAnggota: {
        fontSize: 10, fontWeight: 700, color: '#1d4ed8',
        background: '#eff6ff', borderRadius: 20, padding: '2px 8px',
        border: '1px solid #bfdbfe',
    },
    qrStatusDot: {
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
    },
    qrDosenName: {
        fontSize: 12, fontWeight: 600, color: '#1e293b',
        textAlign: 'center', margin: 0, lineHeight: 1.3,
    },
    qrCodeWrap: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: '#fff', borderRadius: 8, padding: 8,
        border: '1px solid #e2e8f0', width: '100%',
    },
    qrStatusLabel: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '3px 10px',
    },
    qrStatusDone:    { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
    qrStatusPending: { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
};

const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .rekap-row:hover td { background: #f8fafc !important; }
    .btn-qr:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important; }
    .close-btn:hover { background: #f1f5f9 !important; }

    .modal-panel { 
        animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        overflow-y: auto !important;
    }
    @keyframes modal-in {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .qr-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important; }

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