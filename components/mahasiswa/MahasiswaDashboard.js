// components/mahasiswa/MahasiswaDashboard.js
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext'; // Impor hook konteks
import PeriodBanner from '../shared/PeriodBanner'; // Impor banner
import LeaveStatusBanner from './LeaveStatusBanner';

const StatusBadge = ({ status }) => {
    const statusMap = {
        menunggu_verifikasi_pembayaran: { text: 'Menunggu Verifikasi', color: 'bg-cyan-100 text-cyan-800' },
        menunggu_pengajuan_mk: { text: 'Pengajuan MK', color: 'bg-blue-100 text-blue-800' },
        menunggu_penugasan_dosen: { text: 'Menunggu Dosen', color: 'bg-purple-100 text-purple-800' },
        aktif: { text: 'Aktif', color: 'bg-green-100 text-green-800' },
        telah_dinilai: { text: 'Telah Dinilai', color: 'bg-indigo-100 text-indigo-800' },
        selesai: { text: 'Selesai', color: 'bg-gray-200 text-gray-800' },
        pembayaran_ditolak: { text: 'Ditolak', color: 'bg-red-100 text-red-800' },
        belum_memulai: { text: 'Belum Memulai', color: 'bg-gray-200 text-gray-700' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-200 text-gray-700' };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>;
};

const LeaveStatusBadge = ({ status }) => {
    const statusMap = {
        menunggu_kajur: { text: 'Menunggu Kajur', color: 'bg-yellow-100 text-yellow-800' },
        menunggu_wadir: { text: 'Menunggu Wadir', color: 'bg-purple-100 text-purple-800' },
        disetujui: { text: 'Disetujui', color: 'bg-green-100 text-green-800' },
        ditolak: { text: 'Ditolak', color: 'bg-red-100 text-red-800' },
    };
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-200 text-gray-700' };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.text}</span>;
};

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

    if (loading) return <p>Memuat dasbor...</p>;

    const saStatus = data?.saApplication?.status || 'belum_memulai';
    const leaveStatus = data?.leaveApplication?.status;

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <LeaveStatusBanner leaveApplication={data?.leaveApplication} />
                <PeriodBanner period={activePeriod} />
            </div>
            
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard Mahasiswa</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Informasi Mahasiswa</h2>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-500">Jurusan: <span className="font-medium text-gray-800">{data?.userDetails?.prodi?.jurusan?.nama || 'N/A'}</span></p>
                        <p className="text-gray-500">Program Studi: <span className="font-medium text-gray-800">{data?.userDetails?.prodi?.nama || 'N/A'}</span></p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">Status Pengajuan</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm font-bold">
                            <span className="font-medium text-gray-800">Semester Antara</span>
                            <StatusBadge status={saStatus} />
                        </div>
                        {data?.saApplication?.alasan_ditolak && (
                            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 text-xs rounded-r-md">
                                <p className="font-bold">Alasan Ditolak:</p>
                                <p>{data.saApplication.alasan_ditolak}</p>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-800">Cuti Akademik</span>
                            {leaveStatus ? <LeaveStatusBadge status={leaveStatus} /> : <span className="text-gray-500">Belum Mengajukan</span>}
                        </div>
                        {data?.leaveApplication?.alasan_ditolak && (
                            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-3 text-xs rounded-r-md">
                                <p className="font-bold">Alasan Ditolak:</p>
                                <p>{data.leaveApplication.alasan_ditolak}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}