// pages/input-nilai.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import GradeInputRow from '../components/dosen/GradeInputRow';
import StatusView from '../components/mahasiswa/StatusView';
import { Edit } from 'lucide-react';

export default function InputNilaiPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else {
            fetch('/api/dosen/penilaian')
                .then(res => res.json())
                .then(data => setClasses(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
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
        return <Layout><p>Hanya Dosen yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Input Nilai Mahasiswa</h1>
            {loading ? <p>Memuat data...</p> : (
                <div className="space-y-6">
                    {classes.length > 0 ? classes.map(kelas => (
                        <div key={kelas.course_id} className="bg-white p-6 rounded-lg shadow-md text-gray-900">
                            <h2 className="text-xl font-bold mb-4">{kelas.nama}</h2>
                            <div className="divide-y">
                                {kelas.students.map(student => (
                                    <GradeInputRow 
                                        key={student.mahasiswa_id}
                                        student={student}
                                        courseId={kelas.course_id}
                                        onSave={handleSaveGrade}
                                        isKelasSelesai={kelas.kelas_selesai}
                                    />
                                ))}
                            </div>
                        </div>
                    )) : (
                        <StatusView 
                            message="Tidak ada mahasiswa yang perlu dinilai pada periode ini."
                            icon={Edit}
                        />
                    )}
                </div>
            )}
        </Layout>
    );
}