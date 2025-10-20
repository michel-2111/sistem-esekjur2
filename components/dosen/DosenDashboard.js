// components/dosen/DosenDashboard.js
import { BookUser, Users, GraduationCap, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

// Kartu Statistik
const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full bg-opacity-20 ${color.bg}`}>
            <Icon className={`h-6 w-6 ${color.text}`} />
        </div>
        <div className="ml-4">
            <p className="text-gray-600 text-sm">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

// Kartu Jadwal
const ScheduleCard = ({ classes }) => (
    <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2 flex items-center">
            <Calendar className="mr-2"/> Jadwal Mendatang
        </h2>
        {classes.length > 0 ? (
            <ul className="space-y-2">
                {classes.map(course => (
                    <li key={course.id} className="p-3 bg-white rounded-md shadow-sm">
                        <p className="font-bold">{course.nama}</p>
                        <p className="text-sm text-gray-600">{course.jadwal} - Ruang: {course.ruang}</p>
                    </li>
                ))}
            </ul>
        ) : (
            <p className="text-sm">Tidak ada jadwal mendatang yang telah diatur.</p>
        )}
    </div>
);


export default function DosenDashboard() {
    const [data, setData] = useState({ stats: { courseCount: 0, studentCount: 0, sksCount: 0 }, upcomingClasses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dosen/dashboard')
            .then(res => res.json())
            .then(data => setData(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <p>Memuat statistik...</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Dosen</h1>
            <ScheduleCard classes={data.upcomingClasses} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-700">
                <StatCard icon={BookUser} label="Mata Kuliah Diampu" value={data.stats.courseCount} color={{bg: 'bg-green-100', text: 'text-green-600'}} />
                <StatCard icon={Users} label="Total Mahasiswa" value={data.stats.studentCount} color={{bg: 'bg-blue-100', text: 'text-blue-600'}} />
                <StatCard icon={GraduationCap} label="Total SKS Diampu" value={data.stats.sksCount} color={{bg: 'bg-purple-100', text: 'text-purple-600'}} />
            </div>
        </div>
    );
}