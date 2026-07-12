// components/shared/PeriodBanner.js
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const getPeriodStatus = (period) => {
    const now = new Date();
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start) return {
        text: 'Akan Datang',
        icon: AlertTriangle,
        accent: '#F59E0B',
        bg: 'from-amber-50 to-yellow-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-800 border border-amber-200',
        dot: 'bg-amber-400',
    };
    if (now > end) return {
        text: 'Telah Berakhir',
        icon: Clock,
        accent: '#EF4444',
        bg: 'from-red-50 to-rose-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800 border border-red-200',
        dot: 'bg-red-500',
    };
    return {
        text: 'Sedang Berlangsung',
        icon: CheckCircle,
        accent: '#10B981',
        bg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        dot: 'bg-emerald-500',
        pulse: true,
    };
};

export default function PeriodBanner({ period }) {
    if (!period) return null;
    const status = getPeriodStatus(period);
    const Icon = status.icon;

    return (
        <div className={`bg-linear-to-r ${status.bg} border ${status.border} rounded-xl p-5 mb-6 flex items-center gap-4 shadow-sm`}>
            {/* Icon circle */}
            <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${status.accent}18` }}
            >
                <Icon className="w-5 h-5" style={{ color: status.accent }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                    Periode Akademik
                </p>
                <p className="text-sm text-gray-600">
                    {formatDate(period.start_date)}
                    <span className="mx-2 text-gray-300">—</span>
                    {formatDate(period.end_date)}
                </p>
            </div>

            {/* Status badge */}
            <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.badge}`}>
                {status.pulse ? (
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot}`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
                    </span>
                ) : (
                    <span className={`inline-flex rounded-full h-2 w-2 ${status.dot}`} />
                )}
                {status.text}
            </span>
        </div>
    );
}