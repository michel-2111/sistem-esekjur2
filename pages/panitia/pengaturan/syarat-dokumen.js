// pages/panitia/ta/syarat-dokumen.js
import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useAppContext } from '../../../context/AppContext';
import { useRouter } from 'next/router';
import {
    FileText, Plus, Pencil, Trash2, X, Save,
    ToggleLeft, ToggleRight, ClipboardList, CheckCircle2, XCircle,
} from 'lucide-react';

export default function SyaratDokumenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [requirements, setRequirements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        jurusan_id: '',
        nama: '',
        deskripsi: '',
        is_active: true,
    });

    const fetchRequirements = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/panitia/ta/requirements');
            if (res.ok) setRequirements(await res.json());
        } catch (err) {
            console.error('Gagal mengambil data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user) {
            setFormData(prev => ({ ...prev, jurusan_id: user.jurusan_id || user.jurusanId || 'J001' }));
            fetchRequirements();
        }
    }, [isAuthenticated, user, router]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const openModal = (req = null) => {
        if (req) {
            setEditId(req.id);
            setFormData({ jurusan_id: req.jurusan_id, nama: req.nama, deskripsi: req.deskripsi || '', is_active: req.is_active });
        } else {
            setEditId(null);
            setFormData({ jurusan_id: user?.jurusan_id || user?.jurusanId || 'J001', nama: '', deskripsi: '', is_active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const url = editId ? `/api/panitia/ta/requirements/${editId}` : '/api/panitia/ta/requirements';
        try {
            const res = await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) { setIsModalOpen(false); fetchRequirements(); }
            else alert('Gagal menyimpan data');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus syarat ini?')) return;
        try {
            const res = await fetch(`/api/panitia/ta/requirements/${id}`, { method: 'DELETE' });
            if (res.ok) fetchRequirements();
            else alert('Gagal menghapus data');
        } catch (err) { console.error(err); }
    };

    if (!user) return null;

    // Stats
    const totalReq  = requirements.length;
    const activeReq = requirements.filter(r => r.is_active).length;
    const inactiveReq = totalReq - activeReq;

    return (
        <Layout>
            <style>{pageStyles}</style>

            {/* ── Page Header ── */}
            <div style={s.pageHeader}>
                <div style={s.headerLeft}>
                    <div style={s.headerIcon}>
                        <FileText size={22} color="#fff" />
                    </div>
                    <div>
                        <h1 style={s.pageTitle}>Pengaturan Syarat Dokumen TA</h1>
                        <p style={s.pageSubtitle}>Kelola daftar dokumen yang wajib disiapkan mahasiswa</p>
                    </div>
                </div>
                <button className="btn-add" style={s.btnAdd} onClick={() => openModal()}>
                    <Plus size={16} />
                    Tambah Syarat
                </button>
            </div>

            {/* ── Stat Cards ── */}
            <div style={s.statsGrid}>
                <div style={{ ...s.statCard, borderTop: '3px solid #1a3c6e' }}>
                    <ClipboardList size={20} color="#1a3c6e" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{totalReq}</span>
                        <span style={s.statLbl}>Total Syarat</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #16a34a' }}>
                    <CheckCircle2 size={20} color="#16a34a" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{activeReq}</span>
                        <span style={s.statLbl}>Aktif</span>
                    </div>
                </div>
                <div style={{ ...s.statCard, borderTop: '3px solid #dc2626' }}>
                    <XCircle size={20} color="#dc2626" />
                    <div style={s.statInfo}>
                        <span style={s.statVal}>{inactiveReq}</span>
                        <span style={s.statLbl}>Nonaktif</span>
                    </div>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div style={s.tableCard}>
                <div style={s.tableTopBar}>
                    <span style={s.tableTitle}>Daftar Syarat Dokumen</span>
                    {!isLoading && <span style={s.tableBadge}>{totalReq} entri</span>}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.theadRow}>
                                <th style={{ ...s.th, width: 32 }}>#</th>
                                <th style={s.th}>Nama Dokumen</th>
                                <th style={s.th}>Deskripsi</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                                <th style={{ ...s.th, textAlign: 'center' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} style={s.tdEmpty}>
                                        <div style={s.dotRow}>
                                            <span className="dot" /><span className="dot" /><span className="dot" />
                                        </div>
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Memuat data…</p>
                                    </td>
                                </tr>
                            ) : requirements.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={s.tdEmpty}>
                                        <FileText size={36} color="#cbd5e0" />
                                        <p style={{ marginTop: 10, color: '#94a3b8', fontSize: 14 }}>Belum ada syarat dokumen.</p>
                                    </td>
                                </tr>
                            ) : (
                                requirements.map((req, idx) => (
                                    <tr key={req.id} className="req-row" style={s.tr}>
                                        <td style={{ ...s.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                                        <td style={s.td}>
                                            <div style={s.docName}>{req.nama}</div>
                                        </td>
                                        <td style={{ ...s.td, maxWidth: 320 }}>
                                            <p style={s.docDesc}>{req.deskripsi || <span style={{ color: '#cbd5e0', fontStyle: 'italic' }}>—</span>}</p>
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            {req.is_active ? (
                                                <span style={s.badgeActive}>
                                                    <ToggleRight size={13} /> Aktif
                                                </span>
                                            ) : (
                                                <span style={s.badgeInactive}>
                                                    <ToggleLeft size={13} /> Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'center' }}>
                                            <div style={s.actionRow}>
                                                <button
                                                    className="btn-edit"
                                                    style={s.btnEdit}
                                                    onClick={() => openModal(req)}
                                                    title="Edit"
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    style={s.btnDelete}
                                                    onClick={() => handleDelete(req.id)}
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={13} /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modal ── */}
            {isModalOpen && (
                <>
                    <div style={s.backdrop} onClick={() => setIsModalOpen(false)} />
                    <div style={s.modalWrapper}>
                        <div className="modal-panel" style={s.modal}>

                            {/* Modal Header */}
                            <div style={s.modalHeader}>
                                <div style={s.modalHeaderLeft}>
                                    <div style={s.modalHeaderIcon}>
                                        <FileText size={17} color="#fff" />
                                    </div>
                                    <div>
                                        <h3 style={s.modalTitle}>{editId ? 'Edit Syarat Dokumen' : 'Tambah Syarat Baru'}</h3>
                                        <p style={s.modalSubtitle}>{editId ? 'Perbarui informasi syarat' : 'Isi detail dokumen yang diperlukan'}</p>
                                    </div>
                                </div>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)} style={s.closeBtn}>
                                    <X size={17} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} style={s.modalForm}>
                                <div style={s.fieldGroup}>
                                    <label style={s.label}>Nama Dokumen</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        required
                                        placeholder="Contoh: Transkrip Nilai"
                                        className="form-input"
                                        style={s.input}
                                    />
                                </div>

                                <div style={s.fieldGroup}>
                                    <label style={s.label}>
                                        Deskripsi
                                        <span style={s.optionalTag}>Opsional</span>
                                    </label>
                                    <textarea
                                        name="deskripsi"
                                        value={formData.deskripsi}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Keterangan tambahan mengenai dokumen ini…"
                                        className="form-input"
                                        style={{ ...s.input, resize: 'vertical', minHeight: 80 }}
                                    />
                                </div>

                                {/* Toggle Switch */}
                                <div style={s.toggleRow}>
                                    <div>
                                        <p style={s.toggleLabel}>Status Syarat</p>
                                        <p style={s.toggleDesc}>Syarat aktif akan ditampilkan kepada mahasiswa</p>
                                    </div>
                                    <label style={s.switchWrap} className="switch-wrap">
                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleChange}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{
                                            ...s.switchTrack,
                                            background: formData.is_active ? '#2563eb' : '#cbd5e0',
                                        }}>
                                            <div style={{
                                                ...s.switchThumb,
                                                left: formData.is_active ? '22px' : '3px',
                                            }} />
                                        </div>
                                        <span style={{
                                            ...s.switchText,
                                            color: formData.is_active ? '#2563eb' : '#94a3b8',
                                        }}>
                                            {formData.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </label>
                                </div>

                                {/* Footer Buttons */}
                                <div style={s.modalFooter}>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setIsModalOpen(false)}
                                        style={s.cancelBtn}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="submit-btn"
                                        style={isSubmitting ? { ...s.submitBtn, opacity: 0.65, cursor: 'not-allowed' } : s.submitBtn}
                                    >
                                        <Save size={15} />
                                        {isSubmitting ? 'Menyimpan…' : 'Simpan'}
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

/* ─────────────── Styles ─────────────── */
const s = {
    pageHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
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
    btnAdd: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
        fontSize: 13, fontWeight: 700, color: '#fff',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
        transition: 'all 0.2s', letterSpacing: '0.1px',
    },

    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 },
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
        padding: '11px 20px', textAlign: 'left',
        fontSize: 11, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.6px',
        borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap',
    },
    tr: { transition: 'background 0.15s' },
    td: { padding: '13px 20px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', color: '#1e293b' },
    tdEmpty: { padding: '52px 20px', textAlign: 'center' },
    dotRow: { display: 'flex', gap: 6, justifyContent: 'center' },

    docName: { fontSize: 13, fontWeight: 600, color: '#1e293b' },
    docDesc: {
        fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0,
        display: '-webkit-box', WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical', overflow: 'hidden',
    },
    badgeActive: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#15803d',
        background: '#f0fdf4', borderRadius: 20, padding: '3px 11px',
        border: '1px solid #bbf7d0',
    },
    badgeInactive: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#b91c1c',
        background: '#fef2f2', borderRadius: 20, padding: '3px 11px',
        border: '1px solid #fecaca',
    },
    actionRow: { display: 'inline-flex', gap: 8, alignItems: 'center' },
    btnEdit: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 7, border: '1.5px solid #bfdbfe',
        fontSize: 12, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff', cursor: 'pointer', transition: 'all 0.15s',
    },
    btnDelete: {
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '5px 12px', borderRadius: 7, border: '1.5px solid #fecaca',
        fontSize: 12, fontWeight: 600, color: '#dc2626',
        background: '#fef2f2', cursor: 'pointer', transition: 'all 0.15s',
    },

    // Modal
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 49,
        background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
    },
    modalWrapper: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
    },
    modal: {
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(15,23,42,0.25)',
        pointerEvents: 'all', overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif",
    },
    modalHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 14px',
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
        fontFamily: "'Lora', Georgia, serif", letterSpacing: '-0.2px',
    },
    modalSubtitle: { fontSize: 11, color: '#64748b', margin: '2px 0 0' },
    closeBtn: {
        width: 30, height: 30, borderRadius: 7,
        border: '1px solid #e2e8f0', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b',
    },
    modalForm: { padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: {
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 12, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    optionalTag: {
        fontSize: 10, fontWeight: 500, color: '#94a3b8',
        background: '#f1f5f9', borderRadius: 10, padding: '1px 7px',
        textTransform: 'none', letterSpacing: 0,
    },
    input: {
        padding: '9px 12px', borderRadius: 8, fontSize: 13,
        border: '1.5px solid #e2e8f0', outline: 'none',
        color: '#1e293b', background: '#fff',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        width: '100%', boxSizing: 'border-box',
        fontFamily: 'inherit',
    },

    // Toggle switch
    toggleRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
        border: '1.5px solid #e2e8f0',
    },
    toggleLabel: { fontSize: 13, fontWeight: 600, color: '#1e293b', margin: 0 },
    toggleDesc: { fontSize: 11, color: '#94a3b8', margin: '3px 0 0' },
    switchWrap: {
        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
    },
    switchTrack: {
        width: 42, height: 24, borderRadius: 12, position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
    },
    switchThumb: {
        position: 'absolute', top: 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        transition: 'left 0.2s',
    },
    switchText: { fontSize: 12, fontWeight: 600, transition: 'color 0.2s' },

    modalFooter: {
        display: 'flex', justifyContent: 'flex-end', gap: 10,
        paddingTop: 16, borderTop: '1px solid #f1f5f9',
    },
    cancelBtn: {
        padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        color: '#64748b', background: '#f1f5f9',
        border: '1.5px solid #e2e8f0', cursor: 'pointer',
        transition: 'all 0.15s',
    },
    submitBtn: {
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        color: '#fff', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 3px 12px rgba(37,99,235,0.35)',
        transition: 'all 0.2s',
    },
};

const pageStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .req-row:hover td { background: #f8fafc !important; }

    .btn-add:hover    { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(37,99,235,0.38) !important; }
    .btn-edit:hover   { background: #dbeafe !important; border-color: #93c5fd !important; }
    .btn-delete:hover { background: #fee2e2 !important; border-color: #fca5a5 !important; }
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