import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import { BookOpen, Calendar, Send, CheckCircle, Clock, Trash2, User, ChevronLeft, GraduationCap } from 'lucide-react';

export default function BimbinganMahasiswaPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [supervisors, setSupervisors] = useState([]);
    const [allLogbooks, setAllLogbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({ supervisor_id: '', tanggal: '', topik: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/mahasiswa/ta/bimbingan');
            if (res.ok) {
                const data = await res.json();
                setSupervisors(data.supervisors);
                setAllLogbooks(data.allLogbooks);
                if (data.supervisors.length > 0 && !formData.supervisor_id) {
                    setFormData(prev => ({ ...prev, supervisor_id: data.supervisors[0].id }));
                }
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/mahasiswa/ta/bimbingan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData(prev => ({ ...prev, topik: '', tanggal: '' }));
                fetchData();
            }
        } catch (error) { alert(error.message); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Hapus catatan bimbingan ini?")) return;
        try {
            const res = await fetch(`/api/mahasiswa/ta/bimbingan?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) { alert(error.message); }
    };

    // ── LOGIKA BARU: PROGRESS BERDASARKAN PER DOSEN (MINIMAL 9) ──
    const targetPerSupervisor = 9;
    const totalSupervisors = supervisors.length;
    const totalTarget = totalSupervisors * targetPerSupervisor;

    // Kalkulasi jumlah bimbingan yang sah untuk masing-masing dosen pembimbing
    const verifiedPerSupervisor = supervisors.map(sup => {
        const count = allLogbooks.filter(l => l.supervisor_id === sup.id && l.status === 'terverifikasi').length;
        return {
            ...sup,
            verifiedCount: count,
            isComplete: count >= targetPerSupervisor
        };
    });

    // Kalkulasi untuk progress bar keseluruhan (dibatasi maks 9 per dosen agar tidak ada "kebocoran" progress)
    const cappedTotalVerified = verifiedPerSupervisor.reduce((total, sup) => total + Math.min(sup.verifiedCount, targetPerSupervisor), 0);
    const progressPercentage = totalTarget > 0 ? Math.min((cappedTotalVerified / totalTarget) * 100, 100) : 0;
    
    // Status final dianggap komplit JIKA SEMUA dosen sudah memenuhi target 9 sesi
    const isComplete = totalSupervisors > 0 && verifiedPerSupervisor.every(sup => sup.isComplete);

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center min-h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 font-medium">Memuat data bimbingan...</p>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* ── HEADER ── */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/tugas-akhir')}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 font-medium mb-4 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Kembali ke Tahapan TA
                    </button>
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                Lembar Bimbingan Terpadu
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Total bimbingan membutuhkan minimal <strong>{targetPerSupervisor} sesi terverifikasi</strong> untuk tiap dosen pembimbing.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── PROGRESS CARD ── */}
                <div className={`rounded-2xl p-6 mb-8 border ${isComplete ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex flex-col gap-4">
                        
                        {/* Progress Bar Keseluruhan */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-gray-700">
                                    Progress Bimbingan Keseluruhan
                                </p>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${isComplete ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                                    {cappedTotalVerified} / {totalTarget} Sesi
                                </span>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 shadow-inner border border-gray-200">
                                <div
                                    className={`h-3 rounded-full transition-all duration-700 ${isComplete ? 'bg-green-500' : 'bg-blue-600'}`}
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Rincian Progress per Dosen */}
                        {supervisors.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                {verifiedPerSupervisor.map(sup => (
                                    <div key={sup.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                                        <div className="flex items-center gap-2 min-w-0 pr-3">
                                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                                <User size={12} className="text-gray-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-700 truncate" title={sup.nama}>{sup.nama}</p>
                                                <p className="text-[10px] uppercase font-semibold text-gray-400">{sup.peran}</p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${sup.isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {sup.verifiedCount} / {targetPerSupervisor}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pesan Status */}
                        <div className="mt-1">
                            {isComplete ? (
                                <p className="text-sm text-green-700 font-medium flex items-center gap-1.5 mt-2">
                                    <CheckCircle size={16} />
                                    Syarat minimal bimbingan dari semua dosen telah terpenuhi. Silakan lanjut ke tahap berikutnya.
                                </p>
                            ) : (
                                <p className="text-sm text-blue-700 mt-2 flex items-start gap-1.5">
                                    <Clock size={16} className="shrink-0 mt-0.5" />
                                    <span>Pastikan setiap dosen pembimbing memiliki minimal <strong>{targetPerSupervisor} sesi bimbingan</strong> yang telah terverifikasi.</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* ── FORM SIDEBAR ── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <BookOpen size={18} className="text-blue-600" />
                                </div>
                                <h2 className="text-base font-bold text-gray-800">Tambah Catatan Bimbingan</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                        Pembimbing
                                    </label>
                                    <select
                                        required
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        value={formData.supervisor_id}
                                        onChange={e => setFormData({ ...formData, supervisor_id: e.target.value })}
                                    >
                                        {supervisors.map(s => (
                                            <option key={s.id} value={s.id}>{s.nama} — {s.peran}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                        Tanggal Bimbingan
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        value={formData.tanggal}
                                        onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                        Topik Pembahasan
                                    </label>
                                    <textarea
                                        required
                                        rows="5"
                                        placeholder="Tuliskan topik yang dibahas saat bimbingan..."
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition placeholder:text-gray-400"
                                        value={formData.topik}
                                        onChange={e => setFormData({ ...formData, topik: e.target.value })}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-colors"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            Simpan Catatan
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── LOGBOOK LIST ── */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Riwayat Bimbingan
                            </h3>
                            <span className="text-xs text-gray-400 font-medium">
                                {allLogbooks.length} catatan
                            </span>
                        </div>

                        {allLogbooks.length === 0 ? (
                            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen size={22} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium text-sm">Belum ada riwayat bimbingan</p>
                                <p className="text-gray-400 text-xs mt-1">Tambahkan catatan bimbingan pertama Anda.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {allLogbooks.map((log, index) => (
                                    <div
                                        key={log.id}
                                        className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        {/* Card Header */}
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {/* Nomor urut */}
                                                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 leading-snug">
                                                        {new Date(log.tanggal).toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <User size={11} />
                                                        {log.supervisor.dosen.nama}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status + Delete */}
                                            <div className="flex items-center gap-2 shrink-0">
                                                {log.status === 'terverifikasi' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                                                        <CheckCircle size={11} />
                                                        Terverifikasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                                                        <Clock size={11} />
                                                        Menunggu
                                                    </span>
                                                )}
                                                {log.status === 'menunggu_verifikasi' && (
                                                    <button
                                                        onClick={() => handleDelete(log.id)}
                                                        title="Hapus catatan"
                                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <hr className="border-gray-100 mb-4" />

                                        {/* Topik */}
                                        <div className="mb-1">
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                                Topik Pembahasan
                                            </p>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {log.topik}
                                            </p>
                                        </div>

                                        {/* Arahan Dosen */}
                                        {log.catatan_dosen && (
                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mb-1.5">
                                                    Arahan / Catatan Dosen
                                                </p>
                                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                                    {log.catatan_dosen}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}