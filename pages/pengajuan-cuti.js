// pages/pengajuan-cuti.js
import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { Download, Send, CheckCircle, XCircle, Clock, AlertTriangle, FileText, Upload, CalendarClock } from 'lucide-react';

const LEAVE_STATUS_MAP = {
    menunggu_kajur: { label: 'Menunggu Persetujuan Kajur', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: Clock },
    menunggu_wadir: { label: 'Menunggu Persetujuan Wadir', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: Clock },
    disetujui:      { label: 'Pengajuan Disetujui', color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle },
    ditolak:        { label: 'Pengajuan Ditolak', color: '#dc2626', bg: '#fff1f2', border: '#fecdd3', icon: XCircle },
};

export default function PengajuanCutiPage() {
    const [file, setFile] = useState(null);
    const [durasi, setDurasi] = useState('');
    const [template, setTemplate] = useState(null);
    const [existingApp, setExistingApp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/master/templates?type=cuti_form'),
            fetch('/api/mahasiswa/cuti')
        ]).then(async ([templateRes, appRes]) => {
            if (templateRes.ok) setTemplate(await templateRes.json());
            if (appRes.ok) setExistingApp(await appRes.json());
        }).catch(console.error).finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !durasi) { alert('Harap lengkapi durasi dan formulir.'); return; }
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('formFile', file);
        formData.append('durasi', durasi);
        try {
            const res = await fetch('/api/mahasiswa/cuti', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Gagal mengirim pengajuan.');
            setExistingApp(await res.json());
        } catch (error) { alert(error.message); }
        finally { setIsSubmitting(false); }
    };

    const formatFileSize = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b/1024).toFixed(1) + ' KB' : (b/1048576).toFixed(1) + ' MB';

    const css = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .pc-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; color: inherit; }
        .pc-skeleton { background: #f1f3f5; border-radius: 8px; height: 16px; animation: pc-pulse 1.4s ease-in-out infinite; }
        @keyframes pc-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        /* Status Card */
        .pc-status-card { border-radius: 16px; padding: 32px; text-align: center; border: 1.5px solid; }
        .pc-status-icon-wrap { width: 64px; height: 64px; border-radius: 18px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .pc-status-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.7; margin-bottom: 8px; }
        .pc-status-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0; }
        .pc-reject-box { background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 12px; padding: 16px 20px; margin-top: 20px; text-align: left; }
        .pc-reject-label { font-size: 0.78rem; font-weight: 700; color: #dc2626; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
        .pc-reject-text { font-size: 0.875rem; color: #9f1239; line-height: 1.5; }
        /* Section Card */
        .pc-section { background: white; border-radius: 14px; border: 1.5px solid #e5e7eb; padding: 24px; margin-bottom: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .pc-section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .pc-step-badge { width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(135deg, #3b5bdb, #5c7cfa); color: white; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pc-section-title { font-size: 0.95rem; font-weight: 700; color: #0f1923; }
        .pc-section-desc { font-size: 0.8rem; color: #6b7280; margin-top: 2px; }
        .pc-divider { height: 1px; background: #f1f3f5; margin: 0 0 16px; }
        /* Template Download */
        .pc-template-btn {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 10px 18px; border-radius: 10px;
            background: linear-gradient(135deg, #059669, #10b981); color: white;
            font-size: 0.875rem; font-weight: 600; text-decoration: none;
            box-shadow: 0 4px 10px rgba(5,150,105,0.3);
            transition: all 0.15s;
        }
        .pc-template-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(5,150,105,0.4); }
        .pc-no-template { display: flex; align-items: center; gap: 8px; color: #dc2626; font-size: 0.875rem; font-weight: 500; }
        /* Form */
        .pc-field { margin-bottom: 14px; }
        .pc-label { display: block; font-size: 0.78rem; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
        .pc-select-wrap { position: relative; }
        .pc-select {
            width: 100%; padding: 10px 36px 10px 14px;
            border: 1.5px solid #e5e7eb; border-radius: 10px;
            font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #111827;
            background: #fafafa; outline: none; appearance: none; cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        .pc-select:focus { border-color: #3b5bdb; background: white; box-shadow: 0 0 0 3px rgba(59,91,219,0.1); }
        .pc-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9ca3af; }
        /* Dropzone */
        .pc-dropzone {
            border: 2px dashed #d1d5db; border-radius: 12px; padding: 24px 20px; text-align: center;
            cursor: pointer; background: #fafbff; transition: all 0.15s;
        }
        .pc-dropzone:hover { border-color: #3b5bdb; background: #f0f3ff; }
        .pc-dropzone-icon { width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, #eef2ff, #c7d2fe); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .pc-dropzone-label { font-size: 0.875rem; font-weight: 600; color: #1a2340; margin-bottom: 3px; }
        .pc-dropzone-sub { font-size: 0.78rem; color: #9ca3af; }
        .pc-dropzone-sub span { color: #3b5bdb; font-weight: 600; }
        .pc-file-preview { display: flex; align-items: center; gap: 12px; background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 12px 14px; margin-top: 10px; }
        .pc-file-icon { width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg,#22c55e,#16a34a); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .pc-file-name { font-size: 0.875rem; font-weight: 600; color: #166534; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 220px; }
        .pc-file-size { font-size: 0.75rem; color: #4ade80; margin-top: 1px; }
        .pc-file-change { margin-left: auto; font-size: 0.75rem; color: #16a34a; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; background: none; border: none; white-space: nowrap; }
        /* Submit button */
        .pc-submit {
            width: 100%; padding: 12px; border-radius: 12px; border: none; cursor: pointer;
            background: linear-gradient(135deg, #3b5bdb, #5c7cfa); color: white;
            font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            box-shadow: 0 4px 12px rgba(59,91,219,0.35); margin-top: 20px;
            transition: all 0.15s;
        }
        .pc-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,91,219,0.45); }
        .pc-submit:disabled { background: linear-gradient(135deg, #d1d5db, #e5e7eb); box-shadow: none; cursor: not-allowed; color: #9ca3af; }
        .pc-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: pc-spin 0.7s linear infinite; }
        @keyframes pc-spin { to { transform: rotate(360deg); } }
    `;

    if (isLoading) {
        return (
            <Layout>
                <style>{css}</style>
                <div className="pc-wrap" style={{ maxWidth: 620 }}>
                    <div style={{ height: 32, marginBottom: 24 }}><div className="pc-skeleton" style={{ width: '40%' }} /></div>
                    <div className="pc-section"><div className="pc-skeleton" style={{ width: '60%', marginBottom: 12 }} /><div className="pc-skeleton" style={{ width: '40%' }} /></div>
                    <div className="pc-section"><div className="pc-skeleton" style={{ width: '50%', marginBottom: 12 }} /><div className="pc-skeleton" style={{ width: '80%' }} /></div>
                </div>
            </Layout>
        );
    }

    if (existingApp) {
        const info = LEAVE_STATUS_MAP[existingApp.status] || { label: existingApp.status, color: '#374151', bg: '#f9fafb', border: '#e5e7eb', icon: Clock };
        const Icon = info.icon;
        return (
            <Layout>
                <style>{css}</style>
                <div className="pc-wrap" >
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f1923', letterSpacing: '-0.03em' }}>Status Pengajuan Cuti</h1>
                    </div>
                    <div className="pc-status-card" style={{ background: info.bg, borderColor: info.border, color: info.color }}>
                        <div className="pc-status-icon-wrap" style={{ background: `${info.color}18` }}>
                            <Icon size={28} />
                        </div>
                        <div className="pc-status-label">Status Pengajuan</div>
                        <div className="pc-status-title">{info.label}</div>
                        {existingApp.durasi && (
                            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6, background: `${info.color}15`, padding: '5px 14px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>
                                <CalendarClock size={13} /> {existingApp.durasi}
                            </div>
                        )}
                    </div>
                    {existingApp.status === 'ditolak' && (
                        <div className="pc-reject-box">
                            <div className="pc-reject-label"><AlertTriangle size={13} />Alasan Penolakan</div>
                            <div className="pc-reject-text">{existingApp.alasan_ditolak || 'Tidak ada alasan spesifik yang diberikan.'}</div>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <style>{css}</style>
            <div className="pc-wrap" style={{ maxWidth: 620 }}>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'DM Sans, sans-serif' }}>
                        Beranda › Cuti Akademik
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0f1923', letterSpacing: '-0.03em', fontFamily: 'DM Sans, sans-serif' }}>Pengajuan Cuti Akademik</h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: 4, fontFamily: 'DM Sans, sans-serif' }}>Ikuti langkah berikut untuk mengajukan cuti akademik</p>
                </div>

                {/* Step 1 */}
                <div className="pc-section">
                    <div className="pc-section-header">
                        <div className="pc-step-badge">1</div>
                        <div>
                            <div className="pc-section-title">Unduh &amp; Isi Formulir</div>
                            <div className="pc-section-desc">Unduh formulir, isi secara lengkap, lalu simpan untuk diunggah</div>
                        </div>
                    </div>
                    <div className="pc-divider" />
                    {template ? (
                        <a href={template.file_url} target="_blank" rel="noopener noreferrer" className="pc-template-btn">
                            <Download size={16} /> {template.title}
                        </a>
                    ) : (
                        <div className="pc-no-template"><AlertTriangle size={16} /> Template formulir belum tersedia</div>
                    )}
                </div>

                {/* Step 2 */}
                <div className="pc-section">
                    <div className="pc-section-header">
                        <div className="pc-step-badge">2</div>
                        <div>
                            <div className="pc-section-title">Unggah &amp; Kirim Pengajuan</div>
                            <div className="pc-section-desc">Pilih durasi cuti dan unggah formulir yang telah diisi</div>
                        </div>
                    </div>
                    <div className="pc-divider" />
                    <form onSubmit={handleSubmit}>
                        {/* Durasi */}
                        <div className="pc-field">
                            <label className="pc-label">Durasi Cuti</label>
                            <div className="pc-select-wrap">
                                <select className="pc-select" value={durasi} onChange={e => setDurasi(e.target.value)} required>
                                    <option value="">— Pilih durasi cuti —</option>
                                    <option value="2 Semester (1 Tahun)">2 Semester (1 Tahun)</option>
                                    <option value="4 Semester (2 Tahun)">4 Semester (2 Tahun)</option>
                                </select>
                                <span className="pc-select-arrow">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="pc-field">
                            <label className="pc-label">Formulir yang Telah Diisi</label>
                            <div className="pc-dropzone" onClick={() => !file && fileInputRef.current?.click()}>
                                <div className="pc-dropzone-icon"><Upload size={20} color="#3b5bdb" /></div>
                                <div className="pc-dropzone-label">Seret &amp; lepas file di sini</div>
                                <div className="pc-dropzone-sub">atau <span onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>pilih dari komputer</span></div>
                                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                            </div>
                            {file && (
                                <div className="pc-file-preview">
                                    <div className="pc-file-icon"><FileText size={16} color="white" /></div>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="pc-file-name">{file.name}</div>
                                        <div className="pc-file-size">{formatFileSize(file.size)}</div>
                                    </div>
                                    <button type="button" className="pc-file-change" onClick={() => { setFile(null); fileInputRef.current.value = ''; }}>Ganti</button>
                                </div>
                            )}
                        </div>

                        <button type="submit" className="pc-submit" disabled={!template || isSubmitting}>
                            {isSubmitting ? <><div className="pc-spinner" /> Mengirim...</> : <><Send size={16} /> Kirim Pengajuan</>}
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
}