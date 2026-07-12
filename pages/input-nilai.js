// pages/input-nilai.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import GradeInputRow from '../components/dosen/GradeInputRow';
import PeriodBanner from '../components/shared/PeriodBanner';
import { Edit3, Users, BookOpen, ShieldOff, Lock } from 'lucide-react';

function EmptyState() {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                <Edit3 className="w-7 h-7 text-indigo-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">Tidak Ada Data</h3>
            <p className="text-sm text-gray-400 max-w-xs">
                Tidak ada mahasiswa yang perlu dinilai pada periode ini.
            </p>
        </div>
    );
}

function CourseCard({ kelas, onSave }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Card header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(to right, #eff6ff, #ffffff)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">{kelas.nama}</h2>
                        <p className="text-xs text-gray-400 font-mono">ID: {kelas.course_id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{kelas.students.length} mahasiswa</span>
                    </div>
                    {kelas.kelas_selesai && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' }}>
                            <Lock className="w-3 h-3" />
                            Selesai
                        </span>
                    )}
                </div>
            </div>

            {/* GradeInputRow list — langsung pakai komponen Anda */}
            <div className="divide-y divide-slate-50">
                {kelas.students.map(student => (
                    <GradeInputRow
                        key={student.mahasiswa_id}
                        student={student}
                        courseId={kelas.course_id}
                        onSave={onSave}
                        isKelasSelesai={kelas.kelas_selesai}
                    />
                ))}
            </div>
        </div>
    );
}

export default function InputNilaiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        Promise.all([
            fetch('/api/dosen/penilaian').then(r => r.json()),
            fetch('/api/periode/aktif').then(r => r.json()).catch(() => null),
        ])
            .then(([kelasData, periodeData]) => {
                setClasses(kelasData);
                setPeriod(periodeData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [isAuthenticated, router]);

    const handleSaveGrade = async (gradeData) => {
        const res = await fetch('/api/dosen/penilaian', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gradeData),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Gagal menyimpan nilai.');
        }
    };

    if (!user || user.selectedRole !== 'dosen') {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                        <ShieldOff className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600">Hanya Dosen yang dapat mengakses halaman ini.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Page header */}
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">Penilaian</p>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Input Nilai Mahasiswa</h1>
            </div>

            <PeriodBanner period={period} />

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="flex flex-col items-center gap-3">
                        <span className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Memuat data...</p>
                    </div>
                </div>
            ) : classes.length > 0 ? (
                <div className="space-y-5">
                    {classes.map(kelas => (
                        <CourseCard key={kelas.course_id} kelas={kelas} onSave={handleSaveGrade} />
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}
        </Layout>
    );
}