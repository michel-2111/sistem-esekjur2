// components/sekjur/EditTemplateModal.js
import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';

export default function EditTemplateModal({ isOpen, onClose, onSave, template }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (selectedFile) => {
        if (selectedFile) setFile(selectedFile);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) setFile(dropped);
    };

    const handleSave = async () => {
        if (!file) {
            alert('Silakan pilih file template yang baru.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave(template.id, file);
            onClose();
        } catch (error) {
            alert('Gagal memperbarui template.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (!isOpen) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
                .etm-overlay {
                    font-family: 'Sora', sans-serif;
                    position: fixed; inset: 0;
                    background: rgba(8, 12, 24, 0.75);
                    backdrop-filter: blur(6px);
                    z-index: 50;
                    display: flex; align-items: center; justify-content: center;
                    padding: 1rem;
                    animation: etm-fadeIn 0.2s ease;
                }
                @keyframes etm-fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes etm-slideUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .etm-card {
                    background: #ffffff;
                    border-radius: 16px;
                    width: 100%; max-width: 480px;
                    box-shadow: 0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.04);
                    animation: etm-slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                    overflow: hidden;
                }
                .etm-header {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    padding: 24px 24px 0;
                }
                .etm-header-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: linear-gradient(135deg, #3b5bdb, #5c7cfa);
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 4px 12px rgba(59, 91, 219, 0.35);
                }
                .etm-title { font-size: 1.125rem; font-weight: 700; color: #0f1923; margin: 4px 0 0; }
                .etm-subtitle { font-size: 0.8rem; color: #8a94a6; margin: 2px 0 0; font-weight: 400; }
                .etm-close-btn {
                    width: 32px; height: 32px; border-radius: 8px; border: none;
                    background: #f1f3f5; color: #6c757d; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.15s, color 0.15s;
                }
                .etm-close-btn:hover { background: #e9ecef; color: #343a40; }
                .etm-body { padding: 20px 24px 24px; }
                .etm-info-banner {
                    background: #f8f9ff; border: 1px solid #e0e7ff;
                    border-radius: 10px; padding: 12px 14px;
                    display: flex; align-items: center; gap: 10px;
                    margin-bottom: 18px;
                }
                .etm-info-banner-label { font-size: 0.72rem; color: #7c8db5; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
                .etm-info-banner-value { font-size: 0.875rem; color: #1a2340; font-weight: 600; margin-top: 1px; }
                .etm-dropzone {
                    border: 2px dashed #d0d7e8; border-radius: 12px;
                    padding: 28px 20px; text-align: center; cursor: pointer;
                    transition: border-color 0.2s, background 0.2s;
                    background: #fafbff;
                }
                .etm-dropzone:hover, .etm-dropzone.dragging {
                    border-color: #3b5bdb; background: #f0f3ff;
                }
                .etm-dropzone-icon {
                    width: 48px; height: 48px; border-radius: 12px;
                    background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 12px;
                }
                .etm-dropzone-label { font-size: 0.875rem; font-weight: 600; color: #1a2340; margin-bottom: 4px; }
                .etm-dropzone-sub { font-size: 0.78rem; color: #8a94a6; }
                .etm-dropzone-sub span { color: #3b5bdb; font-weight: 600; cursor: pointer; }
                .etm-file-preview {
                    display: flex; align-items: center; gap: 12px;
                    background: #f0faf0; border: 1px solid #bbf7d0;
                    border-radius: 10px; padding: 12px 14px; margin-top: 12px;
                }
                .etm-file-icon {
                    width: 38px; height: 38px; border-radius: 8px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .etm-file-name { font-size: 0.875rem; font-weight: 600; color: #166534; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }
                .etm-file-size { font-size: 0.75rem; color: #4ade80; margin-top: 1px; }
                .etm-file-change { margin-left: auto; font-size: 0.75rem; color: #16a34a; font-weight: 600; cursor: pointer; white-space: nowrap; text-decoration: underline; text-underline-offset: 2px; }
                .etm-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 24px; }
                .etm-btn {
                    display: inline-flex; align-items: center; gap: 8px;
                    padding: 10px 20px; border-radius: 10px; border: none;
                    font-family: 'Sora', sans-serif; font-size: 0.875rem; font-weight: 600;
                    cursor: pointer; transition: all 0.15s ease;
                }
                .etm-btn-secondary { background: #f1f3f5; color: #495057; }
                .etm-btn-secondary:hover { background: #e9ecef; }
                .etm-btn-primary {
                    background: linear-gradient(135deg, #3b5bdb, #5c7cfa);
                    color: white;
                    box-shadow: 0 4px 12px rgba(59, 91, 219, 0.35);
                }
                .etm-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59, 91, 219, 0.45); }
                .etm-btn-primary:active { transform: translateY(0); }
                .etm-btn-primary:disabled { background: linear-gradient(135deg, #adb5bd, #ced4da); box-shadow: none; transform: none; cursor: not-allowed; }
                .etm-spinner {
                    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: white; border-radius: 50%;
                    animation: etm-spin 0.7s linear infinite;
                }
                @keyframes etm-spin { to { transform: rotate(360deg); } }
            `}</style>
            <div className="etm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="etm-card">
                    {/* Header */}
                    <div className="etm-header">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                            <div className="etm-header-icon">
                                <Upload size={20} color="white" />
                            </div>
                            <div>
                                <div className="etm-title">Ubah File Template</div>
                                <div className="etm-subtitle">Unggah file pengganti di bawah ini</div>
                            </div>
                        </div>
                        <button className="etm-close-btn" onClick={onClose}>
                            <X size={16} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="etm-body">
                        {/* Info Banner */}
                        <div className="etm-info-banner">
                            <FileText size={18} color="#3b5bdb" style={{ flexShrink: 0 }} />
                            <div>
                                <div className="etm-info-banner-label">Template saat ini</div>
                                <div className="etm-info-banner-value">{template?.title}</div>
                            </div>
                        </div>

                        {/* Dropzone */}
                        <div
                            className={`etm-dropzone${isDragging ? ' dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => !file && fileInputRef.current?.click()}
                        >
                            <div className="etm-dropzone-icon">
                                <Upload size={22} color="#3b5bdb" />
                            </div>
                            <div className="etm-dropzone-label">Seret & lepas file di sini</div>
                            <div className="etm-dropzone-sub">atau <span onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>pilih dari komputer</span></div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={e => handleFileChange(e.target.files[0])}
                            />
                        </div>

                        {/* File Preview */}
                        {file && (
                            <div className="etm-file-preview">
                                <div className="etm-file-icon">
                                    <CheckCircle size={18} color="white" />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div className="etm-file-name">{file.name}</div>
                                    <div className="etm-file-size">{formatFileSize(file.size)}</div>
                                </div>
                                <button
                                    className="etm-file-change"
                                    onClick={() => { setFile(null); fileInputRef.current.value = ''; }}
                                >
                                    Ganti
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="etm-footer">
                        <button className="etm-btn etm-btn-secondary" onClick={onClose}>
                            Batal
                        </button>
                        <button
                            className="etm-btn etm-btn-primary"
                            onClick={handleSave}
                            disabled={isSubmitting || !file}
                        >
                            {isSubmitting ? (
                                <><div className="etm-spinner" /> Menyimpan...</>
                            ) : (
                                <><Upload size={15} /> Simpan Perubahan</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}