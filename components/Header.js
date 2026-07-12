// components/Header.js
import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { BookOpenCheck, LogOut, ChevronDown, Replace, User, Bell } from 'lucide-react';
import ProfileModal from './shared/ProfileModal';

const roleLabels = {
    mahasiswa: 'Mahasiswa',
    dosen:     'Dosen',
    sekjur:    'Sekretaris Jurusan',
    kaprodi:   'Kaprodi',
    kajur:     'Kajur',
    wadir:     'Wadir',
    p4m:       'P4M',
    panitia:   'Panitia TA',
};

const roleColors = {
    mahasiswa: { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.3)',  dot: '#3b82f6' },
    dosen:     { bg: 'rgba(16,185,129,0.12)',   border: 'rgba(16,185,129,0.3)',  dot: '#10b981' },
    sekjur:    { bg: 'rgba(139,92,246,0.12)',   border: 'rgba(139,92,246,0.3)',  dot: '#8b5cf6' },
    kaprodi:   { bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)',  dot: '#f59e0b' },
    kajur:     { bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',   dot: '#ef4444' },
    wadir:     { bg: 'rgba(236,72,153,0.12)',   border: 'rgba(236,72,153,0.3)',  dot: '#ec4899' },
    p4m:       { bg: 'rgba(20,184,166,0.12)',   border: 'rgba(20,184,166,0.3)',  dot: '#14b8a6' },
    panitia:   { bg: 'rgba(249,115,22,0.12)',   border: 'rgba(249,115,22,0.3)',  dot: '#f97316' },
};

function Avatar({ name }) {
    const initials = name
        ? name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
        : '?';
    return (
        <div style={{
            width: 34, height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1e50b5 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, color: '#fff',
            flexShrink: 0,
            border: '2px solid rgba(255,255,255,0.15)',
            letterSpacing: '0.05em',
        }}>
            {initials}
        </div>
    );
}

export default function Header() {
    const { user, logout, switchRole, activePeriod } = useAppContext();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 4);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const handleSwitchRole = async (role) => {
        setDropdownOpen(false);
        if (role === user.selectedRole) return;
        try {
            const res = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newRole: role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            switchRole(data.user);
        } catch (error) {
            console.error('Failed to switch role:', error);
            alert(error.message);
        }
    };

    const rc = roleColors[user.selectedRole] || roleColors.mahasiswa;
    const canSwitchRole = user.roles?.length > 1;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                .header-root {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    background: #ffffff;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    transition: box-shadow 0.25s ease;
                }
                .header-root.scrolled {
                    box-shadow: 0 2px 16px rgba(15, 44, 107, 0.1);
                }

                .header-inner {
                    padding: 0 1.5rem;
                    height: 68px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 1rem;
                }

                /* ── Brand ── */
                .header-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    text-decoration: none;
                }
                .header-brand-icon {
                    width: 34px; height: 34px;
                    background: linear-gradient(135deg, #0f2c6b 0%, #1e50b5 100%);
                    border-radius: 9px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff;
                    flex-shrink: 0;
                    box-shadow: 0 2px 8px rgba(15,44,107,0.3);
                }
                .header-brand-text {
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #0f2c6b;
                    letter-spacing: -0.01em;
                    line-height: 1;
                }
                .header-brand-sub {
                    font-size: 0.62rem;
                    font-weight: 500;
                    color: #94a3b8;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-top: 1px;
                }

                /* ── Period badge ── */
                .period-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.3rem 0.75rem;
                    background: #f0f4ff;
                    border: 1px solid #c7d5f7;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: #1e40af;
                    letter-spacing: 0.02em;
                    white-space: nowrap;
                }
                .period-badge::before {
                    content: '';
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #3b82f6;
                    box-shadow: 0 0 0 2px rgba(59,130,246,0.25);
                    animation: pulseDot 2s ease-in-out infinite;
                }
                @keyframes pulseDot {
                    0%, 100% { box-shadow: 0 0 0 2px rgba(59,130,246,0.25); }
                    50%       { box-shadow: 0 0 0 4px rgba(59,130,246,0.12); }
                }

                /* ── Right actions ── */
                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Icon button */
                .icon-btn {
                    width: 36px; height: 36px;
                    border-radius: 9px;
                    border: 1px solid #e9ecf2;
                    background: #fff;
                    color: #64748b;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s, border-color 0.15s;
                }
                .icon-btn:hover {
                    background: #f0f4ff;
                    color: #1e50b5;
                    border-color: #c7d5f7;
                }

                /* Divider */
                .header-divider {
                    width: 1px;
                    height: 28px;
                    background: #e9ecf2;
                    margin: 0 0.25rem;
                }

                /* ── User dropdown trigger ── */
                .user-trigger {
                    display: flex;
                    align-items: center;
                    gap: 0.55rem;
                    padding: 0.3rem 0.6rem 0.3rem 0.4rem;
                    border-radius: 10px;
                    border: 1px solid #e9ecf2;
                    background: #fff;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                    max-width: 240px;
                }
                .user-trigger:hover {
                    background: #f8faff;
                    border-color: #c7d5f7;
                }
                .user-trigger.open {
                    background: #f0f4ff;
                    border-color: #93b4f8;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    overflow: hidden;
                    min-width: 0;
                }
                .user-name {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #1e293b;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 130px;
                    line-height: 1.2;
                }
                .user-role-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    font-size: 0.63rem;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    margin-top: 2px;
                    padding: 1px 6px;
                    border-radius: 999px;
                    background: ${rc.bg};
                    border: 1px solid ${rc.border};
                    color: ${rc.dot};
                    white-space: nowrap;
                }
                .user-role-badge::before {
                    content: '';
                    width: 5px; height: 5px;
                    border-radius: 50%;
                    background: ${rc.dot};
                    flex-shrink: 0;
                }

                .chevron-icon {
                    color: #94a3b8;
                    flex-shrink: 0;
                    transition: transform 0.2s ease;
                }
                .chevron-icon.open { transform: rotate(180deg); }

                /* ── Dropdown menu ── */
                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    right: 0;
                    min-width: 220px;
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    box-shadow: 0 8px 30px rgba(15,44,107,0.12), 0 2px 8px rgba(0,0,0,0.06);
                    padding: 0.5rem;
                    z-index: 200;
                    animation: dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1);
                    transform-origin: top right;
                }
                @keyframes dropIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-4px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }

                .dropdown-section-label {
                    padding: 0.4rem 0.75rem 0.3rem;
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                }

                .dropdown-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.55rem 0.75rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #374151;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: background 0.15s, color 0.15s;
                    text-align: left;
                }
                .dropdown-item:hover {
                    background: #f0f4ff;
                    color: #1e50b5;
                }
                .dropdown-item:disabled {
                    opacity: 0.45;
                    cursor: default;
                    background: #f8fafc;
                    color: #64748b;
                }
                .dropdown-item.active-role {
                    background: #f0f4ff;
                    color: #1e50b5;
                    font-weight: 600;
                }
                .dropdown-item.active-role::after {
                    content: '✓';
                    margin-left: auto;
                    font-size: 0.75rem;
                    color: #3b82f6;
                }

                .dropdown-separator {
                    height: 1px;
                    background: #f1f5f9;
                    margin: 0.4rem 0;
                }

                /* Logout button */
                .logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #ef4444;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: background 0.15s;
                    width: 100%;
                    text-align: left;
                }
                .logout-btn:hover { background: #fef2f2; }
            `}</style>

            <header className={`header-root${scrolled ? ' scrolled' : ''}`} role="banner">
                <div className="header-inner">

                    {/* ── Brand ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div className="header-brand">
                            <div className="header-brand-icon">
                                <BookOpenCheck size={17} />
                            </div>
                            <div>
                                <div className="header-brand-text">Sistem Esekjur</div>
                                <div className="header-brand-sub">Akademik</div>
                            </div>
                        </div>

                        {activePeriod && (
                            <span className="period-badge">
                                {activePeriod.nama}
                            </span>
                        )}
                    </div>

                    <div className="header-actions">

                        <button
                            className="icon-btn"
                            onClick={() => setIsProfileModalOpen(true)}
                            title="Profil Saya"
                            aria-label="Buka profil"
                        >
                            <User size={16} />
                        </button>

                        <div className="header-divider" aria-hidden="true" />

                        <div style={{ position: 'relative' }} ref={dropdownRef}>
                            <button
                                className={`user-trigger${isDropdownOpen ? ' open' : ''}`}
                                onClick={() => canSwitchRole && setDropdownOpen(o => !o)}
                                aria-haspopup={canSwitchRole ? 'listbox' : undefined}
                                aria-expanded={canSwitchRole ? isDropdownOpen : undefined}
                                style={{ cursor: canSwitchRole ? 'pointer' : 'default' }}
                            >
                                <Avatar name={user.nama} />
                                <div className="user-info">
                                    <span className="user-name">{user.nama}</span>
                                    <span className="user-role-badge">
                                        {roleLabels[user.selectedRole] ?? user.selectedRole}
                                    </span>
                                </div>
                                {canSwitchRole && (
                                    <ChevronDown
                                        size={15}
                                        className={`chevron-icon${isDropdownOpen ? ' open' : ''}`}
                                    />
                                )}
                            </button>

                            {isDropdownOpen && canSwitchRole && (
                                <div className="dropdown-menu" role="listbox" aria-label="Ganti peran">
                                    <div className="dropdown-section-label">Ganti Peran</div>
                                    {user.roles.map(role => (
                                        <button
                                            key={role}
                                            role="option"
                                            aria-selected={role === user.selectedRole}
                                            className={`dropdown-item${role === user.selectedRole ? ' active-role' : ''}`}
                                            onClick={() => handleSwitchRole(role)}
                                            disabled={role === user.selectedRole}
                                        >
                                            <Replace size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                                            <span style={{ textTransform: 'capitalize' }}>
                                                {roleLabels[role] ?? role}
                                            </span>
                                        </button>
                                    ))}

                                    <div className="dropdown-separator" />

                                    <button className="logout-btn" onClick={logout}>
                                        <LogOut size={15} />
                                        Keluar
                                    </button>
                                </div>
                            )}
                        </div>

                        {!canSwitchRole && (
                            <button className="logout-btn" onClick={logout} style={{ width: 'auto', padding: '0.45rem 0.8rem' }}>
                                <LogOut size={15} />
                                Keluar
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />
        </>
    );
}