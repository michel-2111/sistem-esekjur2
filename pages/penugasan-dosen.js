// pages/penugasan-dosen.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import AssignmentModal from '../components/kaprodi/AssignmentModal';
import { ClipboardX, UserPlus, BookOpen, Users, Search } from 'lucide-react';

export default function PenugasanDosenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/kaprodi/penugasan');
            setApplications(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else fetchData();
    }, [isAuthenticated, router]);

    const handleSaveSuccess = (appId) => {
        setApplications(prev => prev.filter(app => app.id !== appId));
    };

    if (!user || user.selectedRole !== 'kaprodi') {
        return <Layout><p>Hanya Kaprodi yang dapat mengakses halaman ini.</p></Layout>;
    }

    const filtered = applications.filter(app =>
        app.mahasiswa.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Kaprodi</p>
                        <h1 className="text-2xl font-bold text-slate-900">Penugasan Dosen</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Tugaskan dosen pengampu untuk setiap mata kuliah mahasiswa</p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 shrink-0">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-700">{applications.length} Menunggu Penugasan</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Cari nama mahasiswa..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>
                        <p className="text-xs text-slate-400 shrink-0">{filtered.length} mahasiswa</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <div className="h-7 w-7 rounded-full border-2 border-slate-200 border-t-blue-500 animate-spin mb-3" />
                            <p className="text-sm">Memuat data...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mahasiswa</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mata Kuliah Diajukan</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map(app => (
                                        <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                        <span className="text-xs font-bold text-blue-600">
                                                            {app.mahasiswa.nama.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">{app.mahasiswa.nama}</p>
                                                        <p className="text-xs text-slate-400 font-mono">{app.mahasiswa.identifier}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {app.application_courses.map(({ course }) => (
                                                        <span key={course.id} className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full">
                                                            <BookOpen className="h-3 w-3" />{course.nama}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm"
                                                >
                                                    <UserPlus className="h-3.5 w-3.5" />
                                                    Tugaskan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                            <ClipboardX className="h-8 w-8 text-slate-300 mb-2" />
                            <p className="text-sm font-medium">Semua penugasan telah selesai</p>
                            <p className="text-xs">Tidak ada pengajuan yang menunggu saat ini.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedApp && (
                <AssignmentModal
                    application={selectedApp}
                    onClose={() => setSelectedApp(null)}
                    onSaveSuccess={handleSaveSuccess}
                />
            )}
        </Layout>
    );
}