// pages/dashboard.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import DosenDashboard from '../components/dosen/DosenDashboard';
import MahasiswaDashboard from '../components/mahasiswa/MahasiswaDashboard';
import SekjurDashboard from '../components/sekjur/SekjurDashboard';
import KaprodiDashboard from '../components/kaprodi/KaprodiDashboard';
import KajurDashboard from '@/components/kajur/KajurDashboard';
import WadirDashboard from '../components/wadir/WadirDashboard';

const GenericDashboard = ({ user }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Selamat Datang, {user.nama}!</h2>
        <p className="text-gray-600 mt-2">Anda login sebagai <span className="font-medium capitalize">{user.selectedRole}</span>.</p>
    </div>
);

export default function DashboardPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    if (!user) {
        return <Layout><p>Loading...</p></Layout>;
    }
    
    const renderDashboard = () => {
        switch (user.selectedRole) {
            case 'dosen':
                return <DosenDashboard />;
            case 'mahasiswa':
                return <MahasiswaDashboard user={user} />;
            case 'sekjur':
                return <SekjurDashboard />;
            case 'kaprodi':
                return <KaprodiDashboard />;
            case 'kajur':
                return <KajurDashboard />;
            case 'wadir':
                return <WadirDashboard />;
            default:
                return ( <GenericDashboard user={user} />);
        }
    };

    return (
        <Layout>
            {renderDashboard()}
        </Layout>
    );
}