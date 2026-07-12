// pages/panitia/validasi-proposal.js
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

export default function ValidasiProposalPanitia() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ta/approval-proposal');
            if (res.ok) setProposals(await res.json());
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else fetchData();
    }, [isAuthenticated, router]);

    const handleAction = async (appId, action) => {
        if (!confirm(`Yakin ingin men ${action === 'approve' ? 'yetujui' : 'olak'} proposal ini?`)) return;
        
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/ta/approval-proposal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId, action, feedback: action === 'reject' ? 'Proposal ditolak.' : '' }), // Sederhana dulu
            });
            if (!res.ok) throw new Error('Gagal');
            alert('Berhasil!');
            fetchData();
        } catch (err) { alert(err.message); }
        finally { setIsSubmitting(false); }
    };

    if (!user || user.selectedRole !== 'kaprodi') return <Layout><p>Akses Ditolak</p></Layout>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Validasi Proposal TA</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                        {loading ? <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr> : 
                        proposals.map(p => (
                            <tr key={p.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{p.mahasiswa.nama}</div>
                                    <div className="text-sm text-gray-500">{p.mahasiswa.prodi.nama}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={p.proposal_title}>
                                    {p.proposal_title}
                                </td>
                                <td className="px-6 py-4">
                                    <a href={p.proposal_file_url} target="_blank" className="text-blue-600 hover:underline flex items-center text-sm">
                                        <FileText size={14} className="mr-1"/> PDF
                                    </a>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 text-xs font-semibold rounded-full ${
                                        p.proposal_status === 'disetujui' ? 'bg-green-100 text-green-800' : 
                                        p.proposal_status === 'ditolak' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {p.proposal_status === 'menunggu_persetujuan' ? 
                                            (p.approved_by_panitia ? 'Menunggu Kaprodi' : 'Perlu Validasi') 
                                            : p.proposal_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {p.proposal_status === 'menunggu_persetujuan' && !p.approved_by_kaprodi && (
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleAction(p.id, 'approve')} disabled={isSubmitting} className="text-green-600 hover:text-green-800">
                                                <CheckCircle size={20} />
                                            </button>
                                            <button onClick={() => handleAction(p.id, 'reject')} disabled={isSubmitting} className="text-red-600 hover:text-red-800">
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    )}
                                    {p.approved_by_kaprodi && p.proposal_status !== 'disetujui' && <span className="text-xs text-gray-500">Sudah divalidasi</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}