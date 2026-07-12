import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, Circle, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_CONFIG = {
    locked: {
        borderColor: '#e2e8f0',
        accentColor: '#cbd5e1',
        headerBg: '#f8fafc',
        icon: <Lock size={16} style={{ color: '#cbd5e1' }} />,
        badge: null,
        titleColor: '#94a3b8',
    },
    active: {
        borderColor: '#bfdbfe',
        accentColor: '#3b82f6',
        headerBg: '#ffffff',
        icon: <Circle size={16} style={{ color: '#3b82f6' }} />,
        badge: { label: 'Perlu Tindakan', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
        titleColor: '#0f172a',
    },
    pending: {
        borderColor: '#fde68a',
        accentColor: '#f59e0b',
        headerBg: '#ffffff',
        icon: <Clock size={16} style={{ color: '#f59e0b' }} />,
        badge: { label: 'Menunggu Verifikasi', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
        titleColor: '#0f172a',
    },
    valid: {
        borderColor: '#bbf7d0',
        accentColor: '#10b981',
        headerBg: '#f0fdf4',
        icon: <CheckCircle size={16} style={{ color: '#10b981' }} />,
        badge: { label: 'Selesai', bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' },
        titleColor: '#0f172a',
    },
    rejected: {
        borderColor: '#fecaca',
        accentColor: '#ef4444',
        headerBg: '#ffffff',
        icon: <XCircle size={16} style={{ color: '#ef4444' }} />,
        badge: { label: 'Ditolak', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
        titleColor: '#0f172a',
    },
};

export default function TAStepCard({ title, subtitle, status, children }) {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        setIsExpanded(['active', 'pending', 'rejected'].includes(status));
    }, [status]);

    const s = STATUS_CONFIG[status] || STATUS_CONFIG.active;
    const isLocked = status === 'locked';

    return (
        <div
            className="relative rounded-2xl overflow-hidden transition-all duration-300"
            style={{
                border: `1px solid ${s.borderColor}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            }}
        >
            {/* Left accent bar */}
            <div
                className="absolute left-0 top-0 w-1 h-full rounded-l-2xl"
                style={{ background: s.accentColor }}
            />

            {/* Header */}
            <div
                className="flex items-center justify-between px-6 py-4 transition-all duration-150"
                style={{
                    background: s.headerBg,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    paddingLeft: '1.75rem', // compensate for accent bar
                }}
                onClick={() => !isLocked && setIsExpanded(p => !p)}
                onMouseEnter={e => { if (!isLocked) e.currentTarget.style.filter = 'brightness(0.97)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
            >
                <div className="flex items-center gap-3 min-w-0">
                    {/* Icon */}
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.accentColor + '18' }}
                    >
                        {s.icon}
                    </div>

                    {/* Title + badge */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-sm font-bold" style={{ color: s.titleColor }}>{title}</h2>
                            {s.badge && (
                                <span
                                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                                    style={{
                                        background: s.badge.bg,
                                        color: s.badge.color,
                                        border: `1px solid ${s.badge.border}`,
                                    }}
                                >
                                    {s.badge.label}
                                </span>
                            )}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{subtitle}</p>
                    </div>
                </div>

                {!isLocked && (
                    <div
                        className="ml-4 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all"
                        style={{ background: '#f1f5f9', color: '#64748b' }}
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                )}
            </div>

            {/* Body */}
            {isExpanded && !isLocked && (
                <div
                    className="px-7 pb-6 pt-5 bg-white"
                    style={{ borderTop: `1px solid ${s.borderColor}` }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}