// pages/manajemen-akademik.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import ProdiManager from '../components/sekjur/akademik/ProdiManager'; 
import CourseManager from '../components/sekjur/akademik/CourseManager';
import PeriodManager from '../components/sekjur/akademik/PeriodManager';

export default function ManajemenAkademikPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [data, setData] = useState({ prodiList: [], courseList: [], dosenList: [], period: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [akademikRes, periodRes] = await Promise.all([
                fetch('/api/sekjur/akademik'),
                fetch('/api/sekjur/periods'),
            ]);

            if (!akademikRes.ok) {
                const errorData = await akademikRes.json();
                throw new Error(`Gagal mengambil data akademik: ${errorData.message || akademikRes.statusText}`);
            }
            if (!periodRes.ok) {
                const errorData = await periodRes.json();
                throw new Error(`Gagal mengambil data periode: ${errorData.message || periodRes.statusText}`);
            }

            const akademikData = await akademikRes.json();
            const periodData = await periodRes.json();
            setData({ ...akademikData, period: periodData });

        } catch (err) {
            console.error("Fetch Data Error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else if (user?.selectedRole === 'sekjur') fetchData();
    }, [isAuthenticated, router, user]);

    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p>Hanya Sekjur yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Manajemen Akademik</h1>
            {loading ? (
                <p>Memuat data...</p> 
            ) : error ? ( 
                <p className="text-red-500 font-semibold">Error: {error}</p> 
            ) : (
                <div className="space-y-6">
                    <PeriodManager period={data.period} onDataChange={fetchData} />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <ProdiManager prodiList={data.prodiList || []} onDataChange={fetchData} /> 
                        </div>
                        <div className="lg:col-span-2">
                            <CourseManager 
                                prodiList={data.prodiList || []} 
                                courseList={data.courseList || []}
                                dosenList={data.dosenList || []}
                                onDataChange={fetchData}
                            />
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}