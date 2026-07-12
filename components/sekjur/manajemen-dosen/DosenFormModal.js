// components/sekjur/manajemen-dosen/DosenFormModal.js
import { useState, useEffect } from 'react';
import { X, Save, UserPlus, UserCog, User, Hash, BookOpen, Lock, Eye, EyeOff } from 'lucide-react';

export default function DosenFormModal({ isOpen, onClose, onSubmit, initialData, prodiList, isSubmitting }) {
    const [formData, setFormData] = useState({ id: '', nama: '', nip: '', prodi_id: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ id: initialData.id, nama: initialData.nama, nip: initialData.identifier, prodi_id: initialData.prodi_id || '', password: '' });
        } else {
            setFormData({ id: '', nama: '', nip: '', prodi_id: '', password: '' });
        }
        setShowPassword(false);
    }, [initialData, isOpen]);

    const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

    if (!isOpen) return null;
    const isEditMode = !!initialData;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
                .dfm-overlay {
                    font-family: 'DM Sans', sans-serif;
                    position: fixed; inset: 0;
                    background: rgba(8, 12, 28, 0.72);
                    backdrop-filter: blur(8px);
                    z-index: 50;
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: dfm-in 0.18s ease;
                }
                @keyframes dfm-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes dfm-slide { from { opacity: 0; transform: translateY(18px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .dfm-card {
                    background: #ffffff; border-radius: 18px;
                    width: 100%; max-width: 460px;
                    box-shadow: 0 32px 72px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.05);
                    animation: dfm-slide 0.24s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                }
                .dfm-top-bar {
                    height: 4px;
                    background: ${isEditMode
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #3b5bdb, #818cf8)'};
                }
                .dfm-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 20px 24px 0;
                }
                .dfm-header-left { display: flex; align-items: center; gap: 12px; }
                .dfm-header-icon {
                    width: 42px; height: 42px; border-radius: 12px;
                    background: ${isEditMode
                        ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                        : 'linear-gradient(135deg, #eef2ff, #c7d2fe)'};
                    display: flex; align-items: center; justify-content: center;
                }
                .dfm-title { font-size: 1rem; font-weight: 700; color: #0f1923; }
                .dfm-subtitle { font-size: 0.75rem; color: #9ca3af; margin-top: 1px; }
                .dfm-close {
                    width: 32px; height: 32px; border-radius: 8px; border: none;
                    background: #f3f4f6; color: #6b7280; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s;
                }
                .dfm-close:hover { background: #e5e7eb; color: #111827; }
                .dfm-body { padding: 20px 24px 0; }
                .dfm-divider { height: 1px; background: #f1f3f5; margin: 16px 0; }
                .dfm-field { margin-bottom: 14px; }
                .dfm-label {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 0.78rem; font-weight: 600; color: #374151;
                    margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;
                }
                .dfm-label-note { font-size: 0.72rem; color: #9ca3af; font-weight: 400; text-transform: none; letter-spacing: 0; }
                .dfm-input-wrap { position: relative; }
                .dfm-input-icon {
                    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
                    color: #9ca3af; pointer-events: none;
                }
                .dfm-input {
                    width: 100%; padding: 10px 14px 10px 38px;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #111827;
                    background: #fafafa; outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
                    box-sizing: border-box;
                }
                .dfm-input:focus { border-color: #3b5bdb; background: white; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }
                .dfm-input::placeholder { color: #c1c8d4; }
                .dfm-input-pass { padding-right: 42px; }
                .dfm-eye-btn {
                    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                    background: none; border: none; cursor: pointer; color: #9ca3af;
                    display: flex; align-items: center; padding: 0;
                }
                .dfm-eye-btn:hover { color: #374151; }
                .dfm-select {
                    width: 100%; padding: 10px 14px 10px 38px;
                    border: 1.5px solid #e5e7eb; border-radius: 10px;
                    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #111827;
                    background: #fafafa; outline: none; cursor: pointer;
                    appearance: none;
                    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
                    box-sizing: border-box;
                }
                .dfm-select:focus { border-color: #3b5bdb; background: white; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }
                .dfm-select-arrow {
                    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
                    pointer-events: none; color: #9ca3af;
                }
                .dfm-footer {
                    display: flex; justify-content: flex-end; gap: 10px;
                    padding: 16px 24px 24px;
                }
                .dfm-btn {
                    display: inline-flex; align-items: center; gap: 7px;
                    padding: 10px 20px; border-radius: 10px; border: none;
                    font-family: 'DM Sans', sans-serif; font-size: 0.875rem; font-weight: 600;
                    cursor: pointer; transition: all 0.15s;
                }
                .dfm-btn-ghost { background: #f3f4f6; color: #4b5563; }
                .dfm-btn-ghost:hover { background: #e5e7eb; }
                .dfm-btn-primary {
                    background: ${isEditMode
                        ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(135deg, #3b5bdb, #5c7cfa)'};
                    color: white;
                    box-shadow: ${isEditMode
                        ? '0 4px 12px rgba(245,158,11,0.35)'
                        : '0 4px 12px rgba(59,91,219,0.35)'};
                }
                .dfm-btn-primary:hover { transform: translateY(-1px); filter: brightness(1.05); }
                .dfm-btn-primary:active { transform: none; }
                .dfm-btn-primary:disabled { background: linear-gradient(135deg, #d1d5db, #e5e7eb); box-shadow: none; cursor: not-allowed; transform: none; color: #9ca3af; }
                .dfm-spinner {
                    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.35);
                    border-top-color: white; border-radius: 50%;
                    animation: dfm-spin 0.7s linear infinite;
                }
                @keyframes dfm-spin { to { transform: rotate(360deg); } }
            `}</style>
            <div className="dfm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="dfm-card">
                    <div className="dfm-top-bar" />
                    <div className="dfm-header">
                        <div className="dfm-header-left">
                            <div className="dfm-header-icon">
                                {isEditMode
                                    ? <UserCog size={20} color="#d97706" />
                                    : <UserPlus size={20} color="#3b5bdb" />}
                            </div>
                            <div>
                                <div className="dfm-title">{isEditMode ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}</div>
                                <div className="dfm-subtitle">{isEditMode ? 'Perbarui informasi dosen' : 'Lengkapi data untuk menambah dosen'}</div>
                            </div>
                        </div>
                        <button className="dfm-close" onClick={onClose}><X size={16} /></button>
                    </div>

                    <div className="dfm-body">
                        <div className="dfm-divider" />
                        <form id="dosen-form" onSubmit={handleSubmit}>
                            {/* Nama */}
                            <div className="dfm-field">
                                <label className="dfm-label"><User size={12} />Nama Lengkap</label>
                                <div className="dfm-input-wrap">
                                    <User size={15} className="dfm-input-icon" />
                                    <input type="text" required className="dfm-input" placeholder="Contoh: Dr. Budi Santoso, M.T."
                                        value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
                                </div>
                            </div>
                            {/* NIP */}
                            <div className="dfm-field">
                                <label className="dfm-label"><Hash size={12} />NIP <span className="dfm-label-note">— digunakan sebagai username</span></label>
                                <div className="dfm-input-wrap">
                                    <Hash size={15} className="dfm-input-icon" />
                                    <input type="text" required className="dfm-input" placeholder="Contoh: 198501012010011001"
                                        value={formData.nip} onChange={e => setFormData({ ...formData, nip: e.target.value })} />
                                </div>
                            </div>
                            {/* Prodi */}
                            <div className="dfm-field">
                                <label className="dfm-label"><BookOpen size={12} />Program Studi</label>
                                <div className="dfm-input-wrap">
                                    <BookOpen size={15} className="dfm-input-icon" />
                                    <select required className="dfm-select"
                                        value={formData.prodi_id} onChange={e => setFormData({ ...formData, prodi_id: e.target.value })}>
                                        <option value="">— Pilih Program Studi —</option>
                                        {prodiList.map(prodi => (
                                            <option key={prodi.id} value={prodi.id}>{prodi.nama}</option>
                                        ))}
                                    </select>
                                    <span className="dfm-select-arrow">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </span>
                                </div>
                            </div>
                            {/* Password */}
                            <div className="dfm-field">
                                <label className="dfm-label">
                                    <Lock size={12} />Password
                                    {isEditMode && <span className="dfm-label-note">— kosongkan jika tidak diubah</span>}
                                </label>
                                <div className="dfm-input-wrap">
                                    <Lock size={15} className="dfm-input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required={!isEditMode}
                                        className="dfm-input dfm-input-pass"
                                        placeholder={isEditMode ? 'Password baru (opsional)' : 'Masukkan password awal'}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button type="button" className="dfm-eye-btn" onClick={() => setShowPassword(v => !v)}>
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="dfm-footer">
                        <button type="button" className="dfm-btn dfm-btn-ghost" onClick={onClose}>Batal</button>
                        <button type="submit" form="dosen-form" disabled={isSubmitting} className="dfm-btn dfm-btn-primary">
                            {isSubmitting
                                ? <><div className="dfm-spinner" /> Menyimpan...</>
                                : <><Save size={15} /> {isEditMode ? 'Perbarui Data' : 'Simpan Dosen'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}