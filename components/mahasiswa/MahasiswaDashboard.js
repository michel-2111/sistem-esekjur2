// components/mahasiswa/MahasiswaDashboard.js
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import PeriodBanner from '../shared/PeriodBanner';
import LeaveStatusBanner from './LeaveStatusBanner';
import { BookOpen, FileText, AlertCircle, User, GraduationCap } from 'lucide-react';

const STATUS_SA = {
    menunggu_verifikasi_pembayaran: { text: 'Menunggu Verifikasi', style: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200' },
    menunggu_pengajuan_mk:          { text: 'Pengajuan MK',        style: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    menunggu_penugasan_dosen:       { text: 'Menunggu Dosen',      style: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
    aktif:                          { text: 'Aktif',               style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    telah_dinilai:                  { text: 'Telah Dinilai',       style: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' },
    selesai:                        { text: 'Selesai',             style: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' },
    pembayaran_ditolak:             { text: 'Ditolak',             style: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
    belum_memulai:                  { text: 'Belum Memulai',       style: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
};

const STATUS_LEAVE = {
    menunggu_kajur: { text: 'Menunggu Kajur',  style: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    menunggu_wadir: { text: 'Menunggu Wadir',  style: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200' },
    disetujui:      { text: 'Disetujui',       style: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
    ditolak:        { text: 'Ditolak',         style: 'bg-red-50 text-red-700 ring-1 ring-red-200' },
};

const StatusBadge = ({ status, map }) => {
    const info = map[status] || { text: status, style: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${info.style}`}>
            {info.text}
        </span>
    );
};

const RejectionNotice = ({ reason }) => (
    <div className="mt-3 flex gap-2 items-start bg-red-50 border border-red-100 rounded-xl p-3">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <div>
            <p className="text-xs font-semibold text-red-700 mb-0.5">Alasan Penolakan</p>
            <p className="text-xs text-red-600 leading-relaxed">{reason}</p>
        </div>
    </div>
);

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{value || 'N/A'}</span>
    </div>
);

const StatusRow = ({ icon: Icon, label, badge, rejection }) => (
    <div className="py-3 border-b border-slate-100 last:border-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
            {badge}
        </div>
        {rejection && <RejectionNotice reason={rejection} />}
    </div>
);

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="space-y-2">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
        </div>
    </div>
);

export default function MahasiswaDashboard({ user }) {
    const { activePeriod } = useAppContext();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mahasiswa/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 p-1">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SkeletonCard /><SkeletonCard />
                </div>
                <div className="h-7 bg-slate-200 rounded w-56 animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <SkeletonCard /><SkeletonCard />
                </div>
            </div>
        );
    }

    const saStatus    = data?.saApplication?.status || 'belum_memulai';
    const leaveStatus = data?.leaveApplication?.status;

    return (
        <div className="space-y-6 p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LeaveStatusBanner leaveApplication={data?.leaveApplication} />
                <PeriodBanner period={activePeriod} />
            </div>

            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Selamat Datang</p>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Mahasiswa</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-indigo-50 rounded-xl">
                            <User className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-base font-bold text-slate-800">Informasi Mahasiswa</h2>
                    </div>
                    <div>
                        <InfoRow label="Jurusan"       value={data?.userDetails?.prodi?.jurusan?.nama} />
                        <InfoRow label="Program Studi" value={data?.userDetails?.prodi?.nama} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-emerald-50 rounded-xl">
                            <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h2 className="text-base font-bold text-slate-800">Status Pengajuan</h2>
                    </div>
                    <div>
                        <StatusRow
                            icon={GraduationCap}
                            label="Semester Antara"
                            badge={<StatusBadge status={saStatus} map={STATUS_SA} />}
                            rejection={data?.saApplication?.alasan_ditolak}
                        />
                        <StatusRow
                            icon={BookOpen}
                            label="Cuti Akademik"
                            badge={
                                leaveStatus
                                    ? <StatusBadge status={leaveStatus} map={STATUS_LEAVE} />
                                    : <span className="text-xs text-slate-400 italic">Belum mengajukan</span>
                            }
                            rejection={data?.leaveApplication?.alasan_ditolak}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}