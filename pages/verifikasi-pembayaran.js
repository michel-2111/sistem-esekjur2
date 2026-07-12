// pages/verifikasi-pembayaran.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import VerificationModal from '../components/sekjur/VerificationModal';
import { ClipboardCheck, Clock, Search, Users } from 'lucide-react';

export default function VerifikasiPembayaranPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        fetch('/api/sekjur/verifikasi')
            .then(res => res.json())
            .then(data => { setApplications(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, [isAuthenticated, router]);

    const handleUpdate = (appId) => setApplications(prev => prev.filter(app => app.id !== appId));

    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p>Anda tidak memiliki akses ke halaman ini.</p></Layout>;
    }

    const filtered = applications.filter(app =>
        app.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.mahasiswa.identifier.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Sekretaris Jurusan</p>
                        <h1 className="text-2xl font-bold text-slate-900">Verifikasi Pembayaran</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Semester Antara — tinjau dan validasi bukti transfer mahasiswa</p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                        <span className="text-sm font-semibold text-amber-700">{applications.length} Menunggu Verifikasi</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama atau NIM..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Users className="h-3.5 w-3.5" />
                            <span>{filtered.length} mahasiswa</span>
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mb-3" />
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mahasiswa</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">NIM</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal Unggah</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.length > 0 ? filtered.map(app => (
                                        <tr key={app.id} className="hover:bg-slate-50/70 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-blue-600">
                                                            {app.mahasiswa.nama.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-800">{app.mahasiswa.nama}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                    {app.mahasiswa.identifier}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(app.tanggal_pembayaran).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                                                >
                                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                                    Tinjau
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-16">
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <ClipboardCheck className="h-8 w-8 text-slate-300" />
                                                    <p className="text-sm font-medium">Semua pembayaran telah diverifikasi</p>
                                                    <p className="text-xs">Tidak ada pengajuan yang menunggu saat ini.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedApp && (
                <VerificationModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </Layout>
    );
}