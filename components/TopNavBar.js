// components/TopNavBar.js
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getPeriodStatus, getLeaveEndDate } from '../lib/utils';

export default function TopNavBar() {
    const { user, activePeriod, userAcademicStatus } = useAppContext();
    const router = useRouter();
    if (!user) return null;

    const periodStatus = getPeriodStatus(activePeriod);
    
    let isCutiAktif = false;
    let cutiTitle = '';
    if (user.selectedRole === 'Mahasiswa' && userAcademicStatus?.leaveApplication?.status === 'disetujui') {
        const leaveEndDate = getLeaveEndDate(userAcademicStatus.leaveApplication);
        if (leaveEndDate && new Date() < leaveEndDate) {
            isCutiAktif = true;
            cutiTitle = 'Tidak dapat diakses selama masa cuti';
        }
    }

    const navItems = {
        mahasiswa: [
            { label: 'Dashboard', path: '/dashboard' },
            { 
                label: 'Semester Antara', 
                path: '/semester-antara', 
                disabled: periodStatus.code !== 'ongoing' || isCutiAktif,
                title: isCutiAktif ? cutiTitle : 'Pendaftaran ditutup'
            },
            { label: 'Pengajuan Cuti', path: '/pengajuan-cuti' },
        ],
        dosen: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Detail Kelas', path: '/detail-kelas' },
            { label: 'Input Nilai', path: '/input-nilai' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
        ],
        sekjur: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Verifikasi Pembayaran', path: '/verifikasi-pembayaran' },
            { label: 'Rekapitulasi Nilai', path: '/rekap-nilai' },
            { label: 'Manajemen Akademik', path: '/manajemen-akademik' },
            { label: 'Manajemen Dokumen', path: '/manajemen-dokumen' },
            { label: 'Manajemen Dosen', path: '/manajemen-dosen' },
            { label: 'Daftar Cuti', path: '/daftar-cuti' },
        ],
        kaprodi: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Penugasan Dosen', path: '/penugasan-dosen' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
        ],
        kajur: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Verifikasi Cuti', path: '/verifikasi-cuti' },
            { label: 'Daftar Cuti', path: '/daftar-cuti' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
        ],
        wadir: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Verifikasi Cuti', path: '/verifikasi-cuti' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
        ],
        p4m: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
        ]
    };

    const currentNavItems = navItems[user.selectedRole] || [];

    return (
        <nav className="bg-blue-700 text-white shadow-lg">
            <div className="container mx-auto px-6">
                <ul className="flex items-center space-x-6">
                    {currentNavItems.map(item => {
                        const isDisabled = !!item.disabled;
                        const isActive = router.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    href={isDisabled ? '#' : item.path}
                                    className={`py-3 px-2 inline-block font-semibold border-b-4 transition duration-300 
                                        ${isActive ? 'border-yellow-400' : 'border-transparent'}
                                        ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'hover:border-yellow-300'}`
                                    }
                                    aria-disabled={isDisabled}
                                    onClick={(e) => { if (isDisabled) e.preventDefault(); }}
                                    title={isDisabled ? item.title : ''}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
}