// components/sekjur/akademik/AddEditProdiModal.js
import { useState, useEffect, useRef } from 'react';

const style = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    .prodi-overlay {
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
        animation: prodi-in 0.2s ease;
    }

    @keyframes prodi-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .prodi-card {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        max-width: 400px;
        box-shadow:
        0 0 0 1px rgba(0,0,0,0.06),
        0 24px 64px rgba(10, 14, 26, 0.22),
        0 4px 12px rgba(10, 14, 26, 0.08);
        animation: prodi-cardIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }

    @keyframes prodi-cardIn {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Decorative top accent */
    .prodi-accent {
        height: 4px;
        background: linear-gradient(90deg, #7C3AED, #A855F7, #C084FC);
    }

    .prodi-header {
        padding: 24px 24px 0 24px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }

    .prodi-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #F5F3FF;
        color: #7C3AED;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 10px;
    }

    .prodi-title {
        font-size: 21px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.5px;
        line-height: 1.2;
    }

    .prodi-subtitle {
        font-size: 13px;
        color: #64748B;
        margin-top: 4px;
    }

    .prodi-close {
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

    .prodi-close:hover {
        background: #F8FAFC;
        border-color: #CBD5E1;
        color: #475569;
    }

    .prodi-divider {
        height: 1px;
        background: #F1F5F9;
        margin: 20px 0 0 0;
    }

    .prodi-body {
        padding: 20px 24px 0 24px;
    }

    .prodi-label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
        letter-spacing: 0.01em;
    }

    .prodi-label .req { color: #EF4444; margin-left: 2px; }

    .prodi-input-wrap {
        position: relative;
    }

    .prodi-input-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        pointer-events: none;
        display: flex;
    }

    .prodi-input {
        width: 100%;
        padding: 11px 12px 11px 36px;
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

    .prodi-input:focus {
        border-color: #7C3AED;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }

    .prodi-input::placeholder { color: #C0CCDA; }

    /* Character counter */
    .prodi-char-count {
        text-align: right;
        font-size: 11.5px;
        color: #94A3B8;
        margin-top: 5px;
    }

    /* Hint box for edit mode */
    .prodi-hint {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: #FEF3C7;
        border: 1px solid #FDE68A;
        border-radius: 10px;
        padding: 10px 12px;
        margin-top: 14px;
    }

    .prodi-hint-icon { color: #D97706; flex-shrink: 0; margin-top: 1px; }
    .prodi-hint-text { font-size: 12.5px; color: #92400E; line-height: 1.5; }

    .prodi-footer {
        padding: 20px 24px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid #F1F5F9;
        margin-top: 20px;
    }

    .prodi-btn {
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

    .prodi-btn-cancel {
        background: #F1F5F9;
        color: #475569;
    }

    .prodi-btn-cancel:hover { background: #E2E8F0; color: #334155; }

    .prodi-btn-save {
        background: linear-gradient(135deg, #7C3AED, #6D28D9);
        color: white;
        box-shadow: 0 2px 8px rgba(124, 58, 237, 0.35), 0 1px 2px rgba(124, 58, 237, 0.2);
    }

    .prodi-btn-save:hover {
        background: linear-gradient(135deg, #6D28D9, #5B21B6);
        box-shadow: 0 4px 12px rgba(124, 58, 237, 0.45);
        transform: translateY(-1px);
    }

    .prodi-btn-save:active { transform: translateY(0); }

    .prodi-btn-save:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }
    `;

    export default function AddEditProdiModal({ isOpen, onClose, onSave, initialData }) {
    const [nama, setNama] = useState('');
    const isEdit = !!initialData;
    const inputRef = useRef(null);
    const MAX = 100;

    useEffect(() => {
        if (isOpen) {
        setNama(initialData?.nama || '');
        setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!nama.trim()) {
        alert('Nama Program Studi tidak boleh kosong.');
        return;
        }
        onSave({ ...initialData, nama });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return (
        <>
        <style>{style}</style>
        <div className="prodi-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="prodi-card">

            {/* Top accent stripe */}
            <div className="prodi-accent"/>

            {/* Header */}
            <div className="prodi-header">
                <div>
                <div className="prodi-badge">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="4" fill="#7C3AED"/>
                    </svg>
                    {isEdit ? 'Mode Edit' : 'Data Baru'}
                </div>
                <h2 className="prodi-title">{isEdit ? 'Edit' : 'Tambah'} Program Studi</h2>
                <p className="prodi-subtitle">
                    {isEdit ? 'Perbarui nama program studi' : 'Daftarkan program studi baru'}
                </p>
                </div>
                <button className="prodi-close" onClick={onClose} aria-label="Tutup">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13"/>
                </svg>
                </button>
            </div>

            <div className="prodi-divider"/>

            {/* Body */}
            <div className="prodi-body">
                <label className="prodi-label">
                Nama Program Studi <span className="req">*</span>
                </label>
                <div className="prodi-input-wrap">
                <span className="prodi-input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={nama}
                    onChange={e => setNama(e.target.value.slice(0, MAX))}
                    onKeyDown={handleKeyDown}
                    placeholder="Contoh: Teknik Informatika"
                    className="prodi-input"
                />
                </div>
                <div className="prodi-char-count">{nama.length}/{MAX}</div>

                {isEdit && (
                <div className="prodi-hint">
                    <svg className="prodi-hint-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span className="prodi-hint-text">
                    Perubahan nama akan mempengaruhi tampilan di seluruh sistem. Pastikan nama sudah benar sebelum menyimpan.
                    </span>
                </div>
                )}
            </div>

            {/* Footer */}
            <div className="prodi-footer">
                <button className="prodi-btn prodi-btn-cancel" onClick={onClose}>Batal</button>
                <button
                className="prodi-btn prodi-btn-save"
                onClick={handleSave}
                disabled={!nama.trim()}
                >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                </svg>
                {isEdit ? 'Simpan Perubahan' : 'Tambah Prodi'}
                </button>
            </div>
            </div>
        </div>
        </>
    );
}