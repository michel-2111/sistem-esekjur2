// components/sekjur/akademik/ProdiManager.js
import { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import AddEditProdiModal from './AddEditProdiModal';
import ConfirmationModal from '../../shared/ConfirmationModal';

const style = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

    .pm-wrap { font-family: 'Plus Jakarta Sans', sans-serif; }

    .pm-card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06);
        border: 1px solid #F1F5F9;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .pm-card-header {
        padding: 20px 20px 16px;
        border-bottom: 1px solid #F1F5F9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .pm-card-header-left { display: flex; align-items: center; gap: 10px; }

    .pm-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #F5F3FF, #EDE9FE);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7C3AED;
        flex-shrink: 0;
    }

    .pm-card-title {
        font-size: 15px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.3px;
    }

    .pm-card-count {
        font-size: 12px;
        color: #94A3B8;
        font-weight: 500;
        margin-top: 1px;
    }

    .pm-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #7C3AED, #6D28D9);
        color: white;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Plus Jakarta Sans', sans-serif;
        padding: 8px 14px;
        border-radius: 9px;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;
        box-shadow: 0 2px 6px rgba(124, 58, 237, 0.3);
    }

    .pm-add-btn:hover {
        background: linear-gradient(135deg, #6D28D9, #5B21B6);
        box-shadow: 0 4px 10px rgba(124, 58, 237, 0.4);
        transform: translateY(-1px);
    }

    .pm-add-btn:active { transform: translateY(0); }

    .pm-list {
        flex: 1;
        padding: 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        scrollbar-width: thin;
        scrollbar-color: #E2E8F0 transparent;
    }

    .pm-list::-webkit-scrollbar { width: 4px; }
    .pm-list::-webkit-scrollbar-track { background: transparent; }
    .pm-list::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 4px; }

    .pm-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 12px;
        background: #FAFAFA;
        border: 1px solid #F1F5F9;
        border-radius: 10px;
        transition: all 0.15s;
    }

    .pm-item:hover {
        background: #F5F3FF;
        border-color: #DDD6FE;
    }

    .pm-item-num {
        width: 24px;
        height: 24px;
        border-radius: 7px;
        background: #EDE9FE;
        color: #7C3AED;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .pm-item-name {
        flex: 1;
        font-size: 13.5px;
        font-weight: 500;
        color: #1E293B;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .pm-item-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .pm-item:hover .pm-item-actions { opacity: 1; }

    .pm-action-btn {
        width: 28px;
        height: 28px;
        border-radius: 7px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.12s;
        background: transparent;
    }

    .pm-action-btn.edit {
        color: #D97706;
    }

    .pm-action-btn.edit:hover {
        background: #FEF3C7;
        color: #B45309;
    }

    .pm-action-btn.delete {
        color: #DC2626;
    }

    .pm-action-btn.delete:hover {
        background: #FEE2E2;
        color: #B91C1C;
    }

    .pm-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px 16px;
        gap: 8px;
        color: #CBD5E1;
        flex: 1;
    }

    .pm-empty-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: #F8FAFC;
        border: 1.5px dashed #E2E8F0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #CBD5E1;
    }

    .pm-empty-text {
        font-size: 13px;
        color: #94A3B8;
        font-weight: 500;
    }

    .pm-empty-sub {
        font-size: 12px;
        color: #CBD5E1;
    }

    .pm-footer {
        padding: 10px 12px;
        border-top: 1px solid #F1F5F9;
        background: #FAFAFA;
        text-align: center;
        font-size: 11.5px;
        color: #CBD5E1;
        font-weight: 500;
    }
    `;

    export default function ProdiManager({ prodiList, onDataChange }) {
    const [isProdiModalOpen, setIsProdiModalOpen] = useState(false);
    const [prodiToEdit, setProdiToEdit] = useState(null);
    const [prodiToDelete, setProdiToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApiCall = async (action, payload) => {
        setIsSubmitting(true);
        try {
        const res = await fetch('/api/sekjur/akademik', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, payload }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Terjadi kesalahan.');
        }
        onDataChange();
        } catch (error) {
        alert(error.message);
        } finally {
        setIsSubmitting(false);
        setIsProdiModalOpen(false);
        setProdiToDelete(null);
        }
    };

    const handleSaveProdi = (prodiData) => {
        const action = prodiData.id ? 'UPDATE_PRODI' : 'CREATE_PRODI';
        handleApiCall(action, prodiData);
    };

    const handleDeleteProdi = () => {
        handleApiCall('DELETE_PRODI', { id: prodiToDelete.id });
    };

    const list = Array.isArray(prodiList) ? prodiList : [];

    return (
        <>
        <style>{style}</style>
        <div className="pm-wrap" style={{ height: '100%' }}>
            <div className="pm-card">

            {/* Header */}
            <div className="pm-card-header">
                <div className="pm-card-header-left">
                <div className="pm-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                </div>
                <div>
                    <div className="pm-card-title">Program Studi</div>
                    <div className="pm-card-count">{list.length} prodi terdaftar</div>
                </div>
                </div>
                <button
                className="pm-add-btn"
                onClick={() => { setProdiToEdit(null); setIsProdiModalOpen(true); }}
                >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Tambah
                </button>
            </div>

            {/* List */}
            <div className="pm-list">
                {list.length === 0 ? (
                <div className="pm-empty">
                    <div className="pm-empty-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    </div>
                    <div className="pm-empty-text">Belum ada Program Studi</div>
                    <div className="pm-empty-sub">Klik tombol Tambah untuk memulai</div>
                </div>
                ) : (
                list.map((prodi, index) => (
                    <div key={prodi.id} className="pm-item">
                    <div className="pm-item-num">{index + 1}</div>
                    <span className="pm-item-name" title={prodi.nama}>{prodi.nama}</span>
                    <div className="pm-item-actions">
                        {/* Edit (uncomment saat API siap) */}
                        {/* <button
                        className="pm-action-btn edit"
                        onClick={() => { setProdiToEdit(prodi); setIsProdiModalOpen(true); }}
                        title="Edit"
                        >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        </button> */}
                        <button
                        className="pm-action-btn delete"
                        onClick={() => setProdiToDelete(prodi)}
                        title="Hapus"
                        >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        </button>
                    </div>
                    </div>
                ))
                )}
            </div>

            {list.length > 0 && (
                <div className="pm-footer">{list.length} program studi · Hover item untuk aksi</div>
            )}
            </div>
        </div>

        <AddEditProdiModal
            isOpen={isProdiModalOpen}
            onClose={() => setIsProdiModalOpen(false)}
            onSave={handleSaveProdi}
            initialData={prodiToEdit}
        />

        <ConfirmationModal
            isOpen={!!prodiToDelete}
            onClose={() => setProdiToDelete(null)}
            onConfirm={handleDeleteProdi}
            title="Konfirmasi Hapus Prodi"
        >
            Anda yakin ingin menghapus prodi <strong>{prodiToDelete?.nama}</strong>? Ini akan menghapus semua mata kuliah yang terkait.
        </ConfirmationModal>
        </>
    );
}