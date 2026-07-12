// pages/panitia/validasi-proposal.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import { FileText, CheckCircle, XCircle, ScrollText } from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStatusConfig = (p) => {
    if (p.proposal_status === 'disetujui')
        return { label: 'Disetujui',          bg: '#f0fdf4', color: '#065f46', border: '#bbf7d0' };
    if (p.proposal_status === 'ditolak')
        return { label: 'Ditolak',              bg: '#fef2f2', color: '#991b1b', border: '#fecaca' };
    if (p.approved_by_panitia)
        return { label: 'Menunggu Kaprodi',     bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
    return     { label: 'Perlu Validasi',       bg: '#fffbeb', color: '#92400e', border: '#fde68a' };
};

function StatusBadge({ proposal }) {
    const cfg = getStatusConfig(proposal);
    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
        >
            {cfg.label}
        </span>
    );
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ isOpen, onClose, onConfirm, isSubmitting, type, proposal }) {
    if (!isOpen) return null;
    const isApprove = type === 'approve';
    const accent      = isApprove ? '#10b981' : '#ef4444';
    const accentDark  = isApprove ? '#065f46' : '#991b1b';
    const accentBg    = isApprove ? '#f0fdf4'  : '#fef2f2';
    const accentBorder= isApprove ? '#bbf7d0'  : '#fecaca';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15,23,42,0.5)' }}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}
            >
                {/* Header */}
                <div className="px-5 py-4 flex items-center gap-3"
                    style={{ background: accentBg, borderBottom: `1px solid ${accentBorder}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: accent + '22' }}>
                        {isApprove
                            ? <CheckCircle size={20} style={{ color: accent }} />
                            : <XCircle size={20} style={{ color: accent }} />}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold" style={{ color: accentDark }}>
                            {isApprove ? 'Setujui Proposal' : 'Tolak Proposal'}
                        </p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: accent }}>
                            {proposal?.mahasiswa?.nama} — {proposal?.proposal_title}
                        </p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4 text-sm leading-relaxed" style={{ color: '#475569' }}>
                    {isApprove ? (
                        <>Proposal ini akan ditandai{' '}
                            <span className="font-semibold" style={{ color: '#10b981' }}>disetujui</span>
                            {' '}oleh Panitia dan diteruskan ke Kaprodi untuk persetujuan akhir.
                        </>
                    ) : (
                        <>Proposal ini akan{' '}
                            <span className="font-semibold" style={{ color: '#ef4444' }}>ditolak</span>
                            {' '}dan mahasiswa perlu merevisi serta mengajukan ulang proposalnya.
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex justify-end gap-2"
                    style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
                        style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            background: isApprove
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : 'linear-gradient(135deg, #ef4444, #dc2626)',
                            boxShadow: `0 2px 8px ${accent}44`,
                        }}
                        onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        ) : isApprove ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {isSubmitting ? 'Memproses...' : isApprove ? 'Ya, Setujui' : 'Ya, Tolak'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Table helpers ─────────────────────────────────────────────────────────────

const TH = ({ children, center }) => (
    <th
        className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${center ? 'text-center' : 'text-left'}`}
        style={{ color: '#94a3b8', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}
    >
        {children}
    </th>
);

const TD = ({ children, center }) => (
    <td
        className={`px-5 py-4 ${center ? 'text-center' : ''}`}
        style={{ borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' }}
    >
        {children}
    </td>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ValidasiProposalPanitia() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [proposals, setProposals] = useState([]);
    const [approvalMode, setApprovalMode] = useState('kaprodi'); // State untuk mode persetujuan
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, selectedProposal: null });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ta/approval-proposal');
            if (res.ok) {
                const data = await res.json();
                if (data.proposals) {
                    setProposals(data.proposals);
                    setApprovalMode(data.approval_mode);
                } else if (Array.isArray(data)) {
                    setProposals(data); // Fallback
                }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router]);

    const openModal  = (proposal, type) => setConfirmModal({ isOpen: true, type, selectedProposal: proposal });
    const closeModal = () => { if (!isSubmitting) setConfirmModal({ isOpen: false, type: null, selectedProposal: null }); };

    const handleConfirm = async () => {
        const { type, selectedProposal } = confirmModal;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ta/approval-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appId: selectedProposal.id,
                    action: type,
                    feedback: type === 'reject' ? 'Proposal ditolak.' : '',
                }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal memproses');
            }
            closeModal();
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsSubmitting(false); }
    };

    const needsAction = (p) => p.proposal_status === 'menunggu_persetujuan' && !p.approved_by_panitia;

    if (!user || user.selectedRole !== 'panitia') {
        return <Layout><p className="text-sm text-gray-400">Akses Ditolak.</p></Layout>;
    }

    // Penjaga akses UI: Panitia HANYA dilarang memvalidasi jika mode diset mutlak 'kaprodi'
    const canApprove = approvalMode !== 'kaprodi';

    return (
        <Layout>
            {/* Page header */}
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#3b82f6' }}>
                    Manajemen TA
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight mb-4" style={{ color: '#0f172a' }}>
                    Validasi Proposal TA
                </h1>
                
                {/* Banner Peringatan jika mode tidak mengizinkan Panitia */}
                {!canApprove && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm shadow-sm">
                        <strong>Informasi:</strong> Mode validasi saat ini diatur hanya untuk <strong>Kaprodi</strong>. Anda dapat melihat daftar proposal masuk, namun tidak dapat melakukan validasi.
                    </div>
                )}
            </div>

            {/* Table card */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <TH>Mahasiswa</TH>
                                <TH>Judul Proposal</TH>
                                <TH center>File</TH>
                                <TH center>Status</TH>
                                <TH center>Aksi</TH>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="3" strokeOpacity="0.3"/>
                                                <path d="M12 2a10 10 0 0 1 10 10" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round"/>
                                            </svg>
                                            <span className="text-sm" style={{ color: '#94a3b8' }}>Memuat data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : proposals.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                style={{ background: '#f1f5f9' }}>
                                                <ScrollText size={20} style={{ color: '#cbd5e1' }} />
                                            </div>
                                            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                                                Belum ada proposal masuk.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : proposals.map(p => (
                                <tr
                                    key={p.id}
                                    style={{ transition: 'background 0.1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafe'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Mahasiswa */}
                                    <TD>
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ background: '#eff6ff', color: '#3b82f6' }}
                                            >
                                                {p.mahasiswa.nama?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                                                    {p.mahasiswa.nama}
                                                </p>
                                                <p className="text-xs" style={{ color: '#94a3b8' }}>
                                                    {p.mahasiswa.prodi?.nama}
                                                </p>
                                            </div>
                                        </div>
                                    </TD>

                                    {/* Judul */}
                                    <TD>
                                        <p
                                            className="text-sm max-w-xs truncate"
                                            style={{ color: '#334155' }}
                                            title={p.proposal_title}
                                        >
                                            {p.proposal_title}
                                        </p>
                                    </TD>

                                    {/* File */}
                                    <TD center>
                                        <a
                                            href={p.proposal_file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                                            style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                                        >
                                            <FileText size={11} />
                                            PDF
                                        </a>
                                    </TD>

                                    {/* Status */}
                                    <TD center>
                                        <StatusBadge proposal={p} />
                                    </TD>

                                    {/* Aksi */}
                                    <TD center>
                                        {needsAction(p) ? (
                                            canApprove ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openModal(p, 'approve')}
                                                        disabled={isSubmitting}
                                                        title="Setujui proposal"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                                        style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                                                    >
                                                        <CheckCircle size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(p, 'reject')}
                                                        disabled={isSubmitting}
                                                        title="Tolak proposal"
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
                                                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}
                                                        onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                                                    >
                                                        <XCircle size={15} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Validasi oleh Kaprodi</span>
                                            )
                                        ) : p.approved_by_panitia && p.proposal_status !== 'disetujui' ? (
                                            <span
                                                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                                                style={{ background: '#f0fdf4', color: '#10b981', border: '1px solid #bbf7d0' }}
                                            >
                                                <CheckCircle size={11} />
                                                Sudah divalidasi
                                            </span>
                                        ) : null}
                                    </TD>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeModal}
                onConfirm={handleConfirm}
                isSubmitting={isSubmitting}
                type={confirmModal.type}
                proposal={confirmModal.selectedProposal}
            />
        </Layout>
    );
}