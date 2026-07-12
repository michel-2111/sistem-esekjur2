// components/mahasiswa/PengajuanMK.js
import { useState, useEffect } from 'react';
import { Send, BookOpen, CheckCircle2, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

export default function PengajuanMK({ application, onSuccess }) {
    const [coursesBySemester, setCoursesBySemester] = useState({});
    const [selectedSemester, setSelectedSemester] = useState('1');
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [currentSks, setCurrentSks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const maxSks = application.max_sks;
    const sksPercent = Math.min((currentSks / maxSks) * 100, 100);
    const isOverLimit = currentSks > maxSks;
    const isFull = currentSks === maxSks;

    useEffect(() => {
        fetch('/api/master/courses')
            .then(async res => {
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.message || 'Gagal memuat daftar mata kuliah.');
                }
                return res.json();
            })
            .then(data => {
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    setCoursesBySemester(data);
                    const first = Object.keys(data)[0];
                    if (first) setSelectedSemester(first);
                } else {
                    setCoursesBySemester({});
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setCurrentSks(selectedCourses.reduce((sum, c) => sum + c.sks, 0));
    }, [selectedCourses]);

    const handleCourseToggle = (course, isChecked) => {
        if (isChecked) {
            if (currentSks + course.sks > maxSks) {
                alert(`Batas SKS akan terlampaui. Anda hanya dapat mengambil ${maxSks} SKS.`);
                return;
            }
            setSelectedCourses(prev => [...prev, course]);
        } else {
            setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
        }
    };

    const handleSubmit = async () => {
        if (selectedCourses.length === 0) {
            alert('Pilih minimal satu mata kuliah.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/sa/submit-courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: application.id,
                    selectedCourseIds: selectedCourses.map(c => c.id),
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal mengirim pengajuan.');
            }
            onSuccess(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Memuat daftar mata kuliah...</p>
            </div>
        );
    }

    const coursesInSemester = coursesBySemester[selectedSemester] || [];
    const semesterKeys = Object.keys(coursesBySemester);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header banner */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-blue-200" />
                    <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Pembayaran Terkonfirmasi</p>
                </div>
                <h2 className="text-lg font-bold text-white">Pengajuan Mata Kuliah</h2>
                <p className="text-sm text-blue-100 mt-0.5">
                    Pilih mata kuliah yang ingin Anda ambil — maksimal <span className="font-bold text-white">{maxSks} SKS</span>.
                </p>
            </div>

            <div className="p-6 space-y-5">
                {/* SKS Tracker */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total SKS Dipilih</p>
                        <span className={`text-sm font-bold tabular-nums ${isOverLimit ? 'text-red-600' : isFull ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {currentSks} <span className="font-normal text-slate-400">/ {maxSks} SKS</span>
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                isOverLimit ? 'bg-red-500' : isFull ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${sksPercent}%` }}
                        />
                    </div>
                    {isFull && !isOverLimit && (
                        <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Kuota SKS penuh
                        </p>
                    )}
                    {isOverLimit && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Melebihi batas SKS
                        </p>
                    )}
                </div>

                {/* Semester Selector */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Semester
                    </label>
                    <div className="relative">
                        <select
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(e.target.value)}
                            className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                        >
                            {semesterKeys.length > 0
                                ? semesterKeys.map(sem => (
                                    <option key={sem} value={sem}>Semester {sem}</option>
                                ))
                                : <option>Tidak ada data</option>
                            }
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Course List */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Mata Kuliah
                        </label>
                        <span className="text-xs text-slate-400">
                            {selectedCourses.filter(c => coursesInSemester.some(x => x.id === c.id)).length} dipilih
                        </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 -mr-1">
                        {coursesInSemester.length > 0 ? (
                            coursesInSemester.map(course => {
                                const isSelected = selectedCourses.some(c => c.id === course.id);
                                const wouldExceed = !isSelected && currentSks + course.sks > maxSks;

                                return (
                                    <label
                                        key={course.id}
                                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-blue-300 bg-blue-50 shadow-sm'
                                                : wouldExceed
                                                ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={wouldExceed}
                                            onChange={e => handleCourseToggle(course, e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>
                                                {course.nama}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-lg ${
                                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {course.sks} SKS
                                        </span>
                                    </label>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <BookOpen className="h-7 w-7 text-slate-300 mb-2" />
                                <p className="text-sm">Tidak ada mata kuliah di semester ini.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected summary chips */}
                {selectedCourses.length > 0 && (
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Dipilih</p>
                        <div className="flex flex-wrap gap-1.5">
                            {selectedCourses.map(c => (
                                <span
                                    key={c.id}
                                    className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 font-medium px-2.5 py-1 rounded-full"
                                >
                                    {c.nama}
                                    <button
                                        onClick={() => handleCourseToggle(c, false)}
                                        className="ml-0.5 text-blue-400 hover:text-blue-700"
                                    >×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl p-3.5">
                        <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || selectedCourses.length === 0 || isOverLimit}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm"
                >
                    {isSubmitting
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengirim...</>
                        : <><Send className="h-4 w-4" /> Kirim Pengajuan</>
                    }
                </button>
            </div>
        </div>
    );
}