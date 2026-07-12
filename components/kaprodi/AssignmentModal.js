// components/kaprodi/AssignmentModal.js
import { useState, useEffect } from 'react';
import { X, Save, BookOpen, ChevronDown, AlertCircle, Loader2, User } from 'lucide-react';

export default function AssignmentModal({ application, onClose, onSaveSuccess }) {
    const [assignments, setAssignments] = useState({});
    const [lecturersByCourse, setLecturersByCourse] = useState({});
    const [loadingLecturers, setLoadingLecturers] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchLecturers = async () => {
            setLoadingLecturers(true);
            const map = {};
            await Promise.all(application.application_courses.map(async ({ course }) => {
                try {
                    const res = await fetch(`/api/master/dosen?courseId=${course.id}`);
                    if (res.ok) map[course.id] = await res.json();
                } catch (e) {
                    console.error(e);
                }
            }));
            setLecturersByCourse(map);
            setLoadingLecturers(false);
        };
        if (application) fetchLecturers();
    }, [application]);

    const handleAssignmentChange = (courseId, dosenId) => {
        setAssignments(prev => ({ ...prev, [courseId]: dosenId }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/kaprodi/penugasan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, assignments }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan penugasan');
            onSaveSuccess(application.id);
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalCourses = application.application_courses.length;
    const assignedCount = Object.values(assignments).filter(Boolean).length;
    const allAssigned = assignedCount === totalCourses;

    return (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Tugaskan Dosen</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <User className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{application.mahasiswa.nama}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Progress pill */}
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${allAssigned ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {assignedCount}/{totalCourses} ditugaskan
                        </span>
                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                        >
                            <X className="h-4 w-4 text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {loadingLecturers ? (
                        <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin mb-2" />
                            <p className="text-sm">Memuat data dosen...</p>
                        </div>
                    ) : (
                        application.application_courses.map(({ course }) => {
                            const lecturers = lecturersByCourse[course.id] || [];
                            const hasNoLecturer = lecturers.length === 0;
                            const isAssigned = !!assignments[course.id];

                            return (
                                <div
                                    key={course.id}
                                    className={`rounded-xl border p-4 transition-colors ${
                                        isAssigned ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'
                                    }`}
                                >
                                    {/* Course label */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`p-1.5 rounded-lg ${isAssigned ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                            <BookOpen className={`h-3.5 w-3.5 ${isAssigned ? 'text-blue-600' : 'text-slate-500'}`} />
                                        </div>
                                        <p className="text-sm font-semibold text-slate-800">{course.nama}</p>
                                    </div>

                                    {hasNoLecturer ? (
                                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
                                            <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-amber-700">Belum ada dosen pengampu. Hubungi Sekjur.</p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <select
                                                value={assignments[course.id] || ''}
                                                onChange={e => handleAssignmentChange(course.id, e.target.value)}
                                                className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2.5 pr-9 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer"
                                            >
                                                <option value="">— Pilih Dosen Pengampu —</option>
                                                {lecturers.map(dosen => (
                                                    <option key={dosen.id} value={dosen.id}>{dosen.nama}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {/* Footer */}
                    <div className="pt-2 flex items-center justify-between gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || loadingLecturers || !allAssigned}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
                        >
                            {isSubmitting
                                ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</>
                                : <><Save className="h-4 w-4" />Simpan Penugasan</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}