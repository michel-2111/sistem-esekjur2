// components/mahasiswa/NilaiComponent.js
import { Award, BookOpen, CheckCircle, Clock } from 'lucide-react';

const STATUS_MAP = {
    telah_dinilai: { label: 'Telah Dinilai', color: '#059669', bg: '#d1fae5', border: '#6ee7b7', icon: CheckCircle },
};

const GRADE_CONFIG = {
    A: { color: '#059669', bg: '#d1fae5', border: '#6ee7b7', desc: 'Sangat Baik', points: 4.0 },
    B: { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', desc: 'Baik', points: 3.0 },
    C: { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', desc: 'Cukup', points: 2.0 },
    D: { color: '#ea580c', bg: '#ffedd5', border: '#fdba74', desc: 'Kurang', points: 1.0 },
    E: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', desc: 'Tidak Lulus', points: 0.0 },
};

export default function NilaiComponent({ application }) {
    const gradedCourses = application.application_courses.map(ac => ({
        nama: ac.course.nama,
        sks: ac.course.sks || null,
        nilai: ac.nilai ? ac.nilai.trim() : null,
    }));

    const statusInfo = STATUS_MAP[application.status] || {
        label: application.status,
        color: '#64748b',
        bg: '#f1f5f9',
        border: '#e2e8f0',
        icon: Clock,
    };
    const StatusIcon = statusInfo.icon;

    const gradedCount = gradedCourses.filter(c => c.nilai && GRADE_CONFIG[c.nilai]).length;
    const totalCount = gradedCourses.length;

    // Calculate GPA if SKS available
    const hasSkS = gradedCourses.some(c => c.sks);
    let gpa = null;
    if (hasSkS) {
        const totalPoints = gradedCourses.reduce((acc, c) => {
            const pts = GRADE_CONFIG[c.nilai]?.points ?? null;
            return pts !== null && c.sks ? acc + pts * c.sks : acc;
        }, 0);
        const totalSks = gradedCourses.reduce((acc, c) => {
            return c.sks && GRADE_CONFIG[c.nilai] ? acc + c.sks : acc;
        }, 0);
        if (totalSks > 0) gpa = (totalPoints / totalSks).toFixed(2);
    }

    return (
        <div className="w-full">
            <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-1">
                    <div
                        className="p-2 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
                    >
                        <Award size={18} style={{ color: '#fff' }} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                        Semester Antara
                    </span>
                </div>
                <h1
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif" }}
                >
                    Nilai Akhir
                </h1>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>
                    Rekap penilaian akhir mata kuliah yang telah Anda tempuh.
                </p>
            </div>

            {/* Summary cards */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
                {/* Status badge */}
                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: statusInfo.bg, border: `1px solid ${statusInfo.border}` }}
                >
                    <StatusIcon size={13} style={{ color: statusInfo.color }} />
                    <span className="text-xs font-semibold" style={{ color: statusInfo.color }}>
                        {statusInfo.label}
                    </span>
                </div>

                <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                >
                    <BookOpen size={13} style={{ color: '#6366f1' }} />
                    <span className="text-xs font-semibold" style={{ color: '#4338ca' }}>
                        {gradedCount}/{totalCount} Mata Kuliah Dinilai
                    </span>
                </div>

            </div>

            {/* Table card */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
                }}
            >
                {/* Color bar */}
                <div
                    className="h-1 w-full"
                    style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }}
                />

                {/* Table header */}
                <div
                    className="grid px-5 py-3"
                    style={{
                        gridTemplateColumns: hasSkS ? '1fr 80px 120px' : '1fr 120px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                    }}
                >
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#64748b' }}>
                        Mata Kuliah
                    </span>
                    {hasSkS && (
                        <span className="text-xs font-semibold uppercase tracking-wide text-center" style={{ color: '#64748b' }}>
                            SKS
                        </span>
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wide text-center" style={{ color: '#64748b' }}>
                        Nilai
                    </span>
                </div>

                {/* Rows */}
                <div>
                    {gradedCourses.map((course, index) => {
                        const gradeInfo = course.nilai ? GRADE_CONFIG[course.nilai] : null;
                        const isLast = index === gradedCourses.length - 1;

                        return (
                            <div
                                key={index}
                                className="grid items-center px-5 py-3.5 transition-colors duration-100"
                                style={{
                                    gridTemplateColumns: hasSkS ? '1fr 80px 120px' : '1fr 120px',
                                    borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#fafafe'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* Course name */}
                                <div className="flex items-center gap-2.5">
                                    <div
                                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: '#eff6ff' }}
                                    >
                                        <BookOpen size={11} style={{ color: '#3b82f6' }} />
                                    </div>
                                    <span className="text-sm font-medium" style={{ color: '#334155' }}>
                                        {course.nama}
                                    </span>
                                </div>

                                {/* SKS */}
                                {hasSkS && (
                                    <div className="text-center">
                                        <span className="text-sm" style={{ color: '#94a3b8' }}>
                                            {course.sks ?? '—'}
                                        </span>
                                    </div>
                                )}

                                {/* Grade */}
                                <div className="flex justify-center">
                                    {gradeInfo ? (
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                                            style={{
                                                background: gradeInfo.bg,
                                                border: `1px solid ${gradeInfo.border}`,
                                            }}
                                        >
                                            <span className="text-sm font-extrabold" style={{ color: gradeInfo.color }}>
                                                {course.nilai}
                                            </span>
                                            <span className="text-xs" style={{ color: gradeInfo.color + 'bb' }}>
                                                {gradeInfo.desc}
                                            </span>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                                            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                        >
                                            <Clock size={11} style={{ color: '#94a3b8' }} />
                                            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                                                Belum Dinilai
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer legend */}
                <div
                    className="px-5 py-3 flex items-center gap-3 flex-wrap"
                    style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa' }}
                >
                    <span className="text-xs" style={{ color: '#94a3b8' }}>Keterangan:</span>
                    {Object.entries(GRADE_CONFIG).map(([grade, cfg]) => (
                        <div key={grade} className="flex items-center gap-1">
                            <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded"
                                style={{ background: cfg.bg, color: cfg.color }}
                            >
                                {grade}
                            </span>
                            <span className="text-xs" style={{ color: '#94a3b8' }}>{cfg.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}