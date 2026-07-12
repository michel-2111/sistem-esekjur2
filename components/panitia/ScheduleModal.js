// components/panitia/ScheduleModal.js
import { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, MapPin, User, Plus, Trash2, GraduationCap } from 'lucide-react';

export default function ScheduleModal({ isOpen, onClose, onSave, application, lecturers }) {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        room: '',
        penguji: [''],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (application && isOpen) {
            let defaultDate = '';
            let defaultTime = '';
            let defaultPenguji = [''];

            if (application.exam_date) {
                const dateObj = new Date(application.exam_date);
                defaultDate = dateObj.toISOString().split('T')[0];
                defaultTime = dateObj.toTimeString().substring(0, 5);
            }

            if (application.examiners && application.examiners.length > 0) {
                const ketua = application.examiners.find(e => e.peran === 'ketua')?.dosen_id || '';
                const anggotaIds = application.examiners
                    .filter(e => e.peran === 'anggota')
                    .map(e => e.dosen_id);
                if (ketua || anggotaIds.length > 0) {
                    defaultPenguji = [ketua, ...anggotaIds];
                }
            }

            setFormData({
                date: defaultDate,
                time: defaultTime,
                room: application.exam_room || '',
                penguji: defaultPenguji,
            });
        }
    }, [application, isOpen]);

    const handleAddPenguji = () => {
        setFormData(prev => ({ ...prev, penguji: [...prev.penguji, ''] }));
    };

    const handleRemovePenguji = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            penguji: prev.penguji.filter((_, i) => i !== indexToRemove),
        }));
    };

    const handlePengujiChange = (index, value) => {
        const newPenguji = [...formData.penguji];
        newPenguji[index] = value;
        setFormData(prev => ({ ...prev, penguji: newPenguji }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.penguji.some(p => p === '')) {
            return alert('Harap pilih dosen untuk semua slot penguji, atau hapus slot yang tidak perlu.');
        }
        const uniquePenguji = new Set(formData.penguji);
        if (uniquePenguji.size !== formData.penguji.length) {
            return alert('Tidak boleh memilih dosen yang sama untuk 2 slot penguji berbeda.');
        }
        setIsSubmitting(true);
        await onSave({ appId: application.id, ...formData });
        setIsSubmitting(false);
    };

    if (!isOpen || !application) return null;

    return (
        <>
            <style>{modalStyles}</style>

            {/* Backdrop */}
            <div className="modal-backdrop" onClick={onClose} style={styles.backdrop} />

            {/* Modal */}
            <div style={styles.modalWrapper}>
                <div className="modal-panel" style={styles.modal}>

                    {/* ── Header ── */}
                    <div style={styles.modalHeader}>
                        <div style={styles.headerLeft}>
                            <div style={styles.headerIcon}>
                                <Calendar size={18} color="#fff" />
                            </div>
                            <div>
                                <h3 style={styles.modalTitle}>Atur Jadwal Ujian</h3>
                                <p style={styles.modalSubtitle}>Lengkapi informasi jadwal di bawah ini</p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose} style={styles.closeBtn}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* ── Proposal Info Banner ── */}
                    <div style={styles.proposalBanner}>
                        <div style={styles.bannerIcon}>
                            <GraduationCap size={18} color="#1a3c6e" />
                        </div>
                        <div style={styles.bannerInfo}>
                            <p style={styles.bannerName}>{application.mahasiswa.nama}</p>
                            <p style={styles.bannerTitle}>{application.proposal_title}</p>
                        </div>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} style={styles.form}>

                        {/* Date & Time */}
                        <div style={styles.formGrid}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <Calendar size={13} color="#64748b" />
                                    Tanggal Ujian
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="form-input"
                                    style={styles.input}
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>
                                    <Clock size={13} color="#64748b" />
                                    Jam Mulai
                                </label>
                                <input
                                    type="time"
                                    required
                                    className="form-input"
                                    style={styles.input}
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Room */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>
                                <MapPin size={13} color="#64748b" />
                                Ruangan
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Lab Komputer 1 / Ruang Sidang A"
                                className="form-input"
                                style={styles.input}
                                value={formData.room}
                                onChange={e => setFormData({ ...formData, room: e.target.value })}
                            />
                        </div>

                        {/* Penguji Section */}
                        <div style={styles.pengujiSection}>
                            <div style={styles.pengujiHeader}>
                                <div style={styles.pengujiHeaderLeft}>
                                    <User size={14} color="#1a3c6e" />
                                    <span style={styles.pengujiTitle}>Tim Penguji</span>
                                    <span style={styles.pengujiCount}>{formData.penguji.length} orang</span>
                                </div>
                                <button
                                    type="button"
                                    className="add-btn"
                                    onClick={handleAddPenguji}
                                    style={styles.addBtn}
                                >
                                    <Plus size={13} />
                                    Tambah Penguji
                                </button>
                            </div>

                            <div style={styles.pengujiList}>
                                {formData.penguji.map((p, index) => (
                                    <div key={index} style={styles.pengujiRow}>
                                        <div style={styles.pengujiRoleBadge(index)}>
                                            {index === 0 ? '👑 Ketua' : `Anggota ${index}`}
                                        </div>
                                        <div style={styles.pengujiSelectWrapper}>
                                            <select
                                                required
                                                className="form-input"
                                                style={{ ...styles.input, ...styles.select }}
                                                value={p}
                                                onChange={e => handlePengujiChange(index, e.target.value)}
                                            >
                                                <option value="">— Pilih Dosen —</option>
                                                {lecturers.map(d => (
                                                    <option
                                                        key={d.id}
                                                        value={d.id}
                                                        disabled={
                                                            formData.penguji.includes(d.id.toString()) &&
                                                            p !== d.id.toString()
                                                        }
                                                    >
                                                        {d.nama}
                                                    </option>
                                                ))}
                                            </select>
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => handleRemovePenguji(index)}
                                                    style={styles.removeBtn}
                                                    title="Hapus penguji ini"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Footer Buttons ── */}
                        <div style={styles.formFooter}>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={onClose}
                                style={styles.cancelBtn}
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="submit-btn"
                                style={isSubmitting ? { ...styles.submitBtn, opacity: 0.65, cursor: 'not-allowed' } : styles.submitBtn}
                            >
                                <Save size={15} />
                                {isSubmitting ? 'Menyimpan…' : 'Simpan Jadwal'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

/* ────────────────── Inline Styles ────────────────── */
const styles = {
    backdrop: {
        position: 'fixed', inset: 0, zIndex: 49,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
    },
    modalWrapper: {
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        pointerEvents: 'none',
    },
    modal: {
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(15,23,42,0.25), 0 4px 16px rgba(15,23,42,0.1)',
        pointerEvents: 'all',
        fontFamily: "'Inter', system-ui, sans-serif",
    },
    modalHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 24px 16px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        borderRadius: '16px 16px 0 0',
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
    headerIcon: {
        width: 40, height: 40, borderRadius: 10,
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
        flexShrink: 0,
    },
    modalTitle: {
        fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0,
        fontFamily: "'Lora', Georgia, serif", letterSpacing: '-0.2px',
    },
    modalSubtitle: { fontSize: 12, color: '#64748b', margin: '2px 0 0' },
    closeBtn: {
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid #e2e8f0', background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: '#64748b', transition: 'all 0.15s ease',
    },
    proposalBanner: {
        margin: '0 24px', marginTop: 16,
        padding: '12px 14px', borderRadius: 10,
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        border: '1px solid #bfdbfe',
        display: 'flex', alignItems: 'flex-start', gap: 10,
    },
    bannerIcon: {
        width: 32, height: 32, borderRadius: 8,
        background: '#dbeafe', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
    },
    bannerInfo: { flex: 1, minWidth: 0 },
    bannerName: { fontSize: 13, fontWeight: 700, color: '#1a3c6e', margin: '0 0 3px' },
    bannerTitle: {
        fontSize: 12, color: '#3b82f6', margin: 0, lineHeight: 1.45,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    form: { padding: '20px 24px 24px' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
    label: {
        display: 'flex', alignItems: 'center', gap: 5,
        fontSize: 12, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    input: {
        padding: '9px 12px', borderRadius: 8, fontSize: 13,
        border: '1.5px solid #e2e8f0', outline: 'none',
        color: '#1e293b', background: '#fff',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        width: '100%', boxSizing: 'border-box',
    },
    select: { appearance: 'auto', cursor: 'pointer' },
    pengujiSection: {
        background: '#f8fafc', borderRadius: 10,
        border: '1.5px solid #e2e8f0',
        padding: '14px 16px', marginTop: 6,
    },
    pengujiHeader: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 12,
    },
    pengujiHeaderLeft: { display: 'flex', alignItems: 'center', gap: 6 },
    pengujiTitle: { fontSize: 12, fontWeight: 700, color: '#1a3c6e', textTransform: 'uppercase', letterSpacing: '0.5px' },
    pengujiCount: {
        fontSize: 10, background: '#dbeafe', color: '#1d4ed8',
        borderRadius: 20, padding: '1px 7px', fontWeight: 600,
    },
    addBtn: {
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 600, color: '#2563eb',
        background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
    pengujiList: { display: 'flex', flexDirection: 'column', gap: 10 },
    pengujiRow: { display: 'flex', flexDirection: 'column', gap: 4 },
    pengujiRoleBadge: (index) => ({
        fontSize: 10, fontWeight: 600,
        color: index === 0 ? '#92400e' : '#475569',
        letterSpacing: '0.3px',
    }),
    pengujiSelectWrapper: { display: 'flex', alignItems: 'center', gap: 6 },
    removeBtn: {
        flexShrink: 0, width: 34, height: 34, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fff', border: '1.5px solid #fca5a5',
        color: '#ef4444', cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
    formFooter: {
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        gap: 10, marginTop: 20, paddingTop: 16,
        borderTop: '1px solid #f1f5f9',
    },
    cancelBtn: {
        padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        color: '#64748b', background: '#f1f5f9',
        border: '1.5px solid #e2e8f0', cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
    submitBtn: {
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700,
        color: '#fff', border: 'none', cursor: 'pointer',
        background: 'linear-gradient(135deg, #1a3c6e 0%, #2563eb 100%)',
        boxShadow: '0 3px 12px rgba(37,99,235,0.35)',
        transition: 'all 0.2s ease',
        letterSpacing: '0.1px',
    },
};

const modalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

    .modal-panel { animation: modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }

    @keyframes modal-in {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .form-input:focus {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 3px rgba(37,99,235,0.12) !important;
    }

    .close-btn:hover { background: #f1f5f9 !important; color: #1e293b !important; }

    .add-btn:hover { background: #dbeafe !important; border-color: #93c5fd !important; }

    .remove-btn:hover { background: #fef2f2 !important; }

    .cancel-btn:hover { background: #e2e8f0 !important; color: #334155 !important; }

    .submit-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(37,99,235,0.4) !important;
    }

    .modal-backdrop { animation: fade-in 0.2s ease; }
    @keyframes fade-in {
        from { opacity: 0; }
        to   { opacity: 1; }
    }
`;