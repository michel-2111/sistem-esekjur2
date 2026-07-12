// pages/semester-antara.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import { getPeriodStatus, getLeaveEndDate } from '../lib/utils';
import Layout from '../components/Layout';
import UploadPembayaran from '../components/mahasiswa/UploadPembayaran';
import PengajuanMK from '../components/mahasiswa/PengajuanMK';
import StatusView from '../components/mahasiswa/StatusView';
import InfoKelas from '../components/mahasiswa/InfoKelas';
import NilaiComponent from '../components/mahasiswa/NilaiComponent';
import { AlertTriangle, Loader2 } from 'lucide-react';

const PageLoading = () => (
    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin mb-3" />
        <p className="text-sm">Memuat data pengajuan...</p>
    </div>
);

const PageError = ({ message }) => (
    <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-5 max-w-lg mx-auto">
        <div className="p-2 bg-red-100 rounded-xl shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
            <p className="text-sm font-semibold text-red-800 mb-0.5">Terjadi Kesalahan</p>
            <p className="text-xs text-red-600">{message}</p>
        </div>
    </div>
);

export default function SemesterAntaraPage() {
    const { user, isAuthenticated, activePeriod, userAcademicStatus } = useAppContext();
    const router = useRouter();
    const [appStatus, setAppStatus] = useState(null);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (!user) return;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/sa/status?includeDetails=true');
                if (!res.ok) throw new Error('Gagal mengambil status pengajuan.');
                setAppStatus(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [isAuthenticated, router, user]);

    if (user?.selectedRole === 'mahasiswa' && userAcademicStatus?.leaveApplication?.status === 'disetujui') {
        const leaveEndDate = getLeaveEndDate(userAcademicStatus.leaveApplication);
        if (leaveEndDate && new Date() < leaveEndDate) {
            return (
                <Layout>
                    <PageWrapper>
                        <StatusView
                            message={`Anda sedang dalam masa cuti hingga sekitar ${leaveEndDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Fitur Semester Antara tidak dapat diakses saat ini.`}
                        />
                    </PageWrapper>
                </Layout>
            );
        }
    }

    const periodStatus = getPeriodStatus(activePeriod);
    if (periodStatus.code !== 'ongoing' && appStatus?.status === 'belum_memulai') {
        return (
            <Layout>
                <PageWrapper>
                    <StatusView message={`Pendaftaran Semester Antara saat ini ditutup. Periode ${periodStatus.text}.`} />
                </PageWrapper>
            </Layout>
        );
    }

    const renderContent = () => {
        if (loading)    return <PageLoading />;
        if (error)      return <PageError message={error} />;
        if (!appStatus) return <PageError message="Status tidak dapat dimuat." />;

        switch (appStatus.status) {
            case 'belum_memulai':
            case 'pembayaran_ditolak':
                return <UploadPembayaran onUploadSuccess={setAppStatus} />;
            case 'menunggu_verifikasi_pembayaran':
                return <StatusView message="Bukti pembayaran Anda telah diunggah dan sedang menunggu verifikasi." />;
            case 'menunggu_pengajuan_mk':
                return <PengajuanMK application={appStatus} onSuccess={setAppStatus} />;
            case 'menunggu_penugasan_dosen':
                return <StatusView message="Pengajuan mata kuliah Anda telah diterima dan sedang menunggu penugasan dosen." />;
            case 'aktif':
                return <InfoKelas application={appStatus} />;
            case 'telah_dinilai':
            case 'selesai':
                return <NilaiComponent application={appStatus} />;
            default:
                return <StatusView message={`Status Anda saat ini: ${appStatus.status}`} />;
        }
    };

    return (
        <Layout>
            <PageWrapper>{renderContent()}</PageWrapper>
        </Layout>
    );
}

function PageWrapper({ children }) {
    return (
        <div className="space-y-6 p-1">
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Akademik</p>
                <h1 className="text-2xl font-bold text-slate-900">Semester Antara</h1>
            </div>
            <div className="w-full">{children}</div>
        </div>
    );
}