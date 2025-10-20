// components/dosen/KelasCard.js
import { useState } from 'react';
import { Edit3, Info, CheckCircle, XCircle } from 'lucide-react';
import UserInfoModal from '../shared/UserInfoModal';

export default function KelasCard({ kelas, onEdit, onStatusChange }) {
    const [viewingUser, setViewingUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const showStudentInfo = async (studentId) => {
        try {
            const res = await fetch(`/api/users/${studentId}`);
            const data = await res.json();
            if (res.ok) {
                setUserDetail(data);
                setViewingUser(true);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Gagal mengambil detail mahasiswa", error);
            alert(error.message);
        }
    };

    const handleToggleKelasSelesai = async () => {
        setIsUpdatingStatus(true);
        const newStatus = !kelas.kelas_selesai;
        try {
            const res = await fetch('/api/dosen/kelas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: kelas.course_id, status: newStatus }),
            });
            if (!res.ok) throw new Error('Gagal mengubah status kelas.');
            onStatusChange(); // Memanggil fungsi refresh data dari parent
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const SelesaikanKelasButton = () => (
        <button onClick={handleToggleKelasSelesai} disabled={isUpdatingStatus} className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md flex items-center disabled:bg-gray-400">
            <CheckCircle size={14} className="mr-1" /> Selesaikan Kelas
        </button>
    );

    const BukaKelasButton = () => (
        <button onClick={handleToggleKelasSelesai} disabled={isUpdatingStatus} className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-md flex items-center disabled:bg-gray-400">
            <XCircle size={14} className="mr-1" /> Buka Kembali Kelas
        </button>
    );

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{kelas.nama} ({kelas.sks} SKS)</h3>
                        <p className="text-sm text-gray-500">Jadwal: {kelas.jadwal || 'Belum diatur'}</p>
                        <p className="text-sm text-gray-500">Ruang: {kelas.ruang || 'Belum diatur'}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={() => onEdit(kelas)} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded-md flex items-center">
                            <Edit3 size={14} className="mr-1" /> Atur
                        </button>
                        {kelas.kelas_selesai ? <BukaKelasButton /> : <SelesaikanKelasButton />}
                    </div>
                </div>
                <div className="mt-4 border-t pt-4 text-gray-900">
                    <h4 className="font-semibold text-sm mb-2">Daftar Mahasiswa ({kelas.students.length}):</h4>
                    <ul className="space-y-2 text-sm text-gray-700 max-h-40 overflow-y-auto pr-2">
                        {kelas.students.map(student => (
                            <li key={student.id} className="flex justify-between items-center p-1 hover:bg-gray-50 rounded">
                                <span>{student.nama}</span>
                                <button 
                                    onClick={() => showStudentInfo(student.id)} 
                                    className="text-blue-500 hover:text-blue-700"
                                    title={`Lihat detail ${student.nama}`}
                                >
                                    <Info size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {viewingUser && <UserInfoModal user={userDetail} onClose={() => setViewingUser(null)} />}
        </>
    );
}