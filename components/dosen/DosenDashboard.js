// components/dosen/DosenDashboard.js
import { BookUser, Users, GraduationCap, Calendar, Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

const StatCard = ({ icon: Icon, label, value, accent }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${accent.bg} shrink-0`}>
            <Icon className={`h-5 w-5 ${accent.text}`} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-1 truncate">{label}</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        </div>
    </div>
);

const ClassItem = ({ course }) => (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        <div className="p-2 bg-blue-50 rounded-lg shrink-0 mt-0.5">
            <BookUser className="h-4 w-4 text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{course.nama}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" /> {course.jadwal}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" /> Ruang {course.ruang}
                </span>
            </div>
        </div>
    </div>
);

const ScheduleCard = ({ classes }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-50 rounded-xl">
                <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
                <h2 className="text-base font-bold text-slate-800">Jadwal Mendatang</h2>
                {classes.length > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">{classes.length} sesi dijadwalkan</p>
                )}
            </div>
        </div>

        {classes.length > 0 ? (
            <div className="space-y-3">
                {classes.map(course => (
                    <ClassItem key={course.id} course={course} />
                ))}
            </div>
        ) : (
            <div className="text-center py-8">
                <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Tidak ada jadwal mendatang.</p>
            </div>
        )}
    </div>
);

const Skeleton = ({ className }) => (
    <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />
);

export default function DosenDashboard() {
    const [data, setData]       = useState({ stats: { courseCount: 0, studentCount: 0, sksCount: 0 }, upcomingClasses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dosen/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const STATS = [
        { icon: BookUser,     label: 'Mata Kuliah Diampu', value: data.stats.courseCount,  accent: { bg: 'bg-emerald-50', text: 'text-emerald-600' } },
        { icon: Users,        label: 'Total Mahasiswa',    value: data.stats.studentCount, accent: { bg: 'bg-blue-50',    text: 'text-blue-600' } },
        { icon: GraduationCap,label: 'Total SKS Diampu',   value: data.stats.sksCount,     accent: { bg: 'bg-violet-50',  text: 'text-violet-600' } },
    ];

    if (loading) {
        return (
            <div className="space-y-6 p-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-1">
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Portal Akademik</p>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Dosen</h1>
            </div>

            <ScheduleCard classes={data.upcomingClasses} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATS.map(s => (
                    <StatCard key={s.label} {...s} />
                ))}
            </div>
        </div>
    );
}