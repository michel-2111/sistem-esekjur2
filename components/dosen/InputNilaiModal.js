// components/dosen/InputNilaiModal.js
import { useState, useEffect } from 'react';
import { X, Save, FileText, CheckCircle, BarChart2, MessageSquare, AlertCircle } from 'lucide-react';

export default function InputNilaiModal({ isOpen, onClose, examData, onSaveSuccess }) {
    const [components, setComponents] = useState([]);
    const [scores, setScores] = useState({});
    const [catatan, setCatatan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingComponents, setLoadingComponents] = useState(true);

    useEffect(() => {
        if (isOpen && examData) {
            setLoadingComponents(true);
            setScores({});
            setCatatan('');
            fetch('/api/dosen/ta/penilaian')
                .then(res => res.json())
                .then(data => setComponents(data))
                .catch(console.error)
                .finally(() => setLoadingComponents(false));
        }
    }, [isOpen, examData]);

    const handleScoreChange = (compId, value) => {
        let val = parseInt(value);
        if (val > 100) val = 100;
        if (val < 0)   val = 0;
        setScores(prev => ({ ...prev, [compId]: isNaN(val) ? '' : val }));
    };

    const calculateTotal = () => {
        let total = 0;
        components.forEach(comp => {
            total += ((scores[comp.id] || 0) * comp.bobot) / 100;
        });
        return total.toFixed(2);
    };

    const totalVal      = parseFloat(calculateTotal());
    const filledCount   = Object.keys(scores).filter(k => scores[k] !== '').length;
    const allFilled     = filledCount === components.length && components.length > 0;
    const progressPct   = components.length > 0 ? (filledCount / components.length) * 100 : 0;

    // Grade color
    const gradeColor = totalVal >= 80 ? '#15803d'
        : totalVal >= 65 ? '#0369a1'
        : totalVal >= 50 ? '#b45309'
        : '#b91c1c';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allFilled) return alert('Harap isi semua komponen penilaian.');
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/dosen/ta/penilaian', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examinerId: examData.id,
                    appId: examData.appId,
                    scores,
                    catatan,
                }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan nilai');
            alert('Berhasil! Nilai tersimpan dan Berita Acara telah di-generate.');
            onSaveSuccess();
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !examData) return null;

    return (
        <>
            <style>{modalStyles}</style>
            <div style={s.backdrop} onClick={onClose} />
            <div style={s.wrapper}>
                <div className="modal-panel" style={s.modal}>

                    {/* ── Header ── */}
                    <div style={s.header}>
                        <div style={s.headerLeft}>
                            <div style={s.headerIcon}>
                                <BarChart2 size={18} color="#fff" />
                            </div>
                            <div>
                                <h3 style={s.headerTitle}>Form Penilaian Ujian</h3>
                                <p style={s.headerSub}>
                                    Mahasiswa: <strong style={{ color: '#1e293b' }}>{examData.mahasiswa}</strong>
                                </p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose} style={s.closeBtn}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── Proposal info banner ── */}
                    <div style={s.infoBanner}>
                        <div style={s.infoItem}>
                            <span style={s.infoLabel}>NIM</span>
                            <span style={s.infoVal}>{examData.nim || '—'}</span>
                        </div>
                        <div style={s.infoDivider} />
                        <div style={s.infoItem}>
                            <span style={s.infoLabel}>Peran Anda</span>
                            <span style={s.infoVal}>
                                {examData.peran === 'ketua' ? '👑 Ketua Penguji' : 'Anggota Penguji'}
                            </span>
                        </div>
                        <div style={s.infoDivider} />
                        <div style={s.infoItem}>
                            <span style={s.infoLabel}>Progres Isian</span>
                            <div style={s.progressRow}>
                                <div style={s.progressTrack}>
                                    <div style={{ ...s.progressFill, width: `${progressPct}%` }} />
                                </div>
                                <span style={s.progressLabel}>{filledCount}/{components.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Scrollable body ── */}
                    <div style={s.body}>
                        {loadingComponents ? (
                            <div style={s.loadingWrap}>
                                <div style={s.dotRow}>
                                    <span className="dot" /><span className="dot" /><span className="dot" />
                                </div>
                                <p style={s.loadingText}>Memuat komponen penilaian…</p>
                            </div>
                        ) : components.length === 0 ? (
                            <div style={s.emptyWrap}>
                                <AlertCircle size={36} color="#fca5a5" />
                                <p style={s.emptyText}>
                                    Panitia belum mengatur komponen penilaian.<br />
                                    Silakan hubungi Panitia TA.
                                </p>
                            </div>
                        ) : (
                            <form id="form-nilai" onSubmit={handleSubmit} style={s.form}>

                                {/* Komponen penilaian */}
                                <div style={s.sectionCard}>
                                    <div style={s.sectionHeader}>
                                        <FileText size={15} color="#1a3c6e" />
                                        <span style={s.sectionTitle}>Komponen Penilaian</span>
                                        <span style={s.sectionBadge}>{components.length} komponen</span>
                                    </div>

                                    <div style={s.componentList}>
                                        {components.map((comp, idx) => {
                                            const val        = scores[comp.id];
                                            const hasVal     = val !== undefined && val !== '';
                                            const contrib    = hasVal ? ((val * comp.bobot) / 100).toFixed(1) : null;
                                            const barWidth   = hasVal ? `${val}%` : '0%';

                                            return (
                                                <div key={comp.id} className="comp-item" style={s.compItem}>
                                                    <div style={s.compLeft}>
                                                        <div style={s.compTopRow}>
                                                            <span style={s.compName}>{comp.nama}</span>
                                                            <span style={s.compBobot}>Bobot {comp.bobot}%</span>
                                                        </div>
                                                        {/* Mini bar */}
                                                        <div style={s.compBarTrack}>
                                                            <div style={{
                                                                ...s.compBarFill,
                                                                width: barWidth,
                                                                background: hasVal
                                                                    ? val >= 80 ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                                                                    : val >= 60 ? 'linear-gradient(90deg,#1a3c6e,#2563eb)'
                                                                    : 'linear-gradient(90deg,#d97706,#fbbf24)'
                                                                    : '#e2e8f0',
                                                            }} />
                                                        </div>
                                                        {contrib && (
                                                            <span style={s.compContrib}>Kontribusi: {contrib} poin</span>
                                                        )}
                                                    </div>
                                                    <div style={s.compRight}>
                                                        <div style={s.inputWrap}>
                                                            <input
                                                                type="number"
                                                                min="0" max="100" required
                                                                placeholder="—"
                                                                className="score-input"
                                                                style={{
                                                                    ...s.scoreInput,
                                                                    borderColor: hasVal
                                                                        ? val >= 80 ? '#86efac'
                                                                        : val >= 60 ? '#93c5fd'
                                                                        : '#fde68a'
                                                                        : '#e2e8f0',
                                                                    color: hasVal ? '#0f172a' : '#94a3b8',
                                                                }}
                                                                value={val !== undefined ? val : ''}
                                                                onChange={e => handleScoreChange(comp.id, e.target.value)}
                                                            />
                                                            <span style={s.inputSuffix}>/100</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Total row */}
                                    <div style={s.totalRow}>
                                        <div style={s.totalLeft}>
                                            <span style={s.totalLabel}>Total Nilai Akhir</span>
                                            <span style={s.totalSub}>Berbobot dari semua komponen</span>
                                        </div>
                                        <div style={s.totalRight}>
                                            <span style={{ ...s.totalValue, color: gradeColor }}>{calculateTotal()}</span>
                                            <span style={s.totalMax}>/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Catatan */}
                                <div style={s.catatanCard}>
                                    <div style={s.sectionHeader}>
                                        <MessageSquare size={15} color="#1a3c6e" />
                                        <span style={s.sectionTitle}>Catatan / Revisi</span>
                                        <span style={s.optionalTag}>Opsional</span>
                                    </div>
                                    <textarea
                                        rows={4}
                                        placeholder="Masukkan catatan perbaikan untuk mahasiswa…"
                                        className="form-input"
                                        style={s.textarea}
                                        value={catatan}
                                        onChange={e => setCatatan(e.target.value)}
                                    />
                                </div>
                            </form>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div style={s.footer}>
                        <button type="button" className="cancel-btn" onClick={onClose} style={s.cancelBtn}>
                            Batal
                        </button>
                        <button
                            form="form-nilai"
                            type="submit"
                            disabled={isSubmitting || components.length === 0}
                            className="submit-btn"
                            style={
                                isSubmitting || components.length === 0
                                    ? { ...s.submitBtn, opacity: 0.55, cursor: 'not-allowed' }
                                    : s.submitBtn
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner" style={s.spinner} />
                                    Memproses…
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={15} />
                                    Simpan &amp; Generate Berita Acara
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ─────────── Styles ─────────── */
const s = {
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 49,
        background: 'rgba(15,23,42,0.58)', backdropFilter: 'blur(4px)',
    },
    wrapper: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, pointerEvents: 'none',
    },
    modal: {
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 620,
        maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(15,23,42,0.28)',
        pointerEvents: 'all',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
    },

    // Header
    header: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '18px 22px 14px', flexShrink: 0,
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    headerIcon: {
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
    },
    headerTitle: {
        fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif",
    },
    headerSub: { fontSize: 12, color: '#64748b', margin: '2px 0 0' },
    closeBtn: {
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid #e2e8f0', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b', flexShrink: 0,
    },

    // Info banner
    infoBanner: {
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        padding: '10px 22px', background: '#f8fafc',
        borderBottom: '1px solid #f1f5f9', gap: 14, flexShrink: 0,
    },
    infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
    infoLabel: { fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
    infoVal:   { fontSize: 12, fontWeight: 600, color: '#1e293b' },
    infoDivider: { width: 1, height: 28, background: '#e2e8f0', alignSelf: 'center' },

    progressRow:  { display: 'flex', alignItems: 'center', gap: 6 },
    progressTrack: { width: 80, height: 5, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' },
    progressFill:  {
        height: '100%', borderRadius: 99,
        background: 'linear-gradient(90deg, #1a3c6e, #2563eb)',
        transition: 'width 0.3s ease',
    },
    progressLabel: { fontSize: 11, fontWeight: 700, color: '#2563eb' },

    // Body
    body: { flex: 1, overflowY: 'auto', padding: '18px 22px' },

    loadingWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0' },
    dotRow:      { display: 'flex', gap: 6 },
    loadingText: { marginTop: 12, color: '#94a3b8', fontSize: 13 },

    emptyWrap: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '48px 0', gap: 12,
    },
    emptyText: { fontSize: 13, color: '#64748b', textAlign: 'center', lineHeight: 1.6 },

    form: { display: 'flex', flexDirection: 'column', gap: 16 },

    // Section cards
    sectionCard: {
        background: '#f8fafc', borderRadius: 12,
        border: '1.5px solid #e2e8f0', overflow: 'hidden',
    },
    sectionHeader: {
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
        background: '#fff',
    },
    sectionTitle: { fontSize: 12, fontWeight: 700, color: '#1a3c6e', textTransform: 'uppercase', letterSpacing: '0.5px' },
    sectionBadge: {
        fontSize: 10, fontWeight: 600, color: '#475569',
        background: '#e2e8f0', borderRadius: 20, padding: '1px 8px',
    },
    optionalTag: {
        fontSize: 10, fontWeight: 500, color: '#94a3b8',
        background: '#f1f5f9', borderRadius: 10, padding: '1px 7px',
    },

    // Component items
    componentList: { padding: '8px 0' },
    compItem: {
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '12px 16px',
        borderBottom: '1px solid #f1f5f9',
        transition: 'background 0.12s',
    },
    compLeft:   { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
    compTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    compName:   { fontSize: 13, fontWeight: 600, color: '#1e293b' },
    compBobot:  {
        fontSize: 10, fontWeight: 600, color: '#64748b',
        background: '#e2e8f0', borderRadius: 20, padding: '1px 7px',
    },
    compBarTrack: { height: 4, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' },
    compBarFill:  { height: '100%', borderRadius: 99, transition: 'width 0.35s ease, background 0.35s ease' },
    compContrib:  { fontSize: 10, color: '#64748b', fontStyle: 'italic' },

    compRight: { flexShrink: 0 },
    inputWrap: { display: 'flex', alignItems: 'center', gap: 4 },
    scoreInput: {
        width: 68, height: 40, borderRadius: 8,
        border: '2px solid',
        textAlign: 'center', fontSize: 16, fontWeight: 700,
        outline: 'none', background: '#fff',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        fontFamily: 'inherit',
    },
    inputSuffix: { fontSize: 11, color: '#94a3b8', fontWeight: 500 },

    // Total row
    totalRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        background: '#fff', borderTop: '1.5px solid #e2e8f0',
    },
    totalLeft:  { display: 'flex', flexDirection: 'column' },
    totalLabel: { fontSize: 13, fontWeight: 700, color: '#1e293b' },
    totalSub:   { fontSize: 11, color: '#94a3b8', marginTop: 1 },
    totalRight: { display: 'flex', alignItems: 'baseline', gap: 3 },
    totalValue: { fontSize: 32, fontWeight: 800, lineHeight: 1, transition: 'color 0.3s' },
    totalMax:   { fontSize: 14, color: '#94a3b8', fontWeight: 600 },

    // Catatan
    catatanCard: {
        background: '#f8fafc', borderRadius: 12,
        border: '1.5px solid #e2e8f0', overflow: 'hidden',
    },
    textarea: {
        width: '100%', boxSizing: 'border-box',
        padding: '10px 14px', fontSize: 13, color: '#1e293b',
        border: 'none', outline: 'none', background: 'transparent',
        resize: 'vertical', minHeight: 90,
        fontFamily: 'inherit', lineHeight: 1.55,
    },

    // Footer
    footer: {
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        gap: 10, padding: '14px 22px',
        borderTop: '1px solid #f1f5f9',
        background: '#f8fafc', flexShrink: 0,
    },
    cancelBtn: {
        padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        color: '#64748b', background: '#fff',
        border: '1.5px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s',
    },
    submitBtn: {
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        color: '#fff', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 3px 12px rgba(37,99,235,0.35)', transition: 'all 0.2s',
    },
    spinner: {
        width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        display: 'inline-block',
    },
};

const modalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .modal-panel { animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes modal-in {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .comp-item:hover { background: #fff !important; }
    .comp-item:last-child { border-bottom: none !important; }

    .score-input:focus {
        box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important;
        border-color: #2563eb !important;
    }
    .score-input::-webkit-inner-spin-button,
    .score-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .score-input[type=number] { -moz-appearance: textfield; }

    .form-input:focus { outline: none; }

    .cancel-btn:hover { background: #f1f5f9 !important; color: #334155 !important; }
    .submit-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(37,99,235,0.4) !important;
    }
    .close-btn:hover { background: #f1f5f9 !important; }

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