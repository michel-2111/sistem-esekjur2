// components/dosen/ScheduleModal.js
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { X, Clock, MapPin, Link2, Calendar, AlertCircle } from 'lucide-react';

const formatDate = (start, end) => {
    if (!start || !end) return '';
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const datePart = start.toLocaleDateString('id-ID', options);
    const timeFormat = { hour: '2-digit', minute: '2-digit', hour12: false };
    const startTime = start.toLocaleTimeString('id-ID', timeFormat);
    const endTime = end.toLocaleTimeString('id-ID', timeFormat);
    return `${datePart}, ${startTime} - ${endTime}`;
};

function FieldLabel({ icon: Icon, children }) {
    return (
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#64748b' }}>
            <Icon size={12} style={{ color: '#94a3b8' }} />
            {children}
        </label>
    );
}

const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
};

export default function ScheduleModal({ kelas, onClose, onSaveSuccess }) {
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [ruang, setRuang] = useState('');
    const [materiUrl, setMateriUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (kelas) {
            setRuang(kelas.ruang || '');
            setMateriUrl(kelas.materi_url || '');
        }
    }, [kelas]);

    if (!kelas) return null;

    const handleSubmit = async () => {
        setError('');
        if (!startTime || !endTime) {
            setError('Harap tentukan waktu mulai dan waktu selesai.');
            return;
        }
        if (endTime <= startTime) {
            setError('Waktu selesai harus lebih dari waktu mulai.');
            return;
        }
        setIsSubmitting(true);
        const formattedJadwal = formatDate(startTime, endTime);
        try {
            const res = await fetch('/api/dosen/kelas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: kelas.course_id,
                    jadwal: formattedJadwal,
                    ruang,
                    materi_url: materiUrl,
                }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan perubahan.');
            onSaveSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const pickerInputStyle = {
        ...inputStyle,
        cursor: 'pointer',
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="w-full max-w-lg rounded-2xl overflow-hidden"
                style={{
                    background: '#fff',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
                    animation: 'modalIn 0.2s ease',
                }}
            >
                <style>{`
                    @keyframes modalIn {
                        from { opacity: 0; transform: translateY(12px) scale(0.98); }
                        to   { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    .schedule-datepicker input {
                        width: 100%;
                        padding: 9px 12px;
                        border-radius: 10px;
                        border: 1px solid #e2e8f0;
                        background: #f8fafc;
                        font-size: 13px;
                        color: #0f172a;
                        outline: none;
                        cursor: pointer;
                    }
                    .schedule-datepicker input:focus {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
                    }
                    .schedule-input:focus {
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important;
                        background: #fff !important;
                    }
                `}</style>

                {/* Header */}
                <div
                    className="px-6 py-5 flex items-start justify-between"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div
                                className="p-1.5 rounded-lg"
                                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                            >
                                <Calendar size={14} style={{ color: '#fff' }} />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                                Pengaturan Kelas
                            </span>
                        </div>
                        <h2
                            className="text-base font-bold leading-tight"
                            style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif", maxWidth: '340px' }}
                            title={kelas.nama}
                        >
                            {kelas.nama}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-all duration-150 mt-0.5"
                        style={{ color: '#94a3b8', background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Jadwal */}
                    <div>
                        <FieldLabel icon={Clock}>Jadwal Perkuliahan</FieldLabel>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>Waktu Mulai</p>
                                <div className="schedule-datepicker">
                                    <DatePicker
                                        selected={startTime}
                                        onChange={setStartTime}
                                        showTimeSelect
                                        dateFormat="dd MMM yyyy, HH:mm"
                                        placeholderText="Pilih tanggal & waktu"
                                        locale="id"
                                    />
                                </div>
                            </div>
                            <div>
                                <p className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>Waktu Selesai</p>
                                <div className="schedule-datepicker">
                                    <DatePicker
                                        selected={endTime}
                                        onChange={setEndTime}
                                        showTimeSelect
                                        dateFormat="dd MMM yyyy, HH:mm"
                                        placeholderText="Pilih tanggal & waktu"
                                        minDate={startTime}
                                    />
                                </div>
                            </div>
                        </div>
                        {startTime && endTime && endTime > startTime && (
                            <div
                                className="mt-2.5 px-3 py-2 rounded-lg flex items-center gap-2"
                                style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
                            >
                                <Clock size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
                                <span className="text-xs font-medium" style={{ color: '#1d4ed8' }}>
                                    {formatDate(startTime, endTime)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Ruang */}
                    <div>
                        <FieldLabel icon={MapPin}>Ruang Kelas</FieldLabel>
                        <input
                            type="text"
                            value={ruang}
                            onChange={e => setRuang(e.target.value)}
                            placeholder="Contoh: Lab RPL, Gedung A-301"
                            className="schedule-input"
                            style={inputStyle}
                            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                        />
                    </div>

                    {/* Materi URL */}
                    <div>
                        <FieldLabel icon={Link2}>URL Materi</FieldLabel>
                        <div className="relative">
                            <input
                                type="url"
                                value={materiUrl}
                                onChange={e => setMateriUrl(e.target.value)}
                                placeholder="https://drive.google.com/..."
                                className="schedule-input"
                                style={{ ...inputStyle, paddingLeft: '36px' }}
                                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                            />
                            <Link2
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                style={{ color: '#94a3b8' }}
                            />
                        </div>
                        <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>
                            Google Drive, OneDrive, atau tautan materi lainnya
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                        >
                            <AlertCircle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                            <span className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="px-6 py-4 flex items-center justify-end gap-3"
                    style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}
                >
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                        style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: isSubmitting ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: isSubmitting ? 'none' : '0 2px 8px rgba(59,130,246,0.35)' }}
                        onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                Menyimpan...
                            </span>
                        ) : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}