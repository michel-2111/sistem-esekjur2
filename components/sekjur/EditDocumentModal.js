// components/sekjur/EditDocumentModal.js
import { useState, useEffect } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';

export default function EditDocumentModal({ isOpen, onClose, onSave, document, recipientList }) {
    const [title, setTitle] = useState('');
    const [recipientIds, setRecipientIds] = useState([]);
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (document) {
            setTitle(document.title || '');
            setRecipientIds(document.recipients?.map(r => r.user_id ?? r.user?.id).filter(Boolean) || []);
            setFile(null);
        }
    }, [document]);

    if (!isOpen || !document) return null;

    const toggleRecipient = (id) => {
        setRecipientIds(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    };

    const handleSubmit = async () => {
        if (!title.trim() || recipientIds.length === 0) return;
        setIsSaving(true);
        try {
            await onSave(document.id, { title, recipientIds, file });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>Edit Dokumen</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                        <X size={18} />
                    </button>
                </div>

                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Judul Dokumen</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #E2E8F0', marginTop: 4, marginBottom: 14, fontSize: 13, color: '#0F172A' }}
                />

                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Penerima</label>
                <div style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: 8, padding: 8, marginTop: 4, marginBottom: 14 }}>
                    {recipientList.map(r => (
                        <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px', fontSize: 13, cursor: 'pointer', color: '#0F172A' }}>
                            <input
                                type="checkbox"
                                checked={recipientIds.includes(r.id)}
                                onChange={() => toggleRecipient(r.id)}
                            />
                            {r.nama}
                        </label>
                    ))}
                </div>

                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Ganti File (opsional)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', border: '1.5px dashed #CBD5E1', borderRadius: 8, marginTop: 4, marginBottom: 18, cursor: 'pointer', fontSize: 13, color: '#64748B' }}>
                    {file ? <FileText size={14} /> : <UploadCloud size={14} />}
                    {file ? file.name : 'Pilih file baru (kosongkan jika tidak diubah)'}
                    <input type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#0F172A' }}>
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving}
                        style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: isSaving ? 0.6 : 1 }}
                    >
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}