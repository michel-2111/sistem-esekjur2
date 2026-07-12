// components/dosen/GradeInputRow.js
import { useState } from 'react';
import { Save, Pencil, CheckCircle, Lock } from 'lucide-react';

const GRADE_CONFIG = {
    A: { label: 'A', color: '#059669', bg: '#d1fae5', border: '#6ee7b7', desc: 'Sangat Baik' },
    B: { label: 'B', color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', desc: 'Baik' },
    C: { label: 'C', color: '#d97706', bg: '#fef3c7', border: '#fcd34d', desc: 'Cukup' },
    D: { label: 'D', color: '#ea580c', bg: '#ffedd5', border: '#fdba74', desc: 'Kurang' },
    E: { label: 'E', color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', desc: 'Tidak Lulus' },
};

export default function GradeInputRow({ student, courseId, isKelasSelesai, onSave }) {
    const [grade, setGrade] = useState(student.nilai || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(!!student.nilai);
    const [justSaved, setJustSaved] = useState(false);

    const handleSave = async () => {
        if (!grade) return;
        setIsSubmitting(true);
        try {
            await onSave({
                applicationId: student.application_id,
                courseId,
                nilai: grade,
            });
            setIsSaved(true);
            setJustSaved(true);
            setTimeout(() => setJustSaved(false), 2000);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = () => {
        setIsSaved(false);
        setJustSaved(false);
    };

    const gradeInfo = grade ? GRADE_CONFIG[grade] : null;

    return (
        <div
            className="flex items-center justify-between px-4 py-3 transition-colors duration-100"
            style={{ borderBottom: '1px solid #f1f5f9' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fafafe'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            {/* Student name + avatar */}
            <div className="flex items-center gap-3">
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: '#eff6ff', color: '#3b82f6' }}
                >
                    {student.nama?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: '#334155' }}>
                    {student.nama}
                </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2.5">
                {!isKelasSelesai ? (
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                        <Lock size={11} style={{ color: '#94a3b8' }} />
                        <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                            Kelas belum selesai
                        </span>
                    </div>
                ) : isSaved ? (
                    <>
                        {/* Saved grade badge */}
                        <div
                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all duration-300"
                            style={{
                                background: gradeInfo?.bg || '#f1f5f9',
                                border: `1px solid ${gradeInfo?.border || '#e2e8f0'}`,
                            }}
                        >
                            {justSaved ? (
                                <CheckCircle size={12} style={{ color: gradeInfo?.color || '#64748b' }} />
                            ) : null}
                            <span
                                className="text-xs font-bold"
                                style={{ color: gradeInfo?.color || '#334155' }}
                            >
                                {grade}
                            </span>
                            {gradeInfo && (
                                <span className="text-xs" style={{ color: gradeInfo.color + 'aa' }}>
                                    — {gradeInfo.desc}
                                </span>
                            )}
                        </div>

                        {/* Edit button */}
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                            style={{
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                        >
                            <Pencil size={11} />
                            Edit
                        </button>
                    </>
                ) : (
                    <>
                        {/* Grade selector */}
                        <div className="flex items-center gap-1.5">
                            {Object.entries(GRADE_CONFIG).map(([key, cfg]) => (
                                <button
                                    key={key}
                                    onClick={() => setGrade(key)}
                                    className="w-8 h-8 rounded-lg text-xs font-bold transition-all duration-150"
                                    style={
                                        grade === key
                                            ? {
                                                background: cfg.bg,
                                                color: cfg.color,
                                                border: `1.5px solid ${cfg.border}`,
                                                boxShadow: `0 0 0 3px ${cfg.bg}`,
                                                transform: 'scale(1.1)',
                                            }
                                            : {
                                                background: '#f8fafc',
                                                color: '#94a3b8',
                                                border: '1px solid #e2e8f0',
                                            }
                                    }
                                    onMouseEnter={e => {
                                        if (grade !== key) {
                                            e.currentTarget.style.background = cfg.bg;
                                            e.currentTarget.style.color = cfg.color;
                                            e.currentTarget.style.borderColor = cfg.border;
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (grade !== key) {
                                            e.currentTarget.style.background = '#f8fafc';
                                            e.currentTarget.style.color = '#94a3b8';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }
                                    }}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting || !grade}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                background: grade ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0',
                                color: grade ? '#fff' : '#94a3b8',
                                boxShadow: grade ? '0 2px 6px rgba(59,130,246,0.3)' : 'none',
                            }}
                            onMouseEnter={e => { if (grade && !isSubmitting) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <Save size={12} />
                            )}
                            {isSubmitting ? 'Simpan...' : 'Simpan'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}