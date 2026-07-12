// pages/manajemen-ta/atur-panitia.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import { Save, Users, Settings, Info, ChevronDown, CheckCircle } from 'lucide-react';

const APPROVAL_OPTIONS = [
    {
        value: 'kaprodi',
        label: 'Hanya Kaprodi',
        desc: 'Cukup Kaprodi yang menyetujui proposal.',
    },
    {
        value: 'panitia',
        label: 'Hanya Panitia',
        desc: 'Cukup Panitia yang menyetujui proposal.',
    },
    {
        value: 'both',
        label: 'Wajib Keduanya',
        desc: 'Kaprodi DAN Panitia harus menyetujui.',
    },
    {
        value: 'either',
        label: 'Salah Satu (Fleksibel)',
        desc: 'Jika salah satu menyetujui, proposal dianggap sah.',
    },
];

function SectionHeader({ icon: Icon, title, color = '#3b82f6' }) {
    return (
        <div className="flex items-center gap-3 mb-6 pb-4" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color + '18' }}>
                <Icon size={17} style={{ color }} />
            </div>
            <h2 className="text-base font-bold" style={{ color: '#1e293b' }}>{title}</h2>
        </div>
    );
}

function SelectField({ label, value, onChange, options, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: '#94a3b8' }}>
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={onChange}
                    className="w-full appearance-none text-sm font-medium rounded-xl px-4 py-2.5 outline-none transition-all"
                    style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: value ? '#1e293b' : '#94a3b8',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.boxShadow = '0 0 0 3px #eff6ff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <option value="">{placeholder}</option>
                    {options.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#94a3b8' }} />
            </div>
        </div>
    );
}

function SaveButton({ onClick, disabled, loading, label, color = '#3b82f6' }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
                background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                boxShadow: `0 2px 8px ${color}40`,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
        >
            {loading ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
            ) : (
                <Save size={14} />
            )}
            {loading ? 'Menyimpan...' : label}
        </button>
    );
}

export default function AturPanitiaPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    const [lecturers, setLecturers] = useState([]);
    const [ketua, setKetua] = useState('');
    const [sekretaris, setSekretaris] = useState('');
    const [approvalMode, setApprovalMode] = useState('kaprodi');
    const [loading, setLoading] = useState(true);
    const [isSavingCommittee, setIsSavingCommittee] = useState(false);
    const [isSavingMode, setIsSavingMode] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user?.selectedRole === 'sekjur') {
            fetch('/api/sekjur/ta/panitia')
                .then(res => res.json())
                .then(data => {
                    setLecturers(data.lecturers);
                    const currentKetua = data.committee.find(c => c.position === 'ketua');
                    const currentSekretaris = data.committee.find(c => c.position === 'sekretaris');
                    if (currentKetua) setKetua(currentKetua.dosen_id);
                    if (currentSekretaris) setSekretaris(currentSekretaris.dosen_id);
                    if (data.approvalMode) setApprovalMode(data.approvalMode);
                })
                .finally(() => setLoading(false));
        }
    }, [isAuthenticated, router, user]);

    const handleSaveCommittee = async () => {
        setIsSavingCommittee(true);
        try {
            const res = await fetch('/api/sekjur/ta/panitia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'committee', ketuaId: ketua, sekretarisId: sekretaris }),
            });
            if (res.ok) alert('Susunan Panitia berhasil diperbarui!');
            else throw new Error('Gagal menyimpan');
        } catch (err) { alert(err.message); }
        finally { setIsSavingCommittee(false); }
    };

    const handleSaveMode = async () => {
        setIsSavingMode(true);
        try {
            const res = await fetch('/api/sekjur/ta/panitia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'mode', approvalMode }),
            });
            if (res.ok) alert('Mode Validasi berhasil diperbarui!');
            else throw new Error('Gagal menyimpan');
        } catch (err) { alert(err.message); }
        finally { setIsSavingMode(false); }
    };

    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p className="text-sm text-gray-500">Akses Ditolak.</p></Layout>;
    }

    return (
        <Layout>
            {/* Page Header */}
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#3b82f6' }}>
                    Manajemen TA
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#0f172a' }}>
                    Pengaturan Tugas Akhir
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Kartu 1: Susunan Panitia */}
                <div className="bg-white rounded-2xl border flex flex-col" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="p-6 flex-1">
                        <SectionHeader icon={Users} title="Susunan Panitia" color="#3b82f6" />

                        {loading ? (
                            <div className="flex items-center gap-2 py-8 justify-center">
                                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="3" strokeOpacity="0.3" />
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                                <span className="text-sm" style={{ color: '#94a3b8' }}>Memuat data...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <SelectField
                                    label="Ketua Panitia"
                                    value={ketua}
                                    onChange={e => setKetua(e.target.value)}
                                    options={lecturers}
                                    placeholder="— Pilih Dosen —"
                                />
                                <SelectField
                                    label="Sekretaris Panitia"
                                    value={sekretaris}
                                    onChange={e => setSekretaris(e.target.value)}
                                    options={lecturers}
                                    placeholder="— Pilih Dosen —"
                                />
                            </div>
                        )}
                    </div>
                    <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <SaveButton
                            onClick={handleSaveCommittee}
                            disabled={isSavingCommittee || loading}
                            loading={isSavingCommittee}
                            label="Simpan Panitia"
                            color="#3b82f6"
                        />
                    </div>
                </div>

                {/* Kartu 2: Mode Validasi */}
                <div className="bg-white rounded-2xl flex flex-col" style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div className="p-6 flex-1">
                        <SectionHeader icon={Settings} title="Mode Validasi Proposal" color="#8b5cf6" />

                        {/* Info box */}
                        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-5"
                            style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                            <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
                            <p className="text-xs leading-relaxed" style={{ color: '#6d28d9' }}>
                                Tentukan siapa yang berhak memvalidasi proposal TA mahasiswa agar statusnya menjadi <strong>Disetujui</strong>.
                            </p>
                        </div>

                        {/* Radio options */}
                        <div className="space-y-2.5">
                            {APPROVAL_OPTIONS.map(opt => {
                                const isSelected = approvalMode === opt.value;
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() => setApprovalMode(opt.value)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150"
                                        style={{
                                            background: isSelected ? '#faf5ff' : '#f8fafc',
                                            border: isSelected ? '1.5px solid #c4b5fd' : '1px solid #f1f5f9',
                                        }}
                                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f5f3ff'; }}
                                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                                    >
                                        {/* Custom radio */}
                                        <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all"
                                            style={{
                                                border: isSelected ? '2px solid #8b5cf6' : '2px solid #cbd5e1',
                                                background: isSelected ? '#8b5cf6' : 'transparent',
                                            }}>
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold" style={{ color: isSelected ? '#6d28d9' : '#334155' }}>
                                                {opt.label}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{opt.desc}</p>
                                        </div>
                                        {isSelected && <CheckCircle size={15} style={{ color: '#8b5cf6', flexShrink: 0 }} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="px-6 py-4 flex justify-end" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <SaveButton
                            onClick={handleSaveMode}
                            disabled={isSavingMode}
                            loading={isSavingMode}
                            label="Simpan Pengaturan"
                            color="#8b5cf6"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}