// pages/panitia/jadwal-ujian.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import { CalendarDays, ClipboardList, Clock3, CheckCircle2 } from 'lucide-react';
import ScheduleModal from '../../components/panitia/ScheduleModal';

export default function JadwalUjianPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [data, setData] = useState({ proposals: [], lecturers: [] });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/panitia/ta/jadwal-ujian');
            if (res.ok) setData(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else fetchData();
    }, [isAuthenticated, router]);

    const handleOpenModal = (app) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleSaveSchedule = async (payload) => {
        try {
            const res = await fetch('/api/panitia/ta/jadwal-ujian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Gagal menyimpan jadwal');
            alert('Jadwal berhasil disimpan!');
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const scheduled = data.proposals.filter(p => p.exam_date).length;
    const unscheduled = data.proposals.filter(p => !p.exam_date).length;

    if (!user) return null;

    return (
        <Layout>
            <style>{pageStyles}</style>

            {/* ── Header ── */}
            <div style={styles.pageHeader}>
                <div style={styles.pageHeaderLeft}>
                    <div style={styles.iconBadge}>
                        <CalendarDays size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={styles.pageTitle}>Penjadwalan Ujian Proposal</h1>
                        <p style={styles.pageSubtitle}>Kelola jadwal, ruangan, dan tim penguji untuk setiap proposal</p>
                    </div>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div style={styles.statsRow}>
                <div style={{ ...styles.statCard, borderTop: '3px solid #1a3c6e' }}>
                    <ClipboardList size={20} color="#1a3c6e" />
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{data.proposals.length}</span>
                        <span style={styles.statLabel}>Total Proposal</span>
                    </div>
                </div>
                <div style={{ ...styles.statCard, borderTop: '3px solid #38a169' }}>
                    <CheckCircle2 size={20} color="#38a169" />
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{scheduled}</span>
                        <span style={styles.statLabel}>Sudah Dijadwalkan</span>
                    </div>
                </div>
                <div style={{ ...styles.statCard, borderTop: '3px solid #dd6b20' }}>
                    <Clock3 size={20} color="#dd6b20" />
                    <div style={styles.statInfo}>
                        <span style={styles.statValue}>{unscheduled}</span>
                        <span style={styles.statLabel}>Belum Dijadwalkan</span>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={styles.tableCard}>
                <div style={styles.tableHeader}>
                    <span style={styles.tableTitle}>Daftar Proposal Disetujui</span>
                    {!loading && (
                        <span style={styles.tableBadge}>{data.proposals.length} entry</span>
                    )}
                </div>

                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr style={styles.theadRow}>
                                <th style={{ ...styles.th, width: 32 }}>#</th>
                                <th style={styles.th}>Mahasiswa</th>
                                <th style={styles.th}>Judul Proposal</th>
                                <th style={styles.th}>Jadwal & Penguji</th>
                                <th style={{ ...styles.th, textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={styles.tdEmpty}>
                                        <div style={styles.loadingDots}>
                                            <span className="dot" />
                                            <span className="dot" />
                                            <span className="dot" />
                                        </div>
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Memuat data…</p>
                                    </td>
                                </tr>
                            ) : data.proposals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={styles.tdEmpty}>
                                        <ClipboardList size={36} color="#cbd5e0" />
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Belum ada proposal yang disetujui.</p>
                                    </td>
                                </tr>
                            ) : (
                                data.proposals.map((app, idx) => (
                                    <tr key={app.id} className="table-row" style={styles.tr}>
                                        <td style={{ ...styles.td, color: '#94a3b8', fontSize: 12, width: 32 }}>{idx + 1}</td>
                                        <td style={styles.td}>
                                            <div style={styles.studentName}>{app.mahasiswa.nama}</div>
                                            <div style={styles.studentId}>{app.mahasiswa.identifier}</div>
                                        </td>
                                        <td style={{ ...styles.td, maxWidth: 260 }}>
                                            <p style={styles.proposalTitle}>{app.proposal_title}</p>
                                        </td>
                                        <td style={styles.td}>
                                            {app.exam_date ? (
                                                <div style={styles.scheduleInfo}>
                                                    <div style={styles.scheduleBadge}>
                                                        <CalendarDays size={12} color="#1a3c6e" />
                                                        <span>
                                                            {new Date(app.exam_date).toLocaleDateString('id-ID', {
                                                                weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div style={styles.scheduleDetail}>
                                                        <Clock3 size={11} color="#64748b" />
                                                        <span>
                                                            {new Date(app.exam_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                            &nbsp;·&nbsp;{app.exam_room}
                                                        </span>
                                                    </div>
                                                    {app.examiners?.length > 0 && (
                                                        <div style={styles.examinerList}>
                                                            {app.examiners.map((e, i) => (
                                                                <span key={i} style={styles.examinerChip}>
                                                                    {i === 0 ? '👑' : '·'} {e.dosen.nama}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span style={styles.unscheduledBadge}>Belum dijadwalkan</span>
                                            )}
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'center' }}>
                                            <button
                                                className="action-btn"
                                                onClick={() => handleOpenModal(app)}
                                                style={app.exam_date ? styles.btnEdit : styles.btnSchedule}
                                            >
                                                <CalendarDays size={13} />
                                                {app.exam_date ? 'Edit Jadwal' : 'Atur Jadwal'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSchedule}
                application={selectedApp}
                lecturers={data.lecturers}
            />
        </Layout>
    );
}

/* ────────────────── Inline Styles ────────────────── */
const styles = {
    pageHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24,
    },
    pageHeaderLeft: {
        display: 'flex', alignItems: 'center', gap: 16,
    },
    iconBadge: {
        width: 48, height: 48, borderRadius: 12,
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
        flexShrink: 0,
    },
    pageTitle: {
        fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif",
        letterSpacing: '-0.3px',
    },
    pageSubtitle: {
        fontSize: 13, color: '#64748b', margin: '2px 0 0', fontWeight: 400,
    },
    statsRow: {
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24,
    },
    statCard: {
        background: '#fff', borderRadius: 12, padding: '16px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
    },
    statInfo: { display: 'flex', flexDirection: 'column' },
    statValue: { fontSize: 24, fontWeight: 700, color: '#0f172a', lineHeight: 1.1 },
    statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
    tableCard: {
        background: '#fff', borderRadius: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.05)',
        overflow: 'hidden',
    },
    tableHeader: {
        padding: '18px 24px', borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#f8fafc',
    },
    tableTitle: { fontSize: 14, fontWeight: 600, color: '#1e293b', letterSpacing: 0.2 },
    tableBadge: {
        fontSize: 11, fontWeight: 600, color: '#475569',
        background: '#e2e8f0', borderRadius: 20, padding: '2px 10px',
    },
    tableWrapper: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    theadRow: { background: '#f1f5f9' },
    th: {
        padding: '11px 20px', textAlign: 'left',
        fontSize: 11, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        borderBottom: '1px solid #e2e8f0',
        whiteSpace: 'nowrap',
    },
    tr: { transition: 'background 0.15s ease' },
    td: {
        padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
        verticalAlign: 'top', color: '#1e293b',
    },
    tdEmpty: {
        padding: '52px 20px', textAlign: 'center',
        color: '#94a3b8',
    },
    studentName: { fontWeight: 600, fontSize: 13, color: '#1e293b' },
    studentId: { fontSize: 11, color: '#94a3b8', marginTop: 2, fontFamily: 'monospace' },
    proposalTitle: {
        fontSize: 13, color: '#334155', lineHeight: 1.5,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', margin: 0,
    },
    scheduleInfo: { display: 'flex', flexDirection: 'column', gap: 4 },
    scheduleBadge: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600, color: '#1a3c6e',
    },
    scheduleDetail: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 11, color: '#475569',
    },
    examinerList: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    examinerChip: {
        fontSize: 10, background: '#eff6ff', color: '#2563eb',
        borderRadius: 20, padding: '2px 8px', fontWeight: 500,
        border: '1px solid #bfdbfe',
    },
    unscheduledBadge: {
        display: 'inline-block', fontSize: 11, color: '#92400e',
        background: '#fef3c7', borderRadius: 20, padding: '3px 10px',
        fontWeight: 500, border: '1px solid #fde68a',
    },
    btnSchedule: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: '#fff',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 2px 8px rgba(37,99,235,0.25)',
        transition: 'all 0.2s ease',
    },
    btnEdit: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 8, border: '1.5px solid #2563eb', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff',
        transition: 'all 0.2s ease',
    },
    loadingDots: { display: 'flex', gap: 6, justifyContent: 'center' },
};

const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&display=swap');

    .table-row:hover td { background: #f8fafc !important; }

    .action-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(37,99,235,0.3) !important;
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
        40% { transform: scale(1.2); opacity: 1; }
    }

    @media (max-width: 640px) {
        .stats-row { grid-template-columns: 1fr !important; }
    }
`;