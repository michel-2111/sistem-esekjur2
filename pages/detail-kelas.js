// pages/detail-kelas.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import KelasCard from '../components/dosen/KelasCard';
import ScheduleModal from '../components/dosen/ScheduleModal';
import StatusView from '../components/mahasiswa/StatusView';
import { BookCopy } from 'lucide-react';

export default function DetailKelasPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingKelas, setEditingKelas] = useState(null);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/dosen/kelas');
            const data = await res.json();
            if (res.ok) {
                setClasses(data);
            }
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

    if (!user || user.selectedRole !== 'dosen') {
        return <Layout><p>Hanya Dosen yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Detail Kelas Semester Antara</h1>
            {loading ? <p>Memuat data...</p> : (
                <>
                    {classes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {classes.map(kelas => (
                                <KelasCard 
                                    key={kelas.course_id}
                                    kelas={kelas}
                                    onEdit={setEditingKelas}
                                    onStatusChange={fetchData}
                                />
                            ))}
                        </div>
                    ) : (
                        <StatusView 
                            message="Anda belum ditugaskan untuk mengampu kelas Semester Antara pada periode ini."
                            icon={BookCopy}
                        />
                    )}
                </>
            )}
            {editingKelas && (
                <ScheduleModal
                    kelas={editingKelas}
                    onClose={() => setEditingKelas(null)}
                    onSaveSuccess={fetchData}
                />
            )}
        </Layout>
    );
}