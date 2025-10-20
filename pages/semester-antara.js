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

export default function SemesterAntaraPage() {
    const { user, isAuthenticated, activePeriod, userAcademicStatus } = useAppContext();
    const router = useRouter();
    const [appStatus, setAppStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/sa/status?includeDetails=true');
                if (!res.ok) throw new Error("Gagal mengambil status pengajuan.");
                const data = await res.json();
                setAppStatus(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        if (user) {
            fetchStatus();
        }
    }, [isAuthenticated, router, user]);

    if (user?.selectedRole === 'mahasiswa' && userAcademicStatus?.leaveApplication?.status === 'disetujui') {
        const leaveEndDate = getLeaveEndDate(userAcademicStatus.leaveApplication);
        if (leaveEndDate && new Date() < leaveEndDate) {
            return (
                <Layout>
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">Semester Antara</h1>
                    <StatusView message={`Anda sedang dalam masa cuti hingga sekitar ${leaveEndDate.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}. Fitur Semester Antara tidak dapat diakses saat ini.`} />
                </Layout>
            );
        }
    }

    const periodStatus = getPeriodStatus(activePeriod);
    if (periodStatus.code !== 'ongoing' && appStatus?.status === 'belum_memulai') {
        return (
            <Layout>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Semester Antara</h1>
                <StatusView message={`Pendaftaran Semester Antara saat ini ditutup. Periode ${periodStatus.text}.`} />
            </Layout>
        );
    }

    const renderContent = () => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p className="text-red-600">{error}</p>;
        if (!appStatus) return <p>Status tidak dapat dimuat.</p>;

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
            {appStatus?.status !== 'aktif' && appStatus?.status !== 'telah_dinilai' && (
                <div></div>
            )}
            <div className="flex justify-center">
                {renderContent()}
            </div>
        </Layout>
    );
}