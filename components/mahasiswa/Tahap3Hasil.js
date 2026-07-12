import BeritaAcaraQR from '../BeritaAcaraQR';
import TAStepCard from './TAStepCard';
import { Lock, Clock, MessageSquare } from 'lucide-react';

function ExaminerCard({ ex, idx }) {
    const nilaiDosen = ex.grades?.reduce((total, g) => total + (g.score * g.component.bobot) / 100, 0) ?? 0;
    const peranLabel = ex.peran === 'ketua' ? 'Ketua Penguji' : 'Anggota Penguji';
    const isKetua = ex.peran === 'ketua';

    return (
        <div
            className="rounded-xl overflow-hidden flex flex-col"
            style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
            {/* Examiner header */}
            <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
            >
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: isKetua ? '#f5f3ff' : '#eff6ff', color: isKetua ? '#6d28d9' : '#3b82f6' }}
                >
                    {ex.dosen.nama?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1e293b' }}>{ex.dosen.nama}</p>
                    <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                            background: isKetua ? '#f5f3ff' : '#eff6ff',
                            color: isKetua ? '#6d28d9' : '#1d4ed8',
                            border: `1px solid ${isKetua ? '#ddd6fe' : '#bfdbfe'}`,
                        }}
                    >
                        {peranLabel}
                    </span>
                </div>
                {/* Score */}
                <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Nilai</p>
                    <p className="text-xl font-black tabular-nums" style={{ color: '#3b82f6' }}>
                        {nilaiDosen.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* QR */}
            <div className="flex justify-center py-4 px-4 bg-white">
                <BeritaAcaraQR
                    token={ex.berita_acara_token}
                    dosenName={ex.dosen.nama}
                    peran={peranLabel}
                />
            </div>

            {/* Catatan Revisi */}
            <div
                className="px-4 py-3"
                style={{ borderTop: '1px solid #f8fafc', background: '#fafafa' }}
            >
                <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare size={12} style={{ color: '#94a3b8' }} />
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>
                        Catatan Revisi
                    </p>
                </div>
                {ex.catatan_revisi ? (
                    <p className="text-sm italic leading-relaxed" style={{ color: '#475569' }}>
                        &quot;{ex.catatan_revisi}&quot;
                    </p>
                ) : (
                    <p className="text-xs italic" style={{ color: '#cbd5e1' }}>Tidak ada catatan revisi.</p>
                )}
            </div>
        </div>
    );
}

export default function Tahap3Hasil({ status, taData, hitungRataRata }) {
    return (
        <TAStepCard
            title="Tahap 3: Hasil Ujian Seminar Proposal"
            subtitle="Nilai akhir, catatan revisi, dan Berita Acara Ujian"
            status={status}
        >
            {status === 'locked' ? (
                <div
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                    <Lock size={14} style={{ color: '#94a3b8' }} />
                    <p className="text-sm" style={{ color: '#94a3b8' }}>
                        Selesaikan Tahap 2 dan tunggu jadwal ujian diterbitkan.
                    </p>
                </div>

            ) : status === 'pending' ? (
                <div
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                    style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                >
                    <Clock size={15} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                    <div>
                        <p className="text-sm font-semibold" style={{ color: '#92400e' }}>
                            Ujian Berlangsung / Menunggu Penilaian
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#b45309' }}>
                            Harap tunggu hingga seluruh Tim Penguji selesai memberikan nilai dan catatan revisi.
                        </p>
                    </div>
                </div>

            ) : (
                <div className="space-y-6">
                    {/* Result summary */}
                    <div
                        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-5 py-4 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #bbf7d0' }}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-2xl shrink-0">🎉</span>
                            <div>
                                <p className="text-base font-bold" style={{ color: '#065f46' }}>
                                    Ujian Proposal Selesai
                                </p>
                                <p className="text-xs mt-0.5 italic" style={{ color: '#047857' }}>
                                    {taData?.proposal_title}
                                </p>
                            </div>
                        </div>

                        {/* Score widget */}
                        <div
                            className="shrink-0 flex flex-col items-center justify-center px-8 py-3 rounded-xl bg-white"
                            style={{ border: '1px solid #bbf7d0', boxShadow: '0 1px 4px rgba(16,185,129,0.1)' }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#94a3b8' }}>
                                Nilai Akhir
                            </p>
                            <p className="text-4xl font-black tabular-nums" style={{ color: '#3b82f6' }}>
                                {hitungRataRata()}
                            </p>
                        </div>
                    </div>

                    {/* Examiner cards */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>
                            Detail Penilaian &amp; Catatan Revisi
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {taData?.examiners.map((ex, idx) => (
                                <ExaminerCard key={idx} ex={ex} idx={idx} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </TAStepCard>
    );
}