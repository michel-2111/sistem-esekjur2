// components/mahasiswa/InfoKelas.js
import { useState } from 'react';
import { Download, Info } from 'lucide-react';
import UserInfoModal from '../shared/UserInfoModal';

const DetailRow = ({ label, children }) => (
    <div className="flex items-start text-sm">
        <span className="font-semibold text-gray-600 w-24 flex-shrink-0">{label}</span>
        <span className="text-gray-800">{children}</span>
    </div>
);

const KelasInfoCard = ({ applicationCourse }) => {
    const [viewingUser, setViewingUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const { course, dosen } = applicationCourse;

    const showDosenInfo = async () => {
        if (!dosen) return;
        try {
            const res = await fetch(`/api/users/${dosen.id}`);
            const data = await res.json();
            if (res.ok) {
                setUserDetail(data);
                setViewingUser(true);
            }
        } catch (error) {
            console.error("Failed to fetch user details", error);
        }
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md w-full h-full flex flex-col text-gray-900">
                <div>
                    <h3 className="text-xl font-bold">{course.nama}</h3>
                    <p className="text-sm text-gray-500 mb-4">{course.kode}</p>
                    <div className="space-y-3">
                        <DetailRow label="Dosen:">
                            <span className="flex items-center">
                                {dosen ? dosen.nama : 'Belum Ditugaskan'}
                                {dosen && (
                                    <button onClick={showDosenInfo} className="ml-2 text-blue-500 hover:text-blue-700">
                                        <Info size={16} />
                                    </button>
                                )}
                            </span>
                        </DetailRow>
                        <DetailRow label="Ruang:">
                            {applicationCourse.ruang || 'Belum diatur'}
                        </DetailRow>
                        <DetailRow label="Jadwal:">
                            {applicationCourse.jadwal || 'Belum diatur'}
                        </DetailRow>
                    </div>
                </div>
                <div className="mt-6 flex-grow flex items-end">
                    <a href={applicationCourse.materi_url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <button
                            disabled={!applicationCourse.materi_url}
                            className="w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm disabled:bg-gray-400"
                        >
                            <Download size={16} className="mr-2" />
                            Akses Materi
                        </button>
                    </a>
                </div>
            </div>
            {viewingUser && <UserInfoModal user={userDetail} onClose={() => setViewingUser(null)} />}
        </>
    );
};

export default function InfoKelas({ application }) {
    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Informasi Kelas</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {application.application_courses.map(ac => (
                    <KelasInfoCard key={ac.course.id} applicationCourse={ac} />
                ))}
            </div>
        </div>
    );
}