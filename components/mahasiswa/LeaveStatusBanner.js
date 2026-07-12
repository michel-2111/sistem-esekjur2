// components/mahasiswa/LeaveStatusBanner.js
import { CalendarClock } from 'lucide-react';

const getLeaveEndDate = (leaveApp) => {
    if (!leaveApp || !leaveApp.tanggal_pengajuan || !leaveApp.durasi) return null;
    const semesterMatch = leaveApp.durasi.match(/(\d+)\s+Semester/);
    if (!semesterMatch) return null;
    const semesterCount = parseInt(semesterMatch[1], 10);
    const startDate = new Date(leaveApp.tanggal_pengajuan);
    return new Date(startDate.setMonth(startDate.getMonth() + semesterCount * 6));
};

const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function LeaveStatusBanner({ leaveApplication }) {
    if (!leaveApplication || leaveApplication.status !== 'disetujui') return null;

    const leaveEndDate = getLeaveEndDate(leaveApplication);
    const isCutiAktif = leaveEndDate && new Date() < leaveEndDate;

    if (!isCutiAktif) return null;

    const accent = '#0EA5E9'; // sky-500

    return (
        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 rounded-xl p-5 mb-6 flex items-center gap-4 shadow-sm">
            {/* Icon circle */}
            <div
                className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${accent}18` }}
            >
                <CalendarClock className="w-5 h-5" style={{ color: accent }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
                    Status Akademik
                </p>
                <p className="text-sm text-gray-600">
                    Cuti {leaveApplication.durasi}
                    <span className="mx-2 text-gray-300">—</span>
                    Selesai {formatDate(leaveEndDate)}
                </p>
            </div>

            {/* Status badge */}
            <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-sky-400" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                </span>
                Sedang Cuti
            </span>
        </div>
    );
}