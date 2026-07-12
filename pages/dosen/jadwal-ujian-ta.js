// pages/dosen/jadwal-ujian.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import {
    Calendar, MapPin, Download, Edit3, CheckCircle,
    BookOpen, Clock, Award, FileText, X, ShieldCheck,
} from 'lucide-react';
import InputNilaiModal from '../../components/dosen/InputNilaiModal';
import BeritaAcaraQR from '@/components/BeritaAcaraQR';

export default function JadwalUjianDosenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [showQR, setShowQR] = useState(null);

    const loadExams = () => {
        setLoading(true);
        fetch('/api/dosen/ta/jadwal-ujian')
            .then(res => res.json())
            .then(data => setExams(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        loadExams();
    }, [isAuthenticated, router]);

    const handleInputNilai = (exam) => {
        setSelectedExam(exam);
        setIsModalOpen(true);
    };

    // Derived stats
    const totalExams   = exams.length;
    const sudahDinilai = exams.filter(e => e.status_penilaian === 'sudah_menilai').length;
    const belumDinilai = totalExams - sudahDinilai;
    const sebagaiKetua = exams.filter(e => e.peran === 'ketua').length;

    if (!user) return null;

    return (
        <Layout>
            <style>{pageStyles}</style>

            {/* ── Page Header ── */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <div style={s.headerIcon}>
                        <Award size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={s.pageTitle}>Jadwal Penguji Proposal TA</h1>
                        <p style={s.pageSubtitle}>Daftar ujian yang ditugaskan kepada Anda sebagai penguji</p>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div style={s.statsGrid}>
                <div style={{ ...s.statCard, borderTop: '3px solid #1a3c6e' }}>
                    <BookOpen size={20} color="#1a3c6e" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{totalExams}</span>
                        <span style={s.statLbl}>Total Ujian</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #0d9488' }}>
                    <CheckCircle size={20} color="#0d9488" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{sudahDinilai}</span>
                        <span style={s.statLbl}>Sudah Dinilai</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #d97706' }}>
                    <Clock size={20} color="#d97706" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{belumDinilai}</span>
                        <span style={s.statLbl}>Belum Dinilai</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #7c3aed' }}>
                    <ShieldCheck size={20} color="#7c3aed" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{sebagaiKetua}</span>
                        <span style={s.statLbl}>Sebagai Ketua</span>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={s.tableCard}>
                <div style={s.tableTopBar}>
                    <span style={s.tableTitle}>Daftar Penugasan Ujian</span>
                    {!loading && (
                        <span style={s.tableBadge}>{totalExams} penugasan</span>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.theadRow}>
                                <th style={{ ...s.th, width: 32 }}>#</th>
                                <th style={s.th}>Waktu &amp; Tempat</th>
                                <th style={s.th}>Mahasiswa</th>
                                <th style={s.th}>Judul Proposal</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Peran</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Penilaian</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={s.tdEmpty}>
                                        <div style={s.dotRow}>
                                            <span className="dot" /><span className="dot" /><span className="dot" />
                                        </div>
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Memuat data…</p>
                                    </td>
                                </tr>
                            ) : exams.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={s.tdEmpty}>
                                        <BookOpen size={36} color="#cbd5e0" />
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>
                                            Belum ada jadwal ujian yang ditugaskan.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                exams.map((exam, idx) => (
                                    <tr key={idx} className="exam-row" style={s.tr}>
                                        {/* No */}
                                        <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>

                                        {/* Waktu & Tempat */}
                                        <td style={{ ...s.td, minWidth: 160 }}>
                                            {exam.tanggal ? (
                                                <div style={s.scheduleCell}>
                                                    <div style={s.scheduleDate}>
                                                        <Calendar size={12} color="#2563eb" />
                                                        {new Date(exam.tanggal).toLocaleDateString('id-ID', {
                                                            weekday: 'long', day: 'numeric', month: 'short',
                                                        })}
                                                    </div>
                                                    <div style={s.scheduleTime}>
                                                        <Clock size={11} color="#64748b" />
                                                        {new Date(exam.tanggal).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit', minute: '2-digit',
                                                        })}
                                                    </div>
                                                    <div style={s.scheduleRoom}>
                                                        <MapPin size={11} color="#94a3b8" />
                                                        {exam.ruangan}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span style={s.unsetBadge}>Belum ditentukan</span>
                                            )}
                                        </td>

                                        {/* Mahasiswa */}
                                        <td style={s.td}>
                                            <div style={s.studentName}>{exam.mahasiswa}</div>
                                            <div style={s.studentNim}>{exam.nim}</div>
                                            <div style={s.studentProdi}>{exam.prodi}</div>
                                        </td>

                                        {/* Judul */}
                                        <td style={{ ...s.td, maxWidth: 220 }}>
                                            <p style={s.judulText} title={exam.judul}>{exam.judul}</p>
                                        </td>

                                        {/* Peran */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <span style={exam.peran === 'ketua' ? s.badgeKetua : s.badgeAnggota}>
                                                {exam.peran === 'ketua' ? '👑 Ketua' : 'Anggota'}
                                            </span>
                                        </td>

                                        {/* Status Penilaian */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            {exam.status_penilaian === 'sudah_menilai' ? (
                                                <span style={s.statusDone}>
                                                    <CheckCircle size={12} />
                                                    Sudah Dinilai
                                                </span>
                                            ) : (
                                                <span style={s.statusPending}>
                                                    <Clock size={12} />
                                                    Menunggu
                                                </span>
                                            )}
                                        </td>

                                        {/* Aksi */}
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <div style={s.actionCol}>
                                                {exam.file_url ? (
                                                    <a
                                                        href={exam.file_url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn-download"
                                                        style={s.btnDownload}
                                                    >
                                                        <Download size={13} />
                                                        Proposal
                                                    </a>
                                                ) : (
                                                    <span style={s.noFile}>
                                                        <FileText size={12} /> Tidak tersedia
                                                    </span>
                                                )}

                                                {exam.status_penilaian === 'sudah_menilai' ? (
                                                    <button
                                                        className="btn-ba"
                                                        style={s.btnBA}
                                                        onClick={() => setShowQR(exam)}
                                                    >
                                                        <CheckCircle size={13} />
                                                        Berita Acara
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn-nilai"
                                                        style={s.btnNilai}
                                                        onClick={() => handleInputNilai(exam)}
                                                    >
                                                        <Edit3 size={13} />
                                                        Input Nilai
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modals ── */}
            <InputNilaiModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                examData={selectedExam}
                onSaveSuccess={loadExams}
            />

            {showQR && (
                <>
                    <div
                        style={s.qrBackdrop}
                        onClick={() => setShowQR(null)}
                    />
                    <div style={s.qrWrapper}>
                        <div className="qr-panel" style={s.qrPanel}>
                            {/* Header */}
                            <div style={s.qrHeader}>
                                <div style={s.qrHeaderLeft}>
                                    <div style={s.qrHeaderIcon}>
                                        <ShieldCheck size={18} color="#fff" />
                                    </div>
                                    <div>
                                        <p style={s.qrTitle}>Berita Acara Digital</p>
                                        <p style={s.qrSubtitle}>Verifikasi kehadiran &amp; penilaian</p>
                                    </div>
                                </div>
                                <button
                                    className="close-btn"
                                    onClick={() => setShowQR(null)}
                                    style={s.qrClose}
                                >
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Info strip */}
                            <div style={s.qrInfoStrip}>
                                <div style={s.qrInfoItem}>
                                    <span style={s.qrInfoLabel}>Mahasiswa</span>
                                    <span style={s.qrInfoVal}>{showQR.mahasiswa}</span>
                                </div>
                                <div style={s.qrInfoDivider} />
                                <div style={s.qrInfoItem}>
                                    <span style={s.qrInfoLabel}>Peran</span>
                                    <span style={s.qrInfoVal}>
                                        {showQR.peran === 'ketua' ? '👑 Ketua Penguji' : 'Anggota Penguji'}
                                    </span>
                                </div>
                            </div>

                            {/* QR */}
                            <div style={s.qrBody}>
                                <BeritaAcaraQR
                                    token={showQR.berita_acara_token}
                                    dosenName={user.nama}
                                    peran={showQR.peran === 'ketua' ? 'Ketua Penguji' : 'Anggota Penguji'}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Layout>
    );
}

/* ─────────────────── Styles ─────────────────── */
const s = {
    pageHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
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

    statsGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24,
    },
    statCard: {
        background: '#fff', borderRadius: 12, padding: '16px 18px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
    },
    statInfo: { display: 'flex', flexDirection: 'column' },
    statVal: { fontSize: 24, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 },
    statLbl: { fontSize: 12, color: '#64748b', marginTop: 2 },

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
        padding: '11px 18px', textAlign: 'left',
        fontSize: 11, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
    },
    tr: { transition: 'background 0.15s' },
    td: {
        padding: '13px 18px', borderBottom: '1px solid #f1f5f9',
        verticalAlign: 'top', color: '#1e293b',
    },
    tdEmpty: { padding: '52px 20px', textAlign: 'center' },
    dotRow: { display: 'flex', gap: 6, justifyContent: 'center' },

    // Schedule cell
    scheduleCell: { display: 'flex', flexDirection: 'column', gap: 3 },
    scheduleDate: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 700, color: '#1e293b',
    },
    scheduleTime: {
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: '#475569',
    },
    scheduleRoom: {
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: '#94a3b8',
    },
    unsetBadge: {
        fontSize: 11, fontStyle: 'italic', color: '#94a3b8',
        background: '#f8fafc', borderRadius: 6, padding: '3px 8px',
        border: '1px dashed #e2e8f0',
    },

    // Student info
    studentName: { fontWeight: 600, fontSize: 13, color: '#1e293b' },
    studentNim: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' },
    studentProdi: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

    // Judul
    judulText: {
        fontSize: 12, color: '#334155', lineHeight: 1.5, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },

    // Badges
    badgeKetua: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#6d28d9',
        background: '#ede9fe', borderRadius: 20, padding: '3px 10px',
        border: '1px solid #ddd6fe',
    },
    badgeAnggota: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#1d4ed8',
        background: '#eff6ff', borderRadius: 20, padding: '3px 10px',
        border: '1px solid #bfdbfe',
    },

    // Status
    statusDone: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#0f766e',
        background: '#f0fdfa', borderRadius: 20, padding: '3px 10px',
        border: '1px solid #99f6e4',
    },
    statusPending: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#92400e',
        background: '#fffbeb', borderRadius: 20, padding: '3px 10px',
        border: '1px solid #fde68a',
    },

    // Action column
    actionCol: { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch', minWidth: 110 },
    btnDownload: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        color: '#475569', background: '#f8fafc',
        border: '1.5px solid #e2e8f0', textDecoration: 'none', cursor: 'pointer',
        transition: 'all 0.15s',
    },
    btnNilai: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        color: '#fff', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
        transition: 'all 0.2s',
    },
    btnBA: {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
        padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 600,
        color: '#0f766e', border: '1.5px solid #99f6e4', cursor: 'pointer',
        background: '#f0fdfa', transition: 'all 0.15s',
    },
    noFile: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: '#94a3b8', fontStyle: 'italic',
    },

    // QR Modal
    qrBackdrop: {
        position: 'fixed', inset: 0, zIndex: 49,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
    },
    qrWrapper: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
    },
    qrPanel: {
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400,
        boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
        pointerEvents: 'all', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
    },
    qrHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 20px 14px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f0fdfa 0%, #f8fafc 100%)',
    },
    qrHeaderLeft: { display: 'flex', alignItems: 'center', gap: 10 },
    qrHeaderIcon: {
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(13,148,136,0.3)',
    },
    qrTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Lora', Georgia, serif" },
    qrSubtitle: { fontSize: 11, color: '#64748b', margin: '2px 0 0' },
    qrClose: {
        width: 30, height: 30, borderRadius: 7,
        border: '1px solid #e2e8f0', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b',
    },
    qrInfoStrip: {
        display: 'flex', alignItems: 'center',
        padding: '12px 20px', background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9', gap: 16,
    },
    qrInfoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
    qrInfoLabel: { fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    qrInfoVal: { fontSize: 12, fontWeight: 600, color: '#1e293b' },
    qrInfoDivider: { width: 1, height: 28, background: '#e2e8f0' },
    qrBody: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        padding: '24px 20px',
    },
};

const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .exam-row:hover td { background: #f8fafc !important; }

    .btn-download:hover { background: #f1f5f9 !important; border-color: #cbd5e0 !important; }
    .btn-nilai:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.35) !important; }
    .btn-ba:hover { background: #ccfbf1 !important; }
    .close-btn:hover { background: #f1f5f9 !important; }

    .qr-panel { animation: qr-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes qr-in {
        from { opacity: 0; transform: scale(0.95) translateY(12px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
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

    @media (max-width: 768px) {
        .stats-grid { grid-template-columns: repeat(2,1fr) !important; }
    }
`;