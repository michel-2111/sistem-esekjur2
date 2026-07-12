import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import TAStepCard from './TAStepCard';

function DocStatusBadge({ status, feedback }) {
    const cfg = {
        disetujui: { bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0', label: 'Disetujui' },
        ditolak:   { bg: '#fef2f2', color: '#991b1b', border: '#fecaca', label: 'Ditolak' },
        pending:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a', label: 'Menunggu' },
    }[status] || { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', label: status };

    return (
        <div>
            <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
                {cfg.label}
            </span>
            {status === 'ditolak' && feedback && (
                <p className="text-xs mt-1 italic" style={{ color: '#ef4444' }}>
                    Revisi: {feedback}
                </p>
            )}
        </div>
    );
}

function FileUploadField({ req, existingDoc, onChange }) {
    return (
        <div
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}
        >
            <div>
                <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{req.nama}</p>
                {req.deskripsi && (
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{req.deskripsi}</p>
                )}
            </div>

            <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs font-semibold w-fit"
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
            >
                <Upload size={12} />
                Pilih File PDF
                <input
                    type="file" accept=".pdf" className="hidden"
                    onChange={e => onChange(req.id, e.target.files[0])}
                />
            </label>

            {existingDoc && (
                <div className="pt-1" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <p className="text-xs mb-1" style={{ color: '#94a3b8' }}>Status saat ini:</p>
                    <DocStatusBadge status={existingDoc.status} feedback={existingDoc.feedback} />
                </div>
            )}
        </div>
    );
}

export default function Tahap1Persyaratan({
    status, taData, requirements,
    handleFileChange, handleUploadRequirements, isSubmitting
}) {
    return (
        <TAStepCard
            title="Tahap 1: Persyaratan Administrasi"
            subtitle="Transkrip Nilai & Bukti UKT Semester 8"
            status={status}
        >
            {status === 'active' || status === 'rejected' ? (
                <form onSubmit={handleUploadRequirements} className="space-y-5">
                    {/* Rejection notice */}
                    {status === 'rejected' && (
                        <div
                            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                        >
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                            <div>
                                <p className="font-semibold" style={{ color: '#991b1b' }}>Dokumen Ditolak</p>
                                <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>
                                    {taData?.requirements_feedback} — Silakan upload ulang.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* File upload grid */}
                    {requirements.length === 0 ? (
                        <p className="text-sm italic" style={{ color: '#94a3b8' }}>
                            Belum ada syarat yang diatur panitia.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {requirements.map(req => (
                                <FileUploadField
                                    key={req.id}
                                    req={req}
                                    existingDoc={taData?.documents?.find(d => d.requirement_id === req.id)}
                                    onChange={handleFileChange}
                                />
                            ))}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-1">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                            }}
                            onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                                </svg>
                            ) : <Upload size={14} />}
                            {isSubmitting ? 'Mengunggah...' : 'Kirim Persyaratan'}
                        </button>
                    </div>
                </form>

            ) : status === 'pending' ? (
                <div
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                >
                    <svg className="animate-spin flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="3" strokeOpacity="0.3"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Menunggu Verifikasi</p>
                        <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                            Dokumen Anda sedang diverifikasi oleh Panitia TA.
                        </p>
                    </div>
                </div>

            ) : (
                <div className="space-y-3">
                    <div
                        className="flex items-center gap-2 px-4 py-3 rounded-xl"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                    >
                        <CheckCircle size={15} style={{ color: '#10b981' }} />
                        <p className="text-sm font-semibold" style={{ color: '#065f46' }}>
                            Semua Dokumen Persyaratan Valid
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 pt-1">
                        {taData?.documents?.map(doc => (
                            <a
                                key={doc.id}
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-xs font-semibold transition-all w-fit"
                                style={{ color: '#3b82f6' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                                onMouseLeave={e => e.currentTarget.style.color = '#3b82f6'}
                            >
                                <FileText size={13} />
                                Lihat {doc.requirement?.nama || 'Dokumen'}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </TAStepCard>
    );
}