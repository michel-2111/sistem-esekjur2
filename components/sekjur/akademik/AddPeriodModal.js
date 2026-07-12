// components/sekjur/akademik/AddPeriodModal.js
import { useState, useEffect, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Save, Calendar } from 'lucide-react';

const style = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    .pm-overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 14, 26, 0.75);
        backdrop-filter: blur(6px);
        z-index: 50;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem;
        font-family: 'Plus Jakarta Sans', sans-serif;
        animation: pm-overlayIn 0.2s ease;
    }

    @keyframes pm-overlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .pm-card {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        max-width: 460px;
        box-shadow:
        0 0 0 1px rgba(0,0,0,0.06),
        0 24px 64px rgba(10, 14, 26, 0.22),
        0 4px 12px rgba(10, 14, 26, 0.08);
        animation: pm-cardIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }

    @keyframes pm-cardIn {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .pm-header {
        padding: 28px 28px 0 28px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }

    .pm-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #F0FDF4;
        color: #16A34A;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 10px;
    }

    .pm-title {
        font-size: 22px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.5px;
        line-height: 1.2;
    }

    .pm-subtitle {
        font-size: 13.5px;
        color: #64748B;
        margin-top: 4px;
    }

    .pm-close {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1.5px solid #E2E8F0;
        background: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #94A3B8;
        transition: all 0.15s;
        flex-shrink: 0;
    }

    .pm-close:hover {
        background: #F8FAFC;
        border-color: #CBD5E1;
        color: #475569;
    }

    .pm-divider {
        height: 1px;
        background: #F1F5F9;
        margin: 20px 0 0 0;
    }

    .pm-body {
        padding: 20px 28px 0 28px;
    }

    .pm-form-group {
        margin-bottom: 16px;
    }

    .pm-label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
        letter-spacing: 0.01em;
    }

    .pm-label .req { color: #EF4444; margin-left: 2px; }

    .pm-input-wrap {
        position: relative;
    }

    .pm-input-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        pointer-events: none;
        display: flex;
    }

    .pm-input {
        width: 100%;
        padding: 10px 12px 10px 36px;
        border: 1.5px solid #E2E8F0;
        border-radius: 10px;
        font-size: 14px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #0F172A;
        background: #FAFAFA;
        transition: all 0.15s;
        box-sizing: border-box;
        outline: none;
    }

    .pm-input:focus {
        border-color: #22C55E;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
    }

    .pm-input::placeholder { color: #C0CCDA; }

    .pm-mono {
        font-family: 'DM Mono', monospace;
        letter-spacing: 0.04em;
        text-transform: uppercase;
    }

    .pm-date-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }

    /* DatePicker custom button */
    .pm-date-btn {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px 10px 36px;
        border: 1.5px solid #E2E8F0;
        border-radius: 10px;
        font-size: 13.5px;
        font-family: 'DM Mono', monospace;
        color: #1E293B;
        background: #FAFAFA;
        cursor: pointer;
        transition: all 0.15s;
        text-align: left;
        box-sizing: border-box;
    }

    .pm-date-btn:hover, .pm-date-btn:focus {
        border-color: #22C55E;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        outline: none;
    }

    .pm-date-btn-wrap {
        position: relative;
        width: 100%;
    }

    .pm-date-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        pointer-events: none;
    }

    .pm-date-caret {
        color: #94A3B8;
        flex-shrink: 0;
    }

    .pm-range-indicator {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #F0FDF4;
        border: 1px solid #BBF7D0;
        border-radius: 10px;
        padding: 10px 14px;
        margin-bottom: 16px;
    }

    .pm-range-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #22C55E;
        flex-shrink: 0;
    }

    .pm-range-text {
        font-size: 12.5px;
        color: #15803D;
        font-weight: 500;
    }

    .pm-range-dates {
        font-family: 'DM Mono', monospace;
        font-size: 12px;
        color: #16A34A;
        font-weight: 600;
        margin-left: auto;
    }

    .pm-footer {
        padding: 20px 28px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid #F1F5F9;
        margin-top: 20px;
    }

    .pm-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'Plus Jakarta Sans', sans-serif;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
        letter-spacing: -0.01em;
    }

    .pm-btn-cancel {
        background: #F1F5F9;
        color: #475569;
    }

    .pm-btn-cancel:hover { background: #E2E8F0; color: #334155; }

    .pm-btn-save {
        background: linear-gradient(135deg, #16A34A, #15803D);
        color: white;
        box-shadow: 0 2px 8px rgba(22, 163, 74, 0.35), 0 1px 2px rgba(22, 163, 74, 0.2);
    }

    .pm-btn-save:hover {
        background: linear-gradient(135deg, #15803D, #166534);
        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.45);
        transform: translateY(-1px);
    }

    .pm-btn-save:active { transform: translateY(0); }
    `;

    function formatDate(date) {
    if (!date) return '—';
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    const CustomDateInput = forwardRef(({ value, onClick, label }, ref) => (
    <div className="pm-date-btn-wrap">
        <span className="pm-date-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        </span>
        <button type="button" className="pm-date-btn" onClick={onClick} ref={ref}>
        <span>{value || 'Pilih tanggal'}</span>
        <svg className="pm-date-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
        </button>
    </div>
    ));
    CustomDateInput.displayName = 'CustomDateInput';

    export default function AddPeriodModal({ isOpen, onClose, onSave }) {
    const [id, setId] = useState('');
    const [nama, setNama] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
        setId('');
        setNama('');
        setStartDate(new Date());
        setEndDate(new Date());
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!id.trim() || !nama.trim()) {
        alert('ID dan Nama Periode wajib diisi.');
        return;
        }
        onSave({ id, nama, start_date: startDate, end_date: endDate });
    };

    if (!isOpen) return null;

    return (
        <>
        <style>{style}</style>
        <div className="pm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="pm-card">

            {/* Header */}
            <div className="pm-header">
                <div>
                <div className="pm-badge">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="4" fill="#16A34A"/>
                    </svg>
                    Periode Baru
                </div>
                <h2 className="pm-title">Tambah Periode Akademik</h2>
                <p className="pm-subtitle">Tentukan rentang waktu periode baru</p>
                </div>
                <button className="pm-close" onClick={onClose} aria-label="Tutup">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
                </button>
            </div>

            <div className="pm-divider"/>

            {/* Body */}
            <div className="pm-body">

                {/* ID Periode */}
                <div className="pm-form-group">
                <label className="pm-label">ID Periode <span className="req">*</span></label>
                <div className="pm-input-wrap">
                    <span className="pm-input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
                    </svg>
                    </span>
                    <input
                    type="text"
                    value={id}
                    onChange={e => setId(e.target.value.toUpperCase())}
                    placeholder="Contoh: GENAP2025"
                    className="pm-input pm-mono"
                    />
                </div>
                </div>

                {/* Nama Periode */}
                <div className="pm-form-group">
                <label className="pm-label">Nama Periode <span className="req">*</span></label>
                <div className="pm-input-wrap">
                    <span className="pm-input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    </span>
                    <input
                    type="text"
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    placeholder="Contoh: Semester Genap 2024/2025"
                    className="pm-input"
                    />
                </div>
                </div>

                {/* Date row */}
                <div className="pm-date-row pm-form-group">
                <div>
                    <label className="pm-label">Tanggal Mulai</label>
                    <DatePicker
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    dateFormat="dd/MM/yyyy"
                    customInput={<CustomDateInput/>}
                    wrapperClassName="w-full"
                    />
                </div>
                <div>
                    <label className="pm-label">Tanggal Selesai</label>
                    <DatePicker
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    dateFormat="dd/MM/yyyy"
                    minDate={startDate}
                    customInput={<CustomDateInput/>}
                    wrapperClassName="w-full"
                    />
                </div>
                </div>

                {/* Range indicator */}
                <div className="pm-range-indicator">
                <div className="pm-range-dot"/>
                <span className="pm-range-text">Durasi periode</span>
                <span className="pm-range-dates">
                    {formatDate(startDate)} → {formatDate(endDate)}
                </span>
                </div>
            </div>

            {/* Footer */}
            <div className="pm-footer">
                <button className="pm-btn pm-btn-cancel" onClick={onClose}>Batal</button>
                <button className="pm-btn pm-btn-save" onClick={handleSave}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                Simpan Periode
                </button>
            </div>
            </div>
        </div>
        </>
    );
}