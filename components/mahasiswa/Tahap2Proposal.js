import { Send, Calendar, MapPin, Users, Download, FileText, AlertCircle, Clock } from 'lucide-react';
import TAStepCard from './TAStepCard';

function InputField({ label, children }) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#94a3b8' }}>
                {label}
            </label>
            {children}
        </div>
    );
}

export default function Tahap2Proposal({
    status, taData, judul, setJudul,
    setFileProposal, handleUploadProposal, isSubmitting
}) {
    return (
        <TAStepCard
            title="Tahap 2: Pengajuan Proposal"
            subtitle="Upload dokumen proposal tugas akhir Anda"
            status={status}
        >
            {status === 'locked' ? (
                <div
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <span style={{ color: '#94a3b8', fontSize: '1.1rem' }}>🔒</span>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>
                        Selesaikan Tahap 1 terlebih dahulu untuk membuka tahap ini.
                    </p>
                </div>

            ) : status === 'active' || status === 'rejected' ? (
                <form onSubmit={handleUploadProposal} className="space-y-5">
                    {status === 'rejected' && (
                        <div
                            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
                            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
                        >
                            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                            <div>
                                <p className="font-semibold" style={{ color: '#991b1b' }}>Proposal Ditolak</p>
                                <p className="text-xs mt-0.5" style={{ color: '#b91c1c' }}>
                                    {taData?.requirements_feedback || 'Silakan revisi dan kirim ulang.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <InputField label="Judul Proposal">
                        <input
                            type="text" required
                            value={judul}
                            onChange={e => setJudul(e.target.value)}
                            placeholder="Masukkan judul proposal..."
                            className="w-full text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e293b' }}
                            onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #eff6ff'; }}
                            onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                        />
                    </InputField>

                    <InputField label="File Proposal (PDF)">
                        <label
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-semibold w-fit"
                            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                            onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                        >
                            <FileText size={14} />
                            Pilih File PDF
                            <input
                                type="file" accept=".pdf" required className="hidden"
                                onChange={e => setFileProposal(e.target.files[0])}
                            />
                        </label>
                    </InputField>

                    <div className="pt-1">
                        <button
                            type="submit" disabled={isSubmitting}
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
                            ) : <Send size={14} />}
                            {isSubmitting ? 'Mengirim...' : 'Ajukan Proposal'}
                        </button>
                    </div>
                </form>

            ) : status === 'pending' ? (
                <div className="space-y-3">
                    <div
                        className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                        style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                    >
                        <Clock size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: '#92400e' }}>Sedang Direview</p>
                            <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                                Proposal sedang ditinjau oleh Kaprodi dan Panitia.
                            </p>
                        </div>
                    </div>
                    <div className="px-1">
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>Judul</p>
                        <p className="text-sm font-medium" style={{ color: '#1e293b' }}>{taData?.proposal_title}</p>
                        
                        <a
                            href={taData?.proposal_file_url} target="_blank" rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold transition-all"
                            style={{ color: '#3b82f6' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                            onMouseLeave={e => e.currentTarget.style.color = '#3b82f6'}
                        >
                            <FileText size={12} /> Lihat File Proposal
                        </a>
                    </div>
                </div>

            ) : (   
                /* Approved / valid */
                <div className="space-y-5">
                    {/* Approved notice */}
                    <div
                        className="flex items-start gap-3 px-4 py-4 rounded-xl"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
                    >
                        <span className="text-xl shrink-0">🎉</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold" style={{ color: '#065f46' }}>Proposal Disetujui!</p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#047857' }}>{taData?.proposal_title}</p>

                            <a
                                href={taData?.proposal_file_url} target="_blank" rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold transition-all"
                                style={{ color: '#3b82f6' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                                onMouseLeave={e => e.currentTarget.style.color = '#3b82f6'}
                            >
                                <Download size={12} /> Download Dokumen Proposal
                            </a>
                        </div>
                    </div>

                    {/* Exam schedule */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
                            Jadwal Ujian Seminar Proposal
                        </p>

                        {taData?.exam_date ? (
                            <div
                                className="rounded-xl overflow-hidden"
                                style={{ border: '1px solid #f1f5f9' }}
                            >
                                {/* Date & room */}
                                <div className="px-4 py-3 flex flex-col gap-2" style={{ background: '#f8fafc' }}>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#eff6ff' }}>
                                            <Calendar size={13} style={{ color: '#3b82f6' }} />
                                        </div>
                                        <span className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                                            {new Date(taData.exam_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            {' '}·{' '}
                                            {new Date(taData.exam_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#eff6ff' }}>
                                            <MapPin size={13} style={{ color: '#3b82f6' }} />
                                        </div>
                                        <span className="text-sm" style={{ color: '#475569' }}>
                                            {taData.exam_room || 'Tempat belum ditentukan'}
                                        </span>
                                    </div>
                                </div>

                                {/* Examiners */}
                                {taData?.examiners?.length > 0 && (
                                    <div className="px-4 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users size={13} style={{ color: '#64748b' }} />
                                            <p className="text-xs font-semibold" style={{ color: '#64748b' }}>Tim Penguji</p>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {taData.examiners.map((ex, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                                                        {ex.dosen.nama?.charAt(0)}
                                                    </div>
                                                    <span className="text-sm" style={{ color: '#334155' }}>{ex.dosen.nama}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                                        background: ex.peran === 'ketua' ? '#f5f3ff' : '#eff6ff',
                                                        color: ex.peran === 'ketua' ? '#6d28d9' : '#1d4ed8',
                                                        border: `1px solid ${ex.peran === 'ketua' ? '#ddd6fe' : '#bfdbfe'}`,
                                                    }}>
                                                        {ex.peran === 'ketua' ? 'Ketua' : 'Anggota'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                                style={{ background: '#f8fafc', border: '1px dashed #e2e8f0' }}
                            >
                                <Clock size={13} style={{ color: '#94a3b8' }} />
                                <p className="text-sm italic" style={{ color: '#94a3b8' }}>
                                    Jadwal sedang disusun oleh Panitia. Silakan cek berkala.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </TAStepCard>
    );
}