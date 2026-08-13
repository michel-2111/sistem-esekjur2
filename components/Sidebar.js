// components/SideBar.js
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getPeriodStatus, getLeaveEndDate } from '../lib/utils';
import { useEffect, useState } from 'react';

const iconMap = {
    '/dashboard':                       '⊞',
    '/semester-antara':                 '📅',
    '/pengajuan-cuti':                  '🏖️',
    '/tugas-akhir':                     '📄',
    '/tugas-akhir/bimbingan':           '💬',
    '/detail-kelas':                    '🏫',
    '/input-nilai':                     '✏️',
    '/dokumen-masuk':                   '📥',
    '/dosen/jadwal-ujian-ta':           '🗓️',
    '/dosen/ta/bimbingan':              '💬',
    '/verifikasi-pembayaran':           '💳',
    '/rekap-nilai':                     '📊',
    '/manajemen-akademik':              '🎓',
    '/manajemen-ta/atur-panitia':       '👥',
    '/manajemen-dokumen':               '🗂️',
    '/manajemen-dosen':                 '👨‍🏫',
    '/daftar-cuti':                     '📋',
    '/penugasan-dosen':                 '📌',
    '/kaprodi/validasi-proposal':       '✅',
    '/verifikasi-cuti':                 '🔍',
    '/kajur/persetujuan-pembimbing':    '🤝',
    '/panitia/validasi-persyaratan':    '✅',
    '/panitia/validasi-proposal':       '📝',
    '/panitia/jadwal-ujian':            '🗓️',
    '/panitia/pengaturan/syarat-dokumen': '📋',
    '/panitia/pengaturan/komponen-nilai': '⚖️',
    '/panitia/rekap-nilai':             '📊',
    '/panitia/plotting-pembimbing':     '🗺️',
    '/admin/jurusan':                   '🏛️',
    '/manajemen-lab':                    '🔬',
    '/admin/users':                     '👤',
    };

    const roleLabels = {
    mahasiswa: 'Mahasiswa',
    dosen:     'Dosen',
    sekjur:    'Sekretaris Jurusan',
    kaprodi:   'Kaprodi',
    kajur:     'Kajur',
    wadir:     'Wadir',
    p4m:       'P4M',
    panitia:   'Panitia TA',
    admin:     'Administrator',
    };

    export default function SideBar( {collapsed, onToggle} ) {
    const { user, activePeriod, userAcademicStatus } = useAppContext();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

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
        { label: 'Dashboard',        path: '/dashboard' },
        { label: 'Semester Antara',  path: '/semester-antara',
            disabled: periodStatus.code !== 'ongoing' || isCutiAktif,
            title: isCutiAktif ? cutiTitle : 'Pendaftaran ditutup' },
        { label: 'Pengajuan Cuti',   path: '/pengajuan-cuti' },
        { label: 'Tugas Akhir',      path: '/tugas-akhir' },
        { label: 'Bimbingan TA',     path: '/tugas-akhir/bimbingan' },
        ],
        dosen: [
        { label: 'Dashboard',        path: '/dashboard' },
        { label: 'Detail Kelas',     path: '/detail-kelas' },
        { label: 'Input Nilai',      path: '/input-nilai' },
        { label: 'Dokumen Masuk',    path: '/dokumen-masuk' },
        { label: 'Jadwal Ujian TA',  path: '/dosen/jadwal-ujian-ta' },
        { label: 'Bimbingan TA',     path: '/dosen/ta/bimbingan' },
        ],
        sekjur: [
        { label: 'Dashboard',              path: '/dashboard' },
        { label: 'Verifikasi Pembayaran',  path: '/verifikasi-pembayaran' },
        { label: 'Rekapitulasi Nilai',     path: '/rekap-nilai' },
        { label: 'Manajemen Akademik',     path: '/manajemen-akademik' },
        { label: 'Atur Panitia TA',        path: '/manajemen-ta/atur-panitia' },
        { label: 'Manajemen Dokumen',      path: '/manajemen-dokumen' },
        { label: 'Manajemen Dosen',        path: '/manajemen-dosen' },
        { label: 'Manajemen Laboratorium', path: '/manajemen-lab' },
        { label: 'Daftar Cuti',            path: '/daftar-cuti' },
        ],
        kaprodi: [
        { label: 'Dashboard',           path: '/dashboard' },
        { label: 'Penugasan Dosen',     path: '/penugasan-dosen' },
        { label: 'Dokumen Masuk',       path: '/dokumen-masuk' },
        { label: 'Validasi Proposal TA',path: '/kaprodi/validasi-proposal' },
        ],
        kajur: [
        { label: 'Dashboard',       path: '/dashboard' },
        { label: 'Verifikasi Cuti', path: '/verifikasi-cuti' },
        { label: 'Daftar Cuti',     path: '/daftar-cuti' },
        { label: 'Pembimbing TA',   path: '/kajur/persetujuan-pembimbing' },
        { label: 'Dokumen Masuk',   path: '/dokumen-masuk' },
        ],
        wadir: [
        { label: 'Dashboard',       path: '/dashboard' },
        { label: 'Verifikasi Cuti', path: '/verifikasi-cuti' },
        { label: 'Dokumen Masuk',   path: '/dokumen-masuk' },
        ],
        p4m: [
        { label: 'Dashboard',    path: '/dashboard' },
        { label: 'Dokumen Masuk',path: '/dokumen-masuk' },
        ],
        panitia: [
        { label: 'Dashboard',              path: '/dashboard' },
        { label: 'Validasi Persyaratan',   path: '/panitia/validasi-persyaratan' },
        { label: 'Validasi Proposal TA',   path: '/panitia/validasi-proposal' },
        { label: 'Jadwal Ujian TA',        path: '/panitia/jadwal-ujian' },
        { label: 'Persyaratan TA',         path: '/panitia/pengaturan/syarat-dokumen' },
        { label: 'Komponen Nilai',         path: '/panitia/pengaturan/komponen-nilai' },
        { label: 'Rekapitulasi Nilai',     path: '/panitia/rekap-nilai' },
        { label: 'Pembimbing',             path: '/panitia/plotting-pembimbing' },
        ],
        admin: [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Kelola Jurusan', path: '/admin/jurusan' },
        { label: 'Manajemen User', path: '/admin/users' },
        ],
    };

    const currentNavItems = navItems[user.selectedRole] || [];

    return (
        <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

            .sidebar-root {
            font-family: 'Plus Jakarta Sans', sans-serif;
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            width: ${collapsed ? '68px' : '228px'};
            background: linear-gradient(175deg, #0f2c6b 0%, #1a3f8f 55%, #1e50b5 100%);
            display: flex;
            flex-direction: column;
            z-index: 40;
            transition: width 0.28s cubic-bezier(0.4,0,0.2,1);
            box-shadow: 3px 0 20px rgba(15,44,107,0.35);
            overflow: hidden;
            }

            /* shimmer line on the right edge */
            .sidebar-root::after {
            content: '';
            position: absolute;
            top: 0; right: 0;
            width: 2px; height: 100%;
            background: linear-gradient(180deg, transparent, rgba(250,204,21,0.6), rgba(96,165,250,0.4), transparent);
            background-size: 100% 200%;
            animation: shimmerV 3s linear infinite;
            }
            @keyframes shimmerV {
            0%   { background-position: 0 -200%; }
            100% { background-position: 0 200%; }
            }

            /* Header area */
            .sidebar-header {
            padding: ${collapsed ? '1.1rem 0' : '1.25rem 1rem 1rem'};
            display: flex;
            align-items: center;
            justify-content: ${collapsed ? 'center' : 'space-between'};
            border-bottom: 1px solid rgba(255,255,255,0.1);
            min-height: 68px;
            gap: 0.5rem;
            }

            .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            overflow: hidden;
            opacity: ${collapsed ? 0 : 1};
            width: ${collapsed ? 0 : 'auto'};
            transition: opacity 0.2s ease, width 0.28s ease;
            white-space: nowrap;
            }
            .sidebar-brand-text {
            font-size: 0.85rem;
            font-weight: 700;
            color: #fff;
            line-height: 1.2;
            letter-spacing: 0.01em;
            }
            .sidebar-brand-sub {
            font-size: 0.65rem;
            font-weight: 500;
            color: rgba(255,255,255,0.5);
            letter-spacing: 0.04em;
            text-transform: uppercase;
            }

            .sidebar-toggle {
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            color: rgba(255,255,255,0.7);
            border-radius: 7px;
            width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            font-size: 0.75rem;
            flex-shrink: 0;
            transition: background 0.2s, color 0.2s;
            }
            .sidebar-toggle:hover {
            background: rgba(255,255,255,0.15);
            color: #fff;
            }

            /* Role badge */
            .sidebar-role {
            margin: 0.75rem ${collapsed ? '0.5rem' : '1rem'};
            padding: ${collapsed ? '0.4rem 0' : '0.45rem 0.75rem'};
            background: rgba(250,204,21,0.12);
            border: 1px solid rgba(250,204,21,0.25);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: ${collapsed ? 'center' : 'flex-start'};
            gap: 0.5rem;
            overflow: hidden;
            }
            .sidebar-role-dot {
            width: 7px; height: 7px;
            border-radius: 50%;
            background: #facc15;
            flex-shrink: 0;
            box-shadow: 0 0 6px rgba(250,204,21,0.7);
            }
            .sidebar-role-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #fde68a;
            letter-spacing: 0.04em;
            white-space: nowrap;
            overflow: hidden;
            opacity: ${collapsed ? 0 : 1};
            max-width: ${collapsed ? 0 : '160px'};
            transition: opacity 0.2s ease, max-width 0.28s ease;
            }

            /* Nav list */
            .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0.5rem 0;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.15) transparent;
            }
            .sidebar-nav::-webkit-scrollbar { width: 4px; }
            .sidebar-nav::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.15);
            border-radius: 4px;
            }

            .sidebar-item {
            padding: 0 ${collapsed ? '0.5rem' : '0.75rem'};
            margin-bottom: 2px;
            opacity: 0;
            transform: translateX(-8px);
            animation: sideItemIn 0.3s ease forwards;
            }
            @keyframes sideItemIn {
            to { opacity: 1; transform: translateX(0); }
            }

            .sidebar-link {
            position: relative;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: ${collapsed ? '0.7rem' : '0.65rem 0.8rem'};
            border-radius: 9px;
            font-size: 0.8rem;
            font-weight: 600;
            color: rgba(255,255,255,0.68);
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            transition: background 0.18s ease, color 0.18s ease;
            cursor: pointer;
            justify-content: ${collapsed ? 'center' : 'flex-start'};
            }
            .sidebar-link:hover {
            background: rgba(255,255,255,0.09);
            color: #fff;
            }
            .sidebar-link.active {
            background: rgba(255,255,255,0.14);
            color: #fff;
            box-shadow: inset 3px 0 0 #facc15;
            }
            .sidebar-link.disabled {
            color: rgba(255,255,255,0.28);
            cursor: not-allowed;
            }
            .sidebar-link.disabled:hover { background: transparent; }

            /* Active left bar already in box-shadow; add glow on icon */
            .sidebar-link.active .nav-icon { filter: drop-shadow(0 0 4px rgba(250,204,21,0.6)); }

            .nav-icon {
            font-size: 1rem;
            flex-shrink: 0;
            width: 20px;
            text-align: center;
            line-height: 1;
            }

            .nav-label {
            overflow: hidden;
            opacity: ${collapsed ? 0 : 1};
            max-width: ${collapsed ? 0 : '160px'};
            transition: opacity 0.2s ease, max-width 0.28s ease;
            letter-spacing: 0.02em;
            }

            .lock-badge {
            margin-left: auto;
            font-size: 0.6rem;
            opacity: 0.4;
            flex-shrink: 0;
            display: ${collapsed ? 'none' : 'inline'};
            }

            /* Tooltip when collapsed */
            .sidebar-link[data-tip]:hover::after {
            content: attr(data-tip);
            position: absolute;
            left: calc(100% + 12px);
            top: 50%;
            transform: translateY(-50%);
            background: rgba(10, 22, 60, 0.95);
            color: rgba(255,255,255,0.9);
            font-size: 0.72rem;
            font-weight: 500;
            padding: 5px 10px;
            border-radius: 7px;
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,0.12);
            pointer-events: none;
            z-index: 200;
            box-shadow: 0 4px 14px rgba(0,0,0,0.3);
            }

            /* Footer */
            .sidebar-footer {
            padding: ${collapsed ? '1rem 0.5rem' : '1rem'};
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 0.68rem;
            color: rgba(255,255,255,0.3);
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            opacity: ${collapsed ? 0 : 1};
            transition: opacity 0.2s ease;
            }
        `}</style>

        <aside className="sidebar-root" aria-label="Sidebar navigation">

            <div className="sidebar-header">
            <div className="sidebar-brand">
                <div>
                <div className="sidebar-brand-text">POLIMDO</div>
                <div className="sidebar-brand-sub">Teknik Elektro</div>
                </div>
            </div>
            <button
                className="sidebar-toggle"
                onClick={onToggle}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={collapsed ? 'Perluas' : 'Perkecil'}
            >
                {collapsed ? '→' : '←'}
            </button>
            </div>

            <div className="sidebar-role">
            <span className="sidebar-role-dot" />
            <span className="sidebar-role-label">
                {roleLabels[user.selectedRole] ?? user.selectedRole}
            </span>
            </div>

            <nav className="sidebar-nav">
            {currentNavItems.map((item, index) => {
                const isDisabled = !!item.disabled;
                const isActive   = router.pathname === item.path;
                const icon       = iconMap[item.path] ?? '•';
                const tip        = collapsed
                ? (isDisabled ? (item.title || item.label) : item.label)
                : (isDisabled ? item.title : undefined);

                const linkClass = [
                'sidebar-link',
                isActive && !isDisabled ? 'active' : '',
                isDisabled ? 'disabled' : '',
                ].filter(Boolean).join(' ');

                return (
                <div
                    key={item.path}
                    className="sidebar-item"
                    style={{ animationDelay: mounted ? `${index * 45}ms` : '0ms' }}
                >
                    <Link
                    href={isDisabled ? '#' : item.path}
                    className={linkClass}
                    aria-disabled={isDisabled}
                    aria-current={isActive && !isDisabled ? 'page' : undefined}
                    onClick={(e) => { if (isDisabled) e.preventDefault(); }}
                    {...(tip ? { 'data-tip': tip } : {})}
                    >
                    <span className="nav-icon" aria-hidden="true">{icon}</span>
                    <span className="nav-label">{item.label}</span>
                    {isDisabled && <span className="lock-badge" aria-hidden="true">🔒</span>}
                    </Link>
                </div>
                );
            })}
            </nav>

            <div className="sidebar-footer">
            © {new Date().getFullYear()} POLIMDO. All rights reserved.
            </div>

        </aside>
        </>
    );
}