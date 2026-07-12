// components/sekjur/VerificationModal.js
import { useState } from 'react';
import Image from 'next/image';
import { X, CheckCircle, XCircle, ZoomIn, User, Hash } from 'lucide-react';

export default function VerificationModal({ application, onClose, onUpdate }) {
    const [maxSks, setMaxSks] = useState('');
    const [alasanDitolak, setAlasanDitolak] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imgZoomed, setImgZoomed] = useState(false);

    if (!application) return null;

    const handleSubmit = async (action) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/sekjur/verifikasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, action, maxSks, alasanDitolak }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal memproses permintaan.');
            }
            onUpdate(application.id);
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Verifikasi Pembayaran</h2>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                    <User className="h-3 w-3" />{application.mahasiswa.nama}
                                </span>
                                <span className="text-slate-300">·</span>
                                <span className="flex items-center gap-1 text-xs font-mono text-slate-500">
                                    <Hash className="h-3 w-3" />{application.mahasiswa.identifier}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-5">
                        {/* Bukti Pembayaran */}
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Bukti Pembayaran</p>
                            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-zoom-in" onClick={() => setImgZoomed(true)}>
                                <Image
                                    src={application.bukti_pembayaran_url}
                                    alt="Bukti Pembayaran"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto object-contain max-h-72 transition-transform group-hover:scale-[1.01]"
                                />
                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-700 shadow-sm">
                                        <ZoomIn className="h-3.5 w-3.5" /> Perbesar
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-100" />
                            <p className="text-xs text-slate-400 font-medium">Pilih Tindakan</p>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Approve */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                                <p className="text-sm font-semibold text-emerald-800">Setujui Pembayaran</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    Jumlah SKS Maksimal yang Diizinkan
                                </label>
                                <input
                                    type="number"
                                    value={maxSks}
                                    onChange={e => setMaxSks(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                                    placeholder="Contoh: 9"
                                    min="1"
                                />
                            </div>
                            <button
                                onClick={() => handleSubmit('approve')}
                                disabled={isSubmitting || !maxSks}
                                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                            >
                                <CheckCircle className="h-4 w-4" />
                                {isSubmitting ? 'Memproses...' : 'Setujui Pembayaran'}
                            </button>
                        </div>

                        {/* Reject */}
                        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <p className="text-sm font-semibold text-red-800">Tolak Pembayaran</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                                    Alasan Penolakan
                                </label>
                                <textarea
                                    value={alasanDitolak}
                                    onChange={e => setAlasanDitolak(e.target.value)}
                                    placeholder="Tuliskan alasan penolakan agar mahasiswa dapat memperbaiki bukti pembayaran..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition resize-none"
                                />
                            </div>
                            <button
                                onClick={() => handleSubmit('reject')}
                                disabled={isSubmitting || !alasanDitolak.trim()}
                                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors"
                            >
                                <XCircle className="h-4 w-4" />
                                {isSubmitting ? 'Memproses...' : 'Tolak Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Zoom Overlay */}
            {imgZoomed && (
                <div
                    className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-6 cursor-zoom-out"
                    onClick={() => setImgZoomed(false)}
                >
                    <button className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition">
                        <X className="h-5 w-5 text-white" />
                    </button>
                    <Image
                        src={application.bukti_pembayaran_url}
                        alt="Bukti Pembayaran"
                        width={1200}
                        height={900}
                        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}
        </>
    );
}