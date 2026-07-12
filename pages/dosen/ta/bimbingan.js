import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useAppContext } from '../../../context/AppContext';
import { useRouter } from 'next/router';
import { BookOpen, Calendar, CheckCircle, Clock, CheckSquare, Award, AlertTriangle, Users, GraduationCap, ChevronRight } from 'lucide-react';

export default function BimbinganDosenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [notes, setNotes] = useState({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dosen/ta/bimbingan');
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
                if (selectedStudent) {
                    const updated = data.find(s => s.supervisor_id === selectedStudent.supervisor_id);
                    setSelectedStudent(updated || null);
                }
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user?.selectedRole !== 'dosen') { router.push('/dashboard'); return; }
        fetchData();
    }, [isAuthenticated, user, router]);

    const handleVerifyLogbook = async (logbookId) => {
        if (!confirm("Verifikasi catatan ini? Data yang sudah diverifikasi tidak dapat diubah oleh mahasiswa.")) return;
        setIsProcessing(true);
        try {
            const res = await fetch('/api/dosen/ta/bimbingan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'verify_logbook',
                    logbook_id: logbookId,
                    catatan_dosen: notes[logbookId] || ''
                })
            });
            if (!res.ok) throw new Error("Gagal memverifikasi");
            fetchData();
        } catch (error) { alert(error.message); }
        finally { setIsProcessing(false); }
    };

    const handleApproveExam = async (isReady) => {
        if (isReady && selectedStudent.total_kumulatif < 8) {
            if (!confirm(`PERINGATAN: Mahasiswa ini baru melakukan bimbingan sebanyak ${selectedStudent.total_kumulatif} kali (syarat minimal 8).\n\nApakah Anda yakin ingin melakukan bypass dan menyetujui mahasiswa ini untuk Sidang Akhir?`)) return;
        } else if (isReady) {
            if (!confirm("Setujui mahasiswa ini untuk mendaftar Sidang Akhir?")) return;
        } else {
            if (!confirm("Batalkan persetujuan Sidang Akhir?")) return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/dosen/ta/bimbingan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'approve_exam',
                    supervisor_id: selectedStudent.supervisor_id,
                    is_ready: isReady
                })
            });
            if (!res.ok) throw new Error("Gagal mengupdate persetujuan");
            fetchData();
        } catch (error) { alert(error.message); }
        finally { setIsProcessing(false); }
    };

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center min-h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                Review Lembar Bimbingan
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Verifikasi catatan bimbingan dan kelola persetujuan sidang akhir mahasiswa.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* ── PANEL KIRI: Daftar Mahasiswa ── */}
                    <div className="w-full lg:w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
                        {/* Panel header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-blue-600" />
                                <h2 className="font-semibold text-gray-800 text-sm">Mahasiswa Bimbingan</h2>
                            </div>
                            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                                {students.length} orang
                            </span>
                        </div>

                        <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                            {students.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Users size={28} className="text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Tidak ada mahasiswa bimbingan.</p>
                                </div>
                            ) : students.map(student => {
                                const pendingCount = student.logbooks.filter(l => l.status === 'menunggu_verifikasi').length;
                                const isSelected = selectedStudent?.supervisor_id === student.supervisor_id;

                                return (
                                    <div
                                        key={student.supervisor_id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`px-5 py-4 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'bg-blue-50 border-l-[3px] border-blue-500'
                                                : 'hover:bg-gray-50 border-l-[3px] border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                                                    {student.mahasiswa.nama}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {student.mahasiswa.identifier}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {student.peran}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                {pendingCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {pendingCount} Baru
                                                    </span>
                                                )}
                                                {student.is_ready_for_exam && (
                                                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <CheckCircle size={9} />
                                                        Siap Sidang
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── PANEL KANAN: Detail Logbook ── */}
                    <div className="flex-1 min-w-0">
                        {!selectedStudent ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen size={28} className="text-gray-400" />
                                </div>
                                <p className="text-gray-700 font-medium text-sm">Pilih mahasiswa untuk melihat logbook</p>
                                <p className="text-gray-400 text-xs mt-1.5">Klik nama mahasiswa di panel sebelah kiri.</p>
                            </div>
                        ) : (
                            <div className="space-y-5">

                                {/* ── INFO MAHASISWA & PROGRESS ── */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {selectedStudent.mahasiswa.nama}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                {selectedStudent.mahasiswa.identifier}
                                            </p>
                                        </div>

                                        {/* Progress badge */}
                                        <div className={`flex-shrink-0 px-5 py-3 rounded-xl border text-center ${
                                            selectedStudent.total_kumulatif >= 8
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-blue-50 border-blue-200'
                                        }`}>
                                            <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${
                                                selectedStudent.total_kumulatif >= 8 ? 'text-green-600' : 'text-blue-600'
                                            }`}>
                                                Progress Kumulatif
                                            </p>
                                            <p className={`text-3xl font-black leading-none ${
                                                selectedStudent.total_kumulatif >= 8 ? 'text-green-700' : 'text-blue-800'
                                            }`}>
                                                {selectedStudent.total_kumulatif}
                                                <span className="text-sm font-medium text-gray-400 ml-1">/ 8</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── FINAL CLEARANCE ── */}
                                    <div className="pt-5 border-t border-gray-100">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                                                    <Award size={16} className="text-yellow-500" />
                                                    Final Clearance — Persetujuan Sidang Akhir
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                                                    Setujui jika mahasiswa dirasa sudah siap untuk mengikuti Sidang Akhir. Persetujuan dapat dibatalkan.
                                                </p>
                                            </div>

                                            {selectedStudent.is_ready_for_exam ? (
                                                <button
                                                    onClick={() => handleApproveExam(false)}
                                                    disabled={isProcessing}
                                                    className="flex-shrink-0 px-4 py-2.5 bg-green-100 text-green-700 font-semibold rounded-xl hover:bg-green-200 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm border border-green-200"
                                                >
                                                    <CheckCircle size={15} />
                                                    Disetujui — Batalkan
                                                </button>
                                            ) : selectedStudent.total_kumulatif < 8 ? (
                                                <button
                                                    onClick={() => handleApproveExam(true)}
                                                    disabled={isProcessing}
                                                    className="flex-shrink-0 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-sm"
                                                >
                                                    <AlertTriangle size={15} />
                                                    Bypass Syarat &amp; Setujui
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleApproveExam(true)}
                                                    disabled={isProcessing}
                                                    className="flex-shrink-0 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2 text-sm shadow-sm"
                                                >
                                                    <CheckSquare size={15} />
                                                    Setujui Sidang Akhir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* ── DAFTAR LOGBOOK ── */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                            Catatan Bimbingan
                                        </h3>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {selectedStudent.logbooks.length} catatan
                                        </span>
                                    </div>

                                    {selectedStudent.logbooks.length === 0 ? (
                                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-14 text-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <BookOpen size={20} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500 font-medium">Mahasiswa belum mengirimkan catatan bimbingan.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedStudent.logbooks.map((log, index) => (
                                                <div key={log.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                                                    {/* Card Header */}
                                                    <div className="flex items-start justify-between gap-3 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {new Date(log.tanggal).toLocaleDateString('id-ID', {
                                                                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {log.status === 'terverifikasi' ? (
                                                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                                                                <CheckCircle size={11} />
                                                                Terverifikasi
                                                            </span>
                                                        ) : (
                                                            <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
                                                                <Clock size={11} />
                                                                Menunggu Verifikasi
                                                            </span>
                                                        )}
                                                    </div>

                                                    <hr className="border-gray-100 mb-4" />

                                                    {/* Topik */}
                                                    <div className="mb-1">
                                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                                            Topik yang Diajukan Mahasiswa
                                                        </p>
                                                        <p className="text-sm text-gray-700 leading-relaxed">
                                                            {log.topik}
                                                        </p>
                                                    </div>

                                                    {/* Jika sudah terverifikasi — tampilkan catatan dosen */}
                                                    {log.status === 'terverifikasi' ? (
                                                        log.catatan_dosen && (
                                                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                                                <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mb-1.5">
                                                                    Catatan / Arahan Anda
                                                                </p>
                                                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                                                    {log.catatan_dosen}
                                                                </p>
                                                            </div>
                                                        )
                                                    ) : (
                                                        /* Form verifikasi */
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                                                Catatan / Arahan untuk Mahasiswa
                                                                <span className="normal-case font-normal text-gray-400 ml-1">(opsional)</span>
                                                            </label>
                                                            <textarea
                                                                rows="3"
                                                                placeholder="Berikan revisi atau arahan untuk bimbingan berikutnya..."
                                                                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition placeholder:text-gray-400 mb-3"
                                                                value={notes[log.id] || ''}
                                                                onChange={(e) => setNotes({ ...notes, [log.id]: e.target.value })}
                                                            />
                                                            <div className="flex justify-end">
                                                                <button
                                                                    onClick={() => handleVerifyLogbook(log.id)}
                                                                    disabled={isProcessing}
                                                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
                                                                >
                                                                    {isProcessing ? (
                                                                        <>
                                                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                            Memproses...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckSquare size={15} />
                                                                            Verifikasi &amp; Kunci Data
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}