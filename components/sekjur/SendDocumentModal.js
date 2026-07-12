// components/sekjur/SendDocumentModal.js
import { useState, useEffect, useRef } from 'react';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .sdm-overlay {
    position: fixed; inset: 0;
    background: rgba(10, 14, 26, 0.75);
    backdrop-filter: blur(6px);
    z-index: 50;
    display: flex; justify-content: center; align-items: center;
    padding: 1rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    animation: sdm-fadeIn 0.2s ease;
  }

  @keyframes sdm-fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .sdm-card {
    background: #fff;
    border-radius: 20px;
    width: 100%; max-width: 540px;
    box-shadow:
      0 0 0 1px rgba(0,0,0,0.06),
      0 24px 64px rgba(10,14,26,0.22),
      0 4px 12px rgba(10,14,26,0.08);
    animation: sdm-slideIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    display: flex; flex-direction: column;
    max-height: 92vh;
  }

  @keyframes sdm-slideIn {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Header */
  .sdm-header {
    padding: 24px 24px 0;
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-shrink: 0;
  }

  .sdm-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #EFF6FF; color: #1D4ED8;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 4px 10px; border-radius: 20px; margin-bottom: 8px;
  }

  .sdm-title { font-size: 21px; font-weight: 700; color: #0F172A; letter-spacing: -0.4px; }
  .sdm-subtitle { font-size: 13px; color: #64748B; margin-top: 4px; }

  .sdm-close {
    width: 34px; height: 34px; border-radius: 10px;
    border: 1.5px solid #E2E8F0; background: white;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    color: #94A3B8; transition: all 0.15s; flex-shrink: 0;
  }

  .sdm-close:hover { background: #F8FAFC; border-color: #CBD5E1; color: #475569; }

  .sdm-divider { height: 1px; background: #F1F5F9; margin: 18px 0 0; flex-shrink: 0; }

  /* Body */
  .sdm-body {
    padding: 18px 24px 0;
    overflow-y: auto; flex: 1;
    scrollbar-width: thin; scrollbar-color: #E2E8F0 transparent;
  }

  .sdm-body::-webkit-scrollbar { width: 4px; }
  .sdm-body::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

  .sdm-group { margin-bottom: 16px; }

  .sdm-label {
    display: block; font-size: 12.5px; font-weight: 600;
    color: #374151; margin-bottom: 6px; letter-spacing: 0.01em;
  }

  .sdm-label .sdm-req { color: #EF4444; margin-left: 2px; }

  /* Input */
  .sdm-input-wrap { position: relative; }

  .sdm-input-icon {
    position: absolute; left: 11px; top: 50%;
    transform: translateY(-50%);
    color: #94A3B8; pointer-events: none; display: flex;
  }

  .sdm-input {
    width: 100%; padding: 10px 12px 10px 36px;
    border: 1.5px solid #E2E8F0; border-radius: 10px;
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0F172A; background: #FAFAFA;
    transition: all 0.15s; box-sizing: border-box; outline: none;
  }

  .sdm-input:focus {
    border-color: #3B82F6; background: #fff;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .sdm-input::placeholder { color: #C0CCDA; }

  /* File Upload */
  .sdm-file-zone {
    border: 2px dashed #E2E8F0;
    border-radius: 12px; padding: 18px;
    background: #FAFAFA;
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; cursor: pointer; transition: all 0.15s;
    text-align: center;
  }

  .sdm-file-zone:hover, .sdm-file-zone.has-file {
    border-color: #93C5FD; background: #EFF6FF;
  }

  .sdm-file-zone input[type="file"] {
    position: absolute; inset: 0; opacity: 0; cursor: pointer;
  }

  .sdm-file-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: #EFF6FF; display: flex; align-items: center; justify-content: center;
    color: #3B82F6;
  }

  .sdm-file-zone.has-file .sdm-file-icon { background: #DCFCE7; color: #16A34A; }

  .sdm-file-label-main { font-size: 13px; font-weight: 600; color: #374151; }
  .sdm-file-label-sub { font-size: 11.5px; color: #94A3B8; }
  .sdm-file-name { font-size: 12.5px; font-weight: 600; color: #16A34A; font-family: 'DM Mono', monospace; }

  /* Role bulk-select chips */
  .sdm-role-chips {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 10px;
  }

  .sdm-role-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 20px;
    border: 1.5px solid #E2E8F0;
    background: #F8FAFC; color: #475569;
    font-size: 12px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.12s;
    user-select: none;
  }

  .sdm-role-chip input[type="checkbox"] { display: none; }

  .sdm-role-chip:hover { border-color: #93C5FD; color: #1D4ED8; background: #EFF6FF; }

  .sdm-role-chip.selected {
    background: #EFF6FF; border-color: #3B82F6; color: #1D4ED8;
  }

  .sdm-role-chip-dot {
    width: 7px; height: 7px; border-radius: 50%;
    border: 1.5px solid currentColor; transition: background 0.12s;
  }

  .sdm-role-chip.selected .sdm-role-chip-dot { background: currentColor; }

  /* Recipient list */
  .sdm-recipient-box {
    border: 1.5px solid #E2E8F0; border-radius: 12px;
    background: #FAFAFA; overflow: hidden;
  }

  .sdm-recipient-search {
    padding: 8px 10px; border-bottom: 1px solid #F1F5F9; position: relative;
  }

  .sdm-recipient-search-icon {
    position: absolute; left: 21px; top: 50%; transform: translateY(-50%);
    color: #94A3B8; pointer-events: none;
  }

  .sdm-recipient-search input {
    width: 100%; padding: 7px 10px 7px 32px;
    border: 1.5px solid #E2E8F0; border-radius: 8px;
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0F172A; background: white;
    box-sizing: border-box; outline: none; transition: all 0.15s;
  }

  .sdm-recipient-search input:focus {
    border-color: #3B82F6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .sdm-recipient-scroll {
    max-height: 168px; overflow-y: auto; padding: 6px;
    scrollbar-width: thin; scrollbar-color: #E2E8F0 transparent;
  }

  .sdm-recipient-scroll::-webkit-scrollbar { width: 4px; }
  .sdm-recipient-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

  .sdm-recipient-item {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 10px; border-radius: 8px;
    cursor: pointer; transition: background 0.1s; user-select: none;
  }

  .sdm-recipient-item:hover { background: #EFF6FF; }
  .sdm-recipient-item.checked { background: #EFF6FF; }

  .sdm-custom-checkbox {
    width: 16px; height: 16px; border-radius: 5px;
    border: 2px solid #CBD5E1; background: white;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.12s;
  }

  .sdm-recipient-item.checked .sdm-custom-checkbox {
    background: #2563EB; border-color: #2563EB;
  }

  .sdm-recipient-avatar {
    width: 26px; height: 26px; border-radius: 7px;
    background: linear-gradient(135deg, #DBEAFE, #C7D2FE);
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700; color: #3730A3;
    flex-shrink: 0; letter-spacing: -0.5px;
  }

  .sdm-recipient-name { font-size: 13px; font-weight: 500; color: #1E293B; flex: 1; }

  .sdm-recipient-role {
    font-size: 10.5px; color: #94A3B8;
    background: #F1F5F9; border-radius: 4px;
    padding: 1px 6px; font-weight: 500;
  }

  /* Selected count badge */
  .sdm-selected-count {
    display: inline-flex; align-items: center; gap: 4px;
    background: #DBEAFE; color: #1D4ED8;
    font-size: 11px; font-weight: 700;
    padding: 2px 8px; border-radius: 20px;
    margin-left: 8px;
  }

  /* Footer */
  .sdm-footer {
    padding: 16px 24px 22px;
    display: flex; justify-content: flex-end; gap: 10px;
    border-top: 1px solid #F1F5F9;
    flex-shrink: 0;
  }

  .sdm-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 10px;
    font-size: 14px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; border: none; transition: all 0.15s;
    letter-spacing: -0.01em;
  }

  .sdm-btn-cancel { background: #F1F5F9; color: #475569; }
  .sdm-btn-cancel:hover { background: #E2E8F0; color: #334155; }

  .sdm-btn-send {
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    color: white;
    box-shadow: 0 2px 8px rgba(37,99,235,0.35);
  }

  .sdm-btn-send:hover:not(:disabled) {
    background: linear-gradient(135deg, #1D4ED8, #1E40AF);
    box-shadow: 0 4px 12px rgba(37,99,235,0.45);
    transform: translateY(-1px);
  }

  .sdm-btn-send:active { transform: translateY(0); }

  .sdm-btn-send:disabled {
    opacity: 0.55; cursor: not-allowed; transform: none;
  }

  /* Spinner */
  .sdm-spinner {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    animation: sdm-spin 0.7s linear infinite;
  }

  @keyframes sdm-spin { to { transform: rotate(360deg); } }

  .sdm-empty-recip {
    padding: 16px; text-align: center;
    font-size: 12.5px; color: #94A3B8;
  }
`;

function getInitials(name) {
    return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

const ROLE_LABELS = {
    dosen: 'Dosen',
    kaprodi: 'Kaprodi',
    wadir: 'Wadir',
    p4m: 'P4M',
};

export default function SendDocumentModal({ isOpen, onClose, onSave, recipientList }) {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [recipientIds, setRecipientIds] = useState([]);
    const [isTemplate, setIsTemplate] = useState(false);
    const [templateType, setTemplateType] = useState('cuti_form');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setTitle(''); setFile(null); setRecipientIds([]);
            setIsTemplate(false); setSearchTerm('');
        }
    }, [isOpen]);

    const rolesForBulkSelect = ['dosen', 'kaprodi', 'wadir', 'p4m'];

    const handleSelectRole = (role, checked) => {
        const ids = recipientList
            .filter(u => u.roles.some(r => r.role.nama_role === role))
            .map(u => u.id);
        if (checked) setRecipientIds(prev => [...new Set([...prev, ...ids])]);
        else setRecipientIds(prev => prev.filter(id => !ids.includes(id)));
    };

    const isRoleSelected = (role) => {
        const ids = recipientList
            .filter(u => u.roles.some(r => r.role.nama_role === role))
            .map(u => u.id);
        return ids.length > 0 && ids.every(id => recipientIds.includes(id));
    };

    const filteredRecipients = recipientList.filter(u =>
        u.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = async () => {
        if (!title || !file || (!isTemplate && recipientIds.length === 0)) {
            alert('Harap lengkapi semua field yang diperlukan.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave({ title, file, recipientIds, isTemplate, templateType });
            onClose();
        } catch {
            alert('Gagal mengirim dokumen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{style}</style>
            <div className="sdm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="sdm-card">

                    {/* Header */}
                    <div className="sdm-header">
                        <div>
                            <div className="sdm-badge">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <circle cx="5" cy="5" r="4" fill="#2563EB" />
                                </svg>
                                Dokumen Baru
                            </div>
                            <h2 className="sdm-title">Kirim Dokumen</h2>
                            <p className="sdm-subtitle">Upload file dan tentukan penerima dokumen</p>
                        </div>
                        <button className="sdm-close" onClick={onClose} aria-label="Tutup">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M1 1l12 12M13 1L1 13" />
                            </svg>
                        </button>
                    </div>

                    <div className="sdm-divider" />

                    {/* Body */}
                    <div className="sdm-body">

                        {/* Judul */}
                        <div className="sdm-group">
                            <label className="sdm-label">Judul Dokumen <span className="sdm-req">*</span></label>
                            <div className="sdm-input-wrap">
                                <span className="sdm-input-icon">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Nama dokumen yang akan dikirim"
                                    className="sdm-input"
                                />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="sdm-group">
                            <label className="sdm-label">Upload File <span className="sdm-req">*</span></label>
                            <div
                                className={`sdm-file-zone ${file ? 'has-file' : ''}`}
                                style={{ position: 'relative' }}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    onChange={e => setFile(e.target.files[0])}
                                    style={{ display: 'none' }}
                                />
                                <div className="sdm-file-icon">
                                    {file ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    )}
                                </div>
                                {file ? (
                                    <>
                                        <span className="sdm-file-name">{file.name}</span>
                                        <span className="sdm-file-label-sub">
                                            {(file.size / 1024).toFixed(1)} KB · Klik untuk ganti
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="sdm-file-label-main">Klik untuk pilih file</span>
                                        <span className="sdm-file-label-sub">PDF, DOCX, XLSX didukung</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Penerima */}
                        <div className="sdm-group">
                            <label className="sdm-label" style={{ display: 'flex', alignItems: 'center' }}>
                                Penerima <span className="sdm-req">*</span>
                                {recipientIds.length > 0 && (
                                    <span className="sdm-selected-count">{recipientIds.length} dipilih</span>
                                )}
                            </label>

                            {/* Role chips */}
                            <div className="sdm-role-chips">
                                {rolesForBulkSelect.map(role => (
                                    <label key={role} className={`sdm-role-chip ${isRoleSelected(role) ? 'selected' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={isRoleSelected(role)}
                                            onChange={e => handleSelectRole(role, e.target.checked)}
                                        />
                                        <span className="sdm-role-chip-dot" />
                                        Semua {ROLE_LABELS[role] || role}
                                    </label>
                                ))}
                            </div>

                            <div className="sdm-recipient-box">
                                {/* Search */}
                                <div className="sdm-recipient-search">
                                    <svg className="sdm-recipient-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Cari nama penerima..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* List */}
                                <div className="sdm-recipient-scroll">
                                    {filteredRecipients.length === 0 ? (
                                        <div className="sdm-empty-recip">Tidak ditemukan</div>
                                    ) : (
                                        filteredRecipients.map(user => {
                                            const checked = recipientIds.includes(user.id);
                                            return (
                                                <div
                                                    key={user.id}
                                                    className={`sdm-recipient-item ${checked ? 'checked' : ''}`}
                                                    onClick={() => setRecipientIds(p =>
                                                        p.includes(user.id) ? p.filter(id => id !== user.id) : [...p, user.id]
                                                    )}
                                                >
                                                    <div className="sdm-custom-checkbox">
                                                        {checked && (
                                                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M2 5l2.5 2.5L8 2.5" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="sdm-recipient-avatar">{getInitials(user.nama)}</div>
                                                    <span className="sdm-recipient-name">{user.nama}</span>
                                                    <span className="sdm-recipient-role">
                                                        {user.roles.map(r => r.role.nama_role).join(', ')}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sdm-footer">
                        <button className="sdm-btn sdm-btn-cancel" onClick={onClose}>Batal</button>
                        <button
                            className="sdm-btn sdm-btn-send"
                            onClick={handleSave}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="sdm-spinner" />
                                    Mengirim...
                                </>
                            ) : (
                                <>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    Kirim Dokumen
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}