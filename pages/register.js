// pages/register.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ nama: '', identifier: '', password: '', prodiId: '' });
    const [jurusanList, setJurusanList] = useState([]);
    const [selectedJurusan, setSelectedJurusan] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchJurusan = async () => {
            try {
                const res = await fetch('/api/master/jurusan');
                if (!res.ok) throw new Error('Gagal memuat data');
                const data = await res.json();
                setJurusanList(data);
            } catch (err) {
                setError('Tidak dapat memuat data jurusan & prodi.');
            } finally {
                setLoading(false);
            }
        };
        fetchJurusan();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleJurusanChange = (e) => {
        setSelectedJurusan(e.target.value);
        setFormData(prev => ({ ...prev, prodiId: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!formData.nama || !formData.identifier || !formData.password || !formData.prodiId) {
            setError('Semua field wajib diisi.');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSuccess('Registrasi berhasil! Mengalihkan ke halaman login...');
            setTimeout(() => router.push('/login'), 2500);
        } catch (err) {
            setError(err.message || 'Gagal melakukan registrasi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableProdi = jurusanList.find(j => j.id === selectedJurusan)?.prodi || [];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .reg-page {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .reg-bg {
                    position: fixed;
                    inset: 0;
                    z-index: 0;
                    background: linear-gradient(135deg, #0a1f5c 0%, #0f2c6b 40%, #1a3f8f 70%, #1e50b5 100%);
                }
                .reg-bg::before {
                    content: '';
                    position: absolute;
                    width: 600px; height: 600px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%);
                    top: -150px; right: -100px;
                }
                .reg-bg::after {
                    content: '';
                    position: absolute;
                    width: 400px; height: 400px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%);
                    bottom: -80px; left: -80px;
                }
                .reg-bg-grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                }

                .reg-card {
                    position: relative;
                    z-index: 1;
                    width: 100%;
                    max-width: 480px;
                    background: #fff;
                    border-radius: 22px;
                    padding: 2.5rem;
                    box-shadow: 0 24px 70px rgba(10,31,92,0.25), 0 4px 16px rgba(0,0,0,0.08);
                    opacity: 0;
                    transform: translateY(20px);
                    animation: cardIn 0.5s ease 0.1s forwards;
                }
                @keyframes cardIn {
                    to { opacity: 1; transform: translateY(0); }
                }

                .reg-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.9rem;
                    margin-bottom: 1.75rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid #f1f5f9;
                }
                .reg-icon {
                    width: 46px; height: 46px;
                    background: linear-gradient(135deg, #0f2c6b, #1e50b5);
                    border-radius: 13px;
                    display: flex; align-items: center; justify-content: center;
                    color: #fff;
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(15,44,107,0.35);
                }
                .reg-title {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #0f2c6b;
                    letter-spacing: -0.02em;
                    line-height: 1.2;
                }
                .reg-subtitle {
                    font-size: 0.78rem;
                    color: #94a3b8;
                    margin-top: 0.25rem;
                }

                /* 2-column grid for larger fields */
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0 1rem;
                }
                .form-grid .form-group:first-child,
                .form-group.full { grid-column: 1 / -1; }

                .form-group { margin-bottom: 1rem; }

                .form-label {
                    display: block;
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #374151;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 0.4rem;
                }

                .form-input, .form-select {
                    width: 100%;
                    padding: 0.68rem 0.9rem;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    font-size: 0.85rem;
                    color: #1e293b;
                    background: #f8faff;
                    outline: none;
                    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
                    appearance: none;
                }
                .form-input:focus, .form-select:focus {
                    border-color: #3b82f6;
                    background: #fff;
                    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
                }
                .form-input:disabled, .form-select:disabled {
                    background: #f1f5f9;
                    color: #94a3b8;
                    cursor: not-allowed;
                }
                .form-select {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.9rem center;
                    background-color: #f8faff;
                    cursor: pointer;
                }

                .pw-wrap { position: relative; }
                .pw-wrap .form-input { padding-right: 2.8rem; }
                .eye-btn {
                    position: absolute;
                    right: 0.75rem; top: 50%;
                    transform: translateY(-50%);
                    background: none; border: none;
                    color: #94a3b8; cursor: pointer;
                    display: flex; padding: 0.2rem;
                    transition: color 0.15s;
                }
                .eye-btn:hover { color: #3b82f6; }

                .error-msg {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.65rem 0.9rem;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 9px;
                    font-size: 0.78rem;
                    color: #dc2626;
                    margin-bottom: 0.75rem;
                }
                .error-msg::before { content: '⚠'; }

                .success-msg {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.75rem 0.9rem;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                    border-radius: 9px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: #16a34a;
                    margin-bottom: 0.75rem;
                }

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
                    margin-top: 0.5rem;
                }
                .submit-btn:hover:not(:disabled) {
                    opacity: 0.92;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(15,44,107,0.4);
                }
                .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

                .spinner {
                    width: 15px; height: 15px;
                    border: 2px solid rgba(255,255,255,0.35);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                .login-link {
                    text-align: center;
                    font-size: 0.78rem;
                    color: #94a3b8;
                    margin-top: 1.25rem;
                }
                .login-link a {
                    color: #1e50b5;
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .login-link a:hover { color: #0f2c6b; }
            `}</style>

            <div className="reg-page">
                <div className="reg-bg"><div className="reg-bg-grid" /></div>

                <div className="reg-card">
                    <div className="reg-card-header">
                        <div className="reg-icon">
                            <UserPlus size={22} />
                        </div>
                        <div>
                            <div className="reg-title">Registrasi Mahasiswa</div>
                            <div className="reg-subtitle">Buat akun baru untuk mengakses sistem</div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                            Memuat data...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group full">
                                <label className="form-label">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="nama"
                                    className="form-input"
                                    placeholder="Masukkan nama lengkap"
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">NIM</label>
                                    <input
                                        type="text"
                                        name="identifier"
                                        className="form-input"
                                        placeholder="Nomor Induk Mahasiswa"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <div className="pw-wrap">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className="form-input"
                                            placeholder="Buat password"
                                            onChange={handleChange}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="eye-btn"
                                            onClick={() => setShowPassword(s => !s)}
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group full">
                                <label className="form-label">Jurusan</label>
                                <select className="form-select" value={selectedJurusan} onChange={handleJurusanChange} required>
                                    <option value="">— Pilih Jurusan —</option>
                                    {jurusanList.map(j => (
                                        <option key={j.id} value={j.id}>{j.nama}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group full">
                                <label className="form-label">Program Studi</label>
                                <select
                                    name="prodiId"
                                    className="form-select"
                                    value={formData.prodiId}
                                    onChange={handleChange}
                                    disabled={!selectedJurusan}
                                    required
                                >
                                    <option value="">— Pilih Program Studi —</option>
                                    {availableProdi.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </div>

                            {error && <div className="error-msg">{error}</div>}
                            {success && (
                                <div className="success-msg">
                                    <CheckCircle2 size={16} />
                                    {success}
                                </div>
                            )}

                            <button type="submit" className="submit-btn" disabled={isSubmitting || !!success}>
                                {isSubmitting
                                    ? <><div className="spinner" /> Mendaftarkan...</>
                                    : <><UserPlus size={16} /> Daftar Sekarang</>
                                }
                            </button>
                        </form>
                    )}

                    <div className="login-link">
                        Sudah punya akun?{' '}
                        <Link href="/login">Masuk di sini</Link>
                    </div>
                </div>
            </div>
        </>
    );
}