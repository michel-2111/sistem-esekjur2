// components/TopNavBar.js
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getPeriodStatus, getLeaveEndDate } from '../lib/utils';
import { useEffect, useState } from 'react';

export default function TopNavBar() {
    const { user, activePeriod, userAcademicStatus } = useAppContext();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            { label: 'Tugas Akhir', path: '/tugas-akhir' },
            { label: 'Bimbingan TA', path: '/tugas-akhir/bimbingan' },
        ],
        dosen: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Detail Kelas', path: '/detail-kelas' },
            { label: 'Input Nilai', path: '/input-nilai' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
            { label: 'Jadwal Ujian TA', path: '/dosen/jadwal-ujian-ta' },
            { label: 'Bimbingan TA', path: '/dosen/ta/bimbingan' },
        ],
        sekjur: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Verifikasi Pembayaran', path: '/verifikasi-pembayaran' },
            { label: 'Rekapitulasi Nilai', path: '/rekap-nilai' },
            { label: 'Manajemen Akademik', path: '/manajemen-akademik' },
            { label: 'Atur Panitia TA', path: '/manajemen-ta/atur-panitia' },
            { label: 'Manajemen Dokumen', path: '/manajemen-dokumen' },
            { label: 'Manajemen Dosen', path: '/manajemen-dosen' },
            { label: 'Daftar Cuti', path: '/daftar-cuti' },
        ],
        kaprodi: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Penugasan Dosen', path: '/penugasan-dosen' },
            { label: 'Dokumen Masuk', path: '/dokumen-masuk' },
            { label: 'Validasi Proposal TA', path: '/kaprodi/validasi-proposal' },
        ],
        kajur: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Verifikasi Cuti', path: '/verifikasi-cuti' },
            { label: 'Daftar Cuti', path: '/daftar-cuti' },
            { label: 'Pembimbing TA', path: '/kajur/persetujuan-pembimbing' },
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
        ],
        panitia: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Validasi Persyaratan', path: '/panitia/validasi-persyaratan' },
            { label: 'Validasi Proposal TA', path: '/panitia/validasi-proposal' },
            { label: 'Jadwal Ujian TA', path: '/panitia/jadwal-ujian' },
            { label: 'Persyaratan TA', path: '/panitia/pengaturan/syarat-dokumen' },
            { label: 'Komponen Nilai', path: '/panitia/pengaturan/komponen-nilai' },
            { label: 'Rekapitulasi Nilai', path: '/panitia/rekap-nilai' },
            { label: 'Pembimbing', path: '/panitia/plotting-pembimbing' },
        ],
    };

    const currentNavItems = navItems[user.selectedRole] || [];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                .topnav-root {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    isolation: isolate;
                    background: linear-gradient(135deg, #0f2c6b 0%, #1a3f8f 60%, #1e50b5 100%);
                    transition: box-shadow 0.3s ease, background 0.3s ease;
                }

                .topnav-root.scrolled {
                    box-shadow: 0 4px 24px 0 rgba(15, 44, 107, 0.45);
                    background: linear-gradient(135deg, #0a1f52 0%, #13327a 60%, #1a44a0 100%);
                }

                /* Subtle shimmer line at bottom */
                .topnav-root::after {
                    content: '';
                    display: block;
                    height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.7), rgba(96, 165, 250, 0.5), transparent);
                    background-size: 200% 100%;
                    animation: shimmer 3s linear infinite;
                }

                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                .topnav-inner {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 0 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    overflow-x: auto;
                    scrollbar-width: none;
                }
                .topnav-inner::-webkit-scrollbar { display: none; }

                /* Staggered mount animation */
                .topnav-item {
                    opacity: 0;
                    transform: translateY(-6px);
                    animation: navItemIn 0.35s ease forwards;
                }

                @keyframes navItemIn {
                    to { opacity: 1; transform: translateY(0); }
                }

                .topnav-link {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    padding: 0.85rem 0.9rem;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.03em;
                    color: rgba(255, 255, 255, 0.75);
                    text-decoration: none;
                    border-radius: 6px;
                    white-space: nowrap;
                    transition: color 0.2s ease, background 0.2s ease;
                    cursor: pointer;
                    user-select: none;
                }

                /* Animated underline pill */
                .topnav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 6px;
                    left: 50%;
                    transform: translateX(-50%) scaleX(0);
                    width: calc(100% - 1rem);
                    height: 2.5px;
                    border-radius: 99px;
                    background: linear-gradient(90deg, #facc15, #fde68a);
                    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .topnav-link:hover {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.08);
                }
                .topnav-link:hover::after {
                    transform: translateX(-50%) scaleX(0.6);
                }

                /* Active state */
                .topnav-link.active {
                    color: #fff;
                    background: rgba(255, 255, 255, 0.12);
                }
                .topnav-link.active::after {
                    transform: translateX(-50%) scaleX(1);
                    background: linear-gradient(90deg, #facc15, #fde047);
                    box-shadow: 0 0 8px rgba(250, 204, 21, 0.6);
                }

                /* Active dot indicator */
                .topnav-link.active .nav-dot {
                    opacity: 1;
                    transform: scale(1);
                }
                .nav-dot {
                    display: inline-block;
                    width: 5px;
                    height: 5px;
                    border-radius: 50%;
                    background: #facc15;
                    margin-right: 6px;
                    opacity: 0;
                    transform: scale(0);
                    transition: opacity 0.2s ease, transform 0.2s ease;
                    box-shadow: 0 0 6px rgba(250, 204, 21, 0.8);
                    flex-shrink: 0;
                }

                /* Disabled state */
                .topnav-link.disabled {
                    color: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                    background: transparent;
                }
                .topnav-link.disabled::after { display: none; }
                .topnav-link.disabled:hover {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.3);
                }

                /* Tooltip for disabled */
                .topnav-link.disabled[title]:hover::before {
                    content: attr(title);
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    background: rgba(15, 30, 70, 0.95);
                    color: rgba(255,255,255,0.85);
                    font-size: 0.7rem;
                    font-weight: 500;
                    padding: 5px 10px;
                    border-radius: 6px;
                    white-space: nowrap;
                    border: 1px solid rgba(255,255,255,0.1);
                    pointer-events: none;
                    z-index: 200;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                /* Lock icon for disabled */
                .lock-icon {
                    display: inline-flex;
                    margin-left: 5px;
                    opacity: 0.5;
                    font-size: 0.65rem;
                }
            `}</style>

            <nav className={`topnav-root${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
                <div className="topnav-inner">
                    {currentNavItems.map((item, index) => {
                        const isDisabled = !!item.disabled;
                        const isActive = router.pathname === item.path;

                        const linkClass = [
                            'topnav-link',
                            isActive && !isDisabled ? 'active' : '',
                            isDisabled ? 'disabled' : '',
                        ].filter(Boolean).join(' ');

                        return (
                            <div
                                key={item.path}
                                className="topnav-item"
                                style={{ animationDelay: mounted ? `${index * 55}ms` : '0ms' }}
                            >
                                <Link
                                    href={isDisabled ? '#' : item.path}
                                    className={linkClass}
                                    aria-disabled={isDisabled}
                                    aria-current={isActive && !isDisabled ? 'page' : undefined}
                                    onClick={(e) => { if (isDisabled) e.preventDefault(); }}
                                    title={isDisabled ? item.title : ''}
                                >
                                    <span className="nav-dot" aria-hidden="true" />
                                    {item.label}
                                    {isDisabled && (
                                        <span className="lock-icon" aria-hidden="true">🔒</span>
                                    )}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}