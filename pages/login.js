// pages/login.js
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Link from 'next/link';
import { BookOpenCheck, LogIn as LoginIcon, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAppContext();
    const [roles, setRoles] = useState([]);
    const [role, setRole] = useState('mahasiswa');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetch('/api/master/roles')
            .then(res => res.json())
            .then(data => setRoles(data))
            .catch(err => console.error("Failed to fetch roles:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Gagal untuk login');
            login(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const identifierLabel = role === 'mahasiswa' ? 'NIM' : 'NIP';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .login-page {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    background: #f0f4ff;
                    position: relative;
                    overflow: hidden;
                }

                /* ── Decorative background ── */
                .login-bg {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    background: linear-gradient(135deg, #0a1f5c 0%, #0f2c6b 40%, #1a3f8f 70%, #1e50b5 100%);
                    overflow: hidden;
                }
                .login-bg::before {
                    content: '';
                    position: absolute;
                    width: 700px; height: 700px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%);
                    top: -200px; left: -100px;
                }
                .login-bg::after {
                    content: '';
                    position: absolute;
                    width: 500px; height: 500px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%);
                    bottom: -100px; right: -50px;
                }
                .login-bg-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }

                /* ── Left panel (branding) ── */
                .login-left {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 3rem 4rem;
                    position: relative;
                    z-index: 1;
                    opacity: 0;
                    transform: translateX(-20px);
                    animation: fadeSlideIn 0.6s ease 0.2s forwards;
                }
                @media (max-width: 900px) { .login-left { display: none; } }

                .login-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 3rem;
                }
                .login-logo-icon {
                    width: 44px; height: 44px;
                    background: rgba(255,255,255,0.15);
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff;
                    backdrop-filter: blur(8px);
                }
                .login-logo-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.01em;
                }
                .login-logo-sub {
                    font-size: 0.65rem;
                    font-weight: 500;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    margin-top: 1px;
                }

                .login-headline {
                    font-size: clamp(1.8rem, 3vw, 2.6rem);
                    font-weight: 800;
                    color: #fff;
                    line-height: 1.15;
                    letter-spacing: -0.02em;
                    margin-bottom: 1rem;
                }
                .login-headline span {
                    color: #facc15;
                }
                .login-desc {
                    font-size: 0.9rem;
                    color: rgba(255,255,255,0.55);
                    line-height: 1.7;
                    max-width: 360px;
                    margin-bottom: 2.5rem;
                }

                .login-features {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .login-feature {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.82rem;
                    color: rgba(255,255,255,0.7);
                }
                .login-feature-dot {
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: #facc15;
                    flex-shrink: 0;
                    box-shadow: 0 0 8px rgba(250,204,21,0.5);
                }

                /* ── Right panel (form) ── */
                .login-right {
                    width: 480px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                    z-index: 1;
                    opacity: 0;
                    transform: translateX(20px);
                    animation: fadeSlideIn 0.6s ease 0.3s forwards;
                }
                @media (max-width: 900px) {
                    .login-right { width: 100%; }
                }

                .login-card {
                    width: 100%;
                    max-width: 400px;
                    background: #fff;
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 20px 60px rgba(10,31,92,0.2), 0 4px 16px rgba(0,0,0,0.08);
                }

                .card-header {
                    margin-bottom: 2rem;
                }
                .card-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #0f2c6b;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }
                .card-subtitle {
                    font-size: 0.82rem;
                    color: #94a3b8;
                    margin-top: 0.4rem;
                }

                /* Form fields */
                .form-group {
                    margin-bottom: 1.1rem;
                }
                .form-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #374151;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                    margin-bottom: 0.45rem;
                }
                .form-input {
                    width: 100%;
                    padding: 0.7rem 0.9rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #1e293b;
                    background: #f8faff;
                    outline: none;
                    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
                    appearance: none;
                }
                .form-input:focus {
                    border-color: #3b82f6;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                }
                .form-input-wrap {
                    position: relative;
                }
                .form-input-wrap .form-input {
                    padding-right: 2.8rem;
                }
                .eye-btn {
                    position: absolute;
                    right: 0.75rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    padding: 0.2rem;
                    transition: color 0.15s;
                }
                .eye-btn:hover { color: #3b82f6; }

                .form-select {
                    width: 100%;
                    padding: 0.7rem 0.9rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    color: #1e293b;
                    background: #f8faff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 0.9rem center;
                    outline: none;
                    cursor: pointer;
                    appearance: none;
                    transition: border-color 0.18s, background-color 0.18s, box-shadow 0.18s;
                }
                .form-select:focus {
                    border-color: #3b82f6;
                    background-color: #fff;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                }

                .error-msg {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 0.9rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 9px;
                    font-size: 0.8rem;
                    color: #dc2626;
                    margin-bottom: 1rem;
                }
                .error-msg::before { content: '⚠'; font-size: 0.9rem; }

                .submit-btn {
                    width: 100%;
                    padding: 0.8rem;
                    background: linear-gradient(135deg, #0f2c6b 0%, #1e50b5 100%);
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.875rem;
                    font-weight: 700;
                    letter-spacing: 0.02em;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
                    box-shadow: 0 4px 14px rgba(15,44,107,0.35);
                    margin-top: 1.5rem;
                }
                .submit-btn:hover:not(:disabled) {
                    opacity: 0.92;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(15,44,107,0.4);
                }
                .submit-btn:active:not(:disabled) { transform: translateY(0); }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .spinner {
                    width: 16px; height: 16px;
                    border: 2px solid rgba(255,255,255,0.35);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .divider {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin: 1.5rem 0 1rem;
                    font-size: 0.72rem;
                    color: #cbd5e1;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #f1f5f9;
                }

                .register-link {
                    text-align: center;
                    font-size: 0.8rem;
                    color: #94a3b8;
                }
                .register-link a {
                    color: #1e50b5;
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .register-link a:hover { color: #0f2c6b; }

                @keyframes fadeSlideIn {
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>

            <div className="login-page">
                <div className="login-bg">
                    <div className="login-bg-grid" />
                </div>

                {/* ── Left branding panel ── */}
                <div className="login-left">
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <BookOpenCheck size={22} />
                        </div>
                        <div>
                            <div className="login-logo-text">POLIMDO</div>
                            <div className="login-logo-sub">Teknik Elektro</div>
                        </div>
                    </div>

                    <h1 className="login-headline">
                        E-Sekjur<br />
                        Sistem <span>Administrasi Akademik</span> Terpadu
                    </h1>
                    <p className="login-desc">
                        Platform pengelolaan akademik untuk mahasiswa, dosen, dan civitas akademika Jurusan Teknik Elektro POLIMDO.
                    </p>

                    <div className="login-features">
                        {[
                            'Manajemen Tugas Akhir & Bimbingan',
                            'Pengajuan Cuti & Semester Antara',
                            'Rekap Nilai & Dokumen Akademik',
                            'Dashboard Multi-Peran Real-time',
                        ].map((f, i) => (
                            <div key={i} className="login-feature">
                                <span className="login-feature-dot" />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right form panel ── */}
                <div className="login-right">
                    <div className="login-card">
                        <div className="card-header">
                            <div className="card-title">Selamat Datang 👋</div>
                            <div className="card-subtitle">Masuk ke akun Anda untuk melanjutkan</div>
                        </div>

                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label">Login Sebagai</label>
                                <select
                                    className="form-select"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                >
                                    {roles.map(r => (
                                        <option key={r.id} value={r.nama_role} style={{ textTransform: 'capitalize' }}>
                                            {r.nama_role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{identifierLabel}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={`Masukkan ${identifierLabel} Anda`}
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="form-input-wrap">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-input"
                                        placeholder="Masukkan password Anda"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="eye-btn"
                                        onClick={() => setShowPassword(s => !s)}
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && <div className="error-msg">{error}</div>}

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                {isLoading
                                    ? <><div className="spinner" /> Memverifikasi...</>
                                    : <><LoginIcon size={16} /> Masuk</>
                                }
                            </button>
                        </form>

                        <div className="divider">atau</div>
                        <div className="register-link">
                            Belum punya akun?{' '}
                            <Link href="/register">Daftar sebagai Mahasiswa</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}