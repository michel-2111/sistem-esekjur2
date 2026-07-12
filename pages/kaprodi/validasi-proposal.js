// pages/panitia/validasi-proposal.js 
// (Catatan: Pastikan nama file dan path Anda sudah sesuai, meski foldernya bernama panitia namun role-nya kaprodi)

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default function ValidasiProposalKaprodi() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [proposals, setProposals] = useState([]);
    const [approvalMode, setApprovalMode] = useState('kaprodi'); // State baru untuk menyimpan mode
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ta/approval-proposal');
            if (res.ok) {
                const data = await res.json();
                // Karena API sekarang mengirimkan object { proposals, approval_mode }
                if (data.proposals) {
                    setProposals(data.proposals);
                    setApprovalMode(data.approval_mode);
                } else if (Array.isArray(data)) {
                    setProposals(data); // Fallback jika API belum terupdate
                }
            }
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, router]);

    const handleAction = async (appId, action) => {
        if (!confirm(`Yakin ingin men${action === 'approve' ? 'yetujui' : 'olak'} proposal ini?`)) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ta/approval-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId, action, feedback: action === 'reject' ? 'Proposal ditolak.' : '' }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Gagal memproses persetujuan');
            }
            alert('Berhasil diperbarui!');
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsSubmitting(false); }
    };

    if (!user || user.selectedRole !== 'kaprodi') return <Layout><p>Akses Ditolak</p></Layout>;

    // Cek apakah Kaprodi berhak memvalidasi berdasarkan pengaturan
    // Kaprodi HANYA dilarang jika modenya diset mutlak 'panitia'
    const canApprove = approvalMode !== 'panitia';

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Validasi Proposal TA (Kaprodi)</h1>
            {!canApprove && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                    <strong>Informasi:</strong> Mode validasi saat ini diatur hanya untuk <strong>Panitia</strong>. Anda dapat melihat daftar proposal, namun tidak dapat melakukan validasi.
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mahasiswa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul Proposal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? <tr><td colSpan="5" className="text-center py-4 text-gray-500">Memuat data...</td></tr> : 
                        proposals.length === 0 ? <tr><td colSpan="5" className="text-center py-4 text-gray-500">Belum ada proposal.</td></tr> :
                        proposals.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{p.mahasiswa.nama}</div>
                                    <div className="text-xs text-gray-500">{p.mahasiswa.prodi.nama}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={p.proposal_title}>
                                    {p.proposal_title}
                                </td>
                                <td className="px-6 py-4">
                                    <a href={p.proposal_file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                                        <FileText size={14} className="mr-1"/> PDF
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                        p.proposal_status === 'disetujui' ? 'bg-green-100 text-green-800' : 
                                        p.proposal_status === 'ditolak' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {p.proposal_status === 'menunggu_persetujuan' ? 
                                            (p.approved_by_panitia ? 'Menunggu Kaprodi' : 'Perlu Validasi') 
                                            : p.proposal_status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {p.proposal_status === 'menunggu_persetujuan' && !p.approved_by_kaprodi ? (
                                        canApprove ? (
                                            <div className="flex justify-center space-x-3">
                                                <button onClick={() => handleAction(p.id, 'approve')} disabled={isSubmitting} className="text-green-600 hover:text-green-800 hover:bg-green-50 p-1 rounded transition-colors" title="Setujui">
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button onClick={() => handleAction(p.id, 'reject')} disabled={isSubmitting} className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors" title="Tolak">
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Validasi oleh Panitia</span>
                                        )
                                    ) : p.approved_by_kaprodi && p.proposal_status !== 'disetujui' ? (
                                        <span className="text-xs text-blue-600 font-medium">Sudah Anda Validasi</span>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}