// components/sekjur/akademik/AddEditCourseModal.js
import { useState, useEffect, useRef } from 'react';

const style = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    .modal-overlay {
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
        animation: overlayIn 0.2s ease;
    }

    @keyframes overlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .modal-card {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        max-width: 520px;
        box-shadow:
        0 0 0 1px rgba(0,0,0,0.06),
        0 24px 64px rgba(10, 14, 26, 0.22),
        0 4px 12px rgba(10, 14, 26, 0.08);
        animation: cardIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden;
    }

    @keyframes cardIn {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal-header {
        padding: 28px 28px 0 28px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }

    .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #EFF6FF;
        color: #2563EB;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 10px;
    }

    .modal-title {
        font-size: 22px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.5px;
        line-height: 1.2;
    }

    .modal-subtitle {
        font-size: 13.5px;
        color: #64748B;
        margin-top: 4px;
    }

    .close-btn {
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
        margin-top: -2px;
    }

    .close-btn:hover {
        background: #F8FAFC;
        border-color: #CBD5E1;
        color: #475569;
    }

    .modal-divider {
        height: 1px;
        background: #F1F5F9;
        margin: 20px 0 0 0;
    }

    .modal-body {
        padding: 20px 28px 0 28px;
        max-height: 58vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: #E2E8F0 transparent;
    }

    .modal-body::-webkit-scrollbar { width: 4px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
    }

    .form-group {
        margin-bottom: 16px;
    }

    .form-label {
        display: block;
        font-size: 12.5px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 6px;
        letter-spacing: 0.01em;
    }

    .form-label .required {
        color: #EF4444;
        margin-left: 2px;
    }

    .input-wrapper {
        position: relative;
    }

    .input-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        pointer-events: none;
        display: flex;
        align-items: center;
    }

    .form-input {
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

    .form-input.no-icon {
        padding-left: 12px;
    }

    .form-input:focus {
        border-color: #3B82F6;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-input::placeholder {
        color: #C0CCDA;
    }

    .sks-input {
        font-family: 'DM Mono', monospace;
        font-size: 15px;
        font-weight: 500;
        text-align: center;
    }

    .dosen-section-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }

    .dosen-count-badge {
        background: #DBEAFE;
        color: #1D4ED8;
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 20px;
    }

    .dosen-list-box {
        border: 1.5px solid #E2E8F0;
        border-radius: 12px;
        background: #FAFAFA;
        overflow: hidden;
        margin-top: 8px;
    }

    .dosen-search-wrapper {
        padding: 10px 10px 8px;
        border-bottom: 1px solid #F1F5F9;
        position: relative;
    }

    .dosen-search-input {
        width: 100%;
        padding: 8px 10px 8px 34px;
        border: 1.5px solid #E2E8F0;
        border-radius: 8px;
        font-size: 13px;
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #0F172A;
        background: white;
        box-sizing: border-box;
        outline: none;
        transition: all 0.15s;
    }

    .dosen-search-input:focus {
        border-color: #3B82F6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .dosen-search-icon {
        position: absolute;
        left: 21px;
        top: 50%;
        transform: translateY(-50%);
        color: #94A3B8;
        pointer-events: none;
    }

    .dosen-list-scroll {
        max-height: 152px;
        overflow-y: auto;
        padding: 6px;
        scrollbar-width: thin;
        scrollbar-color: #E2E8F0 transparent;
    }

    .dosen-list-scroll::-webkit-scrollbar { width: 4px; }
    .dosen-list-scroll::-webkit-scrollbar-track { background: transparent; }
    .dosen-list-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

    .dosen-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.12s;
        user-select: none;
    }

    .dosen-item:hover { background: #EFF6FF; }
    .dosen-item.checked { background: #EFF6FF; }

    .custom-checkbox {
        width: 17px;
        height: 17px;
        border-radius: 5px;
        border: 2px solid #CBD5E1;
        background: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: all 0.15s;
    }

    .dosen-item.checked .custom-checkbox {
        background: #2563EB;
        border-color: #2563EB;
    }

    .dosen-item-avatar {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: linear-gradient(135deg, #DBEAFE, #C7D2FE);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: #3730A3;
        flex-shrink: 0;
        letter-spacing: -0.5px;
    }

    .dosen-item-name {
        font-size: 13.5px;
        font-weight: 500;
        color: #1E293B;
        flex: 1;
    }

    .dosen-empty {
        text-align: center;
        padding: 20px;
        color: #94A3B8;
        font-size: 13px;
    }

    .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 10px;
        min-height: 0;
    }

    .selected-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #EFF6FF;
        border: 1px solid #BFDBFE;
        color: #1D4ED8;
        font-size: 12px;
        font-weight: 500;
        padding: 3px 8px 3px 10px;
        border-radius: 20px;
    }

    .tag-remove {
        cursor: pointer;
        color: #93C5FD;
        display: flex;
        align-items: center;
        margin-left: 2px;
        transition: color 0.12s;
    }

    .tag-remove:hover { color: #2563EB; }

    .modal-footer {
        padding: 20px 28px 24px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        border-top: 1px solid #F1F5F9;
        margin-top: 20px;
    }

    .btn {
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

    .btn-cancel {
        background: #F1F5F9;
        color: #475569;
    }

    .btn-cancel:hover {
        background: #E2E8F0;
        color: #334155;
    }

    .btn-save {
        background: linear-gradient(135deg, #2563EB, #1D4ED8);
        color: white;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35), 0 1px 2px rgba(37, 99, 235, 0.2);
    }

    .btn-save:hover {
        background: linear-gradient(135deg, #1D4ED8, #1E40AF);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.45);
        transform: translateY(-1px);
    }

    .btn-save:active { transform: translateY(0); }
    `;

    function getInitials(name) {
    return name
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase();
    }

    export default function AddEditCourseModal({ isOpen, onClose, onSave, initialData, dosenList }) {
    const [kode, setKode] = useState('');
    const [nama, setNama] = useState('');
    const [sks, setSks] = useState('');
    const [pengampuIds, setPengampuIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
        setKode(initialData?.kode || '');
        setNama(initialData?.nama || '');
        setSks(initialData?.sks || '');
        setPengampuIds(initialData?.pengampu?.map(p => p.dosen_id) || []);
        setSearchTerm('');
        }
    }, [isOpen, initialData]);

    const handleDosenToggle = (dosenId) => {
        setPengampuIds(prev =>
        prev.includes(dosenId) ? prev.filter(id => id !== dosenId) : [...prev, dosenId]
        );
    };

    const handleSave = () => {
        if (!kode.trim() || !nama.trim() || !sks) {
        alert('Kode MK, Nama, dan SKS wajib diisi.');
        return;
        }
        onSave({ id: initialData?.id, kode, nama, sks: parseInt(sks), pengampuIds });
    };

    if (!isOpen) return null;

    const filteredDosen = dosenList.filter(dosen =>
        dosen.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedDosen = dosenList.filter(d => pengampuIds.includes(d.id));

    return (
        <>
        <style>{style}</style>
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-card">

            {/* Header */}
            <div className="modal-header">
                <div>
                <div className="header-badge">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="4" fill="#2563EB" />
                    </svg>
                    {isEdit ? 'Mode Edit' : 'Data Baru'}
                </div>
                <h2 className="modal-title">{isEdit ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</h2>
                <p className="modal-subtitle">{isEdit ? 'Perbarui informasi mata kuliah' : 'Isi form untuk menambahkan mata kuliah baru'}</p>
                </div>
                <button className="close-btn" onClick={onClose} aria-label="Tutup">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                </svg>
                </button>
            </div>

            <div className="modal-divider" />

            {/* Body */}
            <div className="modal-body">

                {/* Kode + SKS row */}
                <div className="form-row">
                <div className="form-group">
                    <label className="form-label">Kode MK <span className="required">*</span></label>
                    <div className="input-wrapper">
                    <span className="input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={kode}
                        onChange={e => setKode(e.target.value)}
                        placeholder="mis. CS101"
                        className="form-input"
                        style={{ fontFamily: "'DM Mono', monospace", letterSpacing: '0.03em' }}
                    />
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">SKS <span className="required">*</span></label>
                    <div className="input-wrapper">
                    <span className="input-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                        </svg>
                    </span>
                    <input
                        type="number"
                        value={sks}
                        onChange={e => setSks(e.target.value)}
                        placeholder="0"
                        min="1"
                        max="6"
                        className="form-input sks-input"
                    />
                    </div>
                </div>
                </div>

                {/* Nama */}
                <div className="form-group">
                <label className="form-label">Nama Mata Kuliah <span className="required">*</span></label>
                <div className="input-wrapper">
                    <span className="input-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    </span>
                    <input
                    type="text"
                    value={nama}
                    onChange={e => setNama(e.target.value)}
                    placeholder="Nama lengkap mata kuliah"
                    className="form-input"
                    />
                </div>
                </div>

                {/* Dosen Pengampu */}
                <div className="form-group">
                <div className="dosen-section-label">
                    <label className="form-label" style={{ margin: 0 }}>Dosen Pengampu</label>
                    {pengampuIds.length > 0 && (
                    <span className="dosen-count-badge">{pengampuIds.length} dipilih</span>
                    )}
                </div>

                <div className="dosen-list-box">
                    <div className="dosen-search-wrapper">
                    <svg className="dosen-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Cari nama dosen..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="dosen-search-input"
                        style={{ paddingLeft: '34px' }}
                    />
                    </div>
                    <div className="dosen-list-scroll">
                    {filteredDosen.length === 0 ? (
                        <div className="dosen-empty">Dosen tidak ditemukan</div>
                    ) : (
                        filteredDosen.map(dosen => {
                        const isChecked = pengampuIds.includes(dosen.id);
                        return (
                            <div
                            key={dosen.id}
                            className={`dosen-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => handleDosenToggle(dosen.id)}
                            >
                            <div className="custom-checkbox">
                                {isChecked && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 5l2.5 2.5L8 2.5" />
                                </svg>
                                )}
                            </div>
                            <div className="dosen-item-avatar">{getInitials(dosen.nama)}</div>
                            <span className="dosen-item-name">{dosen.nama}</span>
                            </div>
                        );
                        })
                    )}
                    </div>
                </div>

                {/* Selected tags */}
                {selectedDosen.length > 0 && (
                    <div className="selected-tags">
                    {selectedDosen.map(d => (
                        <span key={d.id} className="selected-tag">
                        {d.nama}
                        <span className="tag-remove" onClick={() => handleDosenToggle(d.id)}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M2 2l6 6M8 2L2 8" />
                            </svg>
                        </span>
                        </span>
                    ))}
                    </div>
                )}
                </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
                <button className="btn btn-cancel" onClick={onClose}>
                Batal
                </button>
                <button className="btn btn-save" onClick={handleSave}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                </svg>
                {isEdit ? 'Simpan Perubahan' : 'Tambah Mata Kuliah'}
                </button>
            </div>
            </div>
        </div>
        </>
    );
}