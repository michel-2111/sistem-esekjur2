// components/kajur/LeaveVerificationModal.js
import { useState } from 'react';
import { X, CheckCircle, XCircle, ShieldCheck, Send, BookOpen, CalendarClock, FileText, AlertTriangle } from 'lucide-react';

const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    .lvm-overlay {
        font-family: 'DM Sans', sans-serif;
        position: fixed; inset: 0;
        background: rgba(8, 12, 28, 0.72);
        backdrop-filter: blur(6px);
        z-index: 50;
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
        animation: lvm-fade 0.18s ease;
    }
    @keyframes lvm-fade { from{opacity:0} to{opacity:1} }
    @keyframes lvm-slide { from{opacity:0;transform:translateY(16px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
    .lvm-card {
        background: #ffffff; border-radius: 18px;
        width: 100%; max-width: 720px;
        max-height: 90vh;
        display: flex; flex-direction: column;
        box-shadow: 0 32px 72px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05);
        animation: lvm-slide 0.24s cubic-bezier(0.34,1.56,0.64,1);
        overflow: hidden;
    }
    .lvm-top-bar { height: 4px; background: linear-gradient(90deg, #3b5bdb, #818cf8); flex-shrink: 0; }
    /* Header */
    .lvm-header {
        display: flex; align-items: flex-start; justify-content: space-between;
        padding: 20px 24px 16px; flex-shrink: 0;
        border-bottom: 1.5px solid #f1f3f5;
    }
    .lvm-header-left { display: flex; align-items: flex-start; gap: 12px; }
    .lvm-header-icon { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg,#eef2ff,#c7d2fe); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .lvm-title { font-size: 1rem; font-weight: 700; color: #0f1923; }
    .lvm-subtitle { font-size: 0.78rem; color: #9ca3af; margin-top: 2px; }
    .lvm-close { width: 32px; height: 32px; border-radius: 8px; border: none; background: #f3f4f6; color: #6b7280; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
    .lvm-close:hover { background: #e5e7eb; color: #111827; }
    /* Meta bar */
    .lvm-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 12px 24px; background: #f9fafb; border-bottom: 1.5px solid #f1f3f5; flex-shrink: 0; }
    .lvm-meta-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    /* iFrame area */
    .lvm-iframe-wrap { flex: 1; overflow: hidden; padding: 16px 24px; min-height: 0; }
    .lvm-iframe-label { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .lvm-iframe { width: 100%; height: 100%; border-radius: 10px; border: 1.5px solid #e5e7eb; background: #fafafa; }
    /* Footer */
    .lvm-footer { padding: 16px 24px 20px; border-top: 1.5px solid #f1f3f5; flex-shrink: 0; background: #fafafa; }
    .lvm-approve-btn {
        width: 100%; padding: 11px; border-radius: 10px; border: none; cursor: pointer;
        background: linear-gradient(135deg, #059669, #10b981); color: white;
        font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        box-shadow: 0 4px 12px rgba(5,150,105,0.3); transition: all 0.15s;
        margin-bottom: 14px;
    }
    .lvm-approve-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(5,150,105,0.4); }
    .lvm-approve-btn:disabled { background: linear-gradient(135deg,#d1d5db,#e5e7eb); box-shadow: none; cursor: not-allowed; color: #9ca3af; }
    .lvm-divider { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
    .lvm-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
    .lvm-divider-text { font-size: 0.72rem; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }
    .lvm-reject-section { display: flex; flex-direction: column; gap: 8px; }
    .lvm-reject-label { font-size: 0.78rem; font-weight: 600; color: #6b7280; display: flex; align-items: center; gap: 6px; }
    .lvm-textarea {
        width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
        font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #374151;
        background: white; outline: none; resize: none; line-height: 1.5;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    .lvm-textarea:focus { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,0.1); }
    .lvm-textarea::placeholder { color: #c1c8d4; }
    .lvm-reject-btn {
        width: 100%; padding: 11px; border-radius: 10px; border: none; cursor: pointer;
        background: linear-gradient(135deg, #f43f5e, #fb7185); color: white;
        font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        box-shadow: 0 4px 12px rgba(244,63,94,0.25); transition: all 0.15s;
    }
    .lvm-reject-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(244,63,94,0.35); }
    .lvm-reject-btn:disabled { background: linear-gradient(135deg,#d1d5db,#e5e7eb); box-shadow: none; cursor: not-allowed; color: #9ca3af; }
    .lvm-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: lvm-spin 0.7s linear infinite; }
    @keyframes lvm-spin { to{transform:rotate(360deg)} }
`;

const DURATION_COLOR = {
    '2 Semester (1 Tahun)': { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
    '4 Semester (2 Tahun)': { bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
};

const AVATAR_COLORS = ['#3b5bdb','#0ea5e9','#7c3aed','#059669','#d97706','#dc2626'];
const getColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (name = '') => name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase();

export default function LeaveVerificationModal({ application, userRole, onClose, onUpdate }) {
    const [alasanDitolak, setAlasanDitolak] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!application) return null;

    const apiEndpoint = userRole === 'kajur' ? '/api/kajur/verifikasi-cuti' : '/api/wadir/verifikasi-cuti';
    const approveLabel = userRole === 'kajur' ? 'Setujui & Teruskan ke Wadir' : 'Setujui Pengajuan Cuti';

    const handleSubmit = async (action) => {
        if (action === 'reject' && !alasanDitolak.trim()) {
            alert('Harap tulis alasan penolakan terlebih dahulu.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, action, alasanDitolak }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal memproses permintaan.');
            }
            onUpdate(application.id);
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const dur = DURATION_COLOR[application.durasi] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };

    return (
        <>
            <style>{css}</style>
            <div className="lvm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="lvm-card">
                    <div className="lvm-top-bar" />

                    {/* Header */}
                    <div className="lvm-header">
                        <div className="lvm-header-left">
                            <div className="lvm-header-icon">
                                <ShieldCheck size={22} color="#3b5bdb" />
                            </div>
                            <div>
                                <div className="lvm-title">Verifikasi Pengajuan Cuti</div>
                                <div className="lvm-subtitle">Tinjau formulir dan berikan keputusan</div>
                            </div>
                        </div>
                        <button className="lvm-close" onClick={onClose}><X size={16} /></button>
                    </div>

                    {/* Meta bar */}
                    <div className="lvm-meta">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: getColor(application.mahasiswa.nama), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {getInitials(application.mahasiswa.nama)}
                            </div>
                            <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem' }}>{application.mahasiswa.nama}</span>
                        </div>
                        <span className="lvm-meta-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                            <BookOpen size={11} />{application.mahasiswa.prodi.nama}
                        </span>
                        <span className="lvm-meta-badge" style={{ background: dur.bg, color: dur.color, border: `1px solid ${dur.border}` }}>
                            <CalendarClock size={11} />{application.durasi}
                        </span>
                    </div>

                    {/* iFrame */}
                    <div className="lvm-iframe-wrap">
                        <div className="lvm-iframe-label">
                            <FileText size={12} /> Formulir Pengajuan Cuti
                        </div>
                        <iframe
                            src={application.form_url}
                            className="lvm-iframe"
                            style={{ height: 'calc(100% - 28px)' }}
                            title="Formulir Cuti"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="lvm-footer">
                        <button className="lvm-approve-btn" onClick={() => handleSubmit('approve')} disabled={isSubmitting}>
                            {isSubmitting
                                ? <><div className="lvm-spinner" /> Memproses...</>
                                : <><CheckCircle size={16} /> {approveLabel}</>}
                        </button>

                        <div className="lvm-divider">
                            <div className="lvm-divider-line" />
                            <span className="lvm-divider-text">Atau tolak pengajuan</span>
                            <div className="lvm-divider-line" />
                        </div>

                        <div className="lvm-reject-section">
                            <label className="lvm-reject-label">
                                <AlertTriangle size={12} color="#f43f5e" /> Alasan Penolakan
                            </label>
                            <textarea
                                className="lvm-textarea"
                                rows={2}
                                placeholder="Tuliskan alasan penolakan secara jelas..."
                                value={alasanDitolak}
                                onChange={e => setAlasanDitolak(e.target.value)}
                            />
                            <button className="lvm-reject-btn" onClick={() => handleSubmit('reject')} disabled={isSubmitting}>
                                {isSubmitting
                                    ? <><div className="lvm-spinner" /> Memproses...</>
                                    : <><XCircle size={16} /> Tolak Pengajuan</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}