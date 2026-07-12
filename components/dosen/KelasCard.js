// components/dosen/KelasCard.js
import { useState } from 'react';
import { Edit3, Info, CheckCircle, XCircle, Users, Clock, MapPin, BookOpen } from 'lucide-react';
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
            onStatusChange();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <>
            <div
                className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(226,232,240,0.8)',
                }}
            >
                {/* Status bar top */}
                <div
                    className="h-1.5 w-full"
                    style={{
                        background: kelas.kelas_selesai
                            ? 'linear-gradient(90deg, #10b981, #34d399)'
                            : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                    }}
                />

                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide"
                                    style={{
                                        background: kelas.kelas_selesai ? '#d1fae5' : '#eff6ff',
                                        color: kelas.kelas_selesai ? '#065f46' : '#1d4ed8',
                                    }}
                                >
                                    {kelas.kelas_selesai ? '● Selesai' : '● Aktif'}
                                </span>
                                <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium"
                                    style={{ background: '#f1f5f9', color: '#475569' }}
                                >
                                    <BookOpen size={10} className="mr-1" />
                                    {kelas.sks} SKS
                                </span>
                            </div>
                            <h3
                                className="text-base font-bold leading-snug truncate"
                                style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif" }}
                                title={kelas.nama}
                            >
                                {kelas.nama}
                            </h3>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => onEdit(kelas)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                                style={{
                                    background: '#f8fafc',
                                    color: '#334155',
                                    border: '1px solid #e2e8f0',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                <Edit3 size={12} />
                                Atur
                            </button>

                            {kelas.kelas_selesai ? (
                                <button
                                    onClick={handleToggleKelasSelesai}
                                    disabled={isUpdatingStatus}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: '#fef9c3',
                                        color: '#854d0e',
                                        border: '1px solid #fde047',
                                    }}
                                >
                                    <XCircle size={12} />
                                    Buka Kembali
                                </button>
                            ) : (
                                <button
                                    onClick={handleToggleKelasSelesai}
                                    disabled={isUpdatingStatus}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: '#d1fae5',
                                        color: '#065f46',
                                        border: '1px solid #6ee7b7',
                                    }}
                                >
                                    <CheckCircle size={12} />
                                    Selesaikan
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Info row */}
                    <div className="flex items-center gap-4 mb-5">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                            <Clock size={12} style={{ color: '#94a3b8' }} />
                            <span>{kelas.jadwal || 'Jadwal belum diatur'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                            <MapPin size={12} style={{ color: '#94a3b8' }} />
                            <span>{kelas.ruang || 'Ruang belum diatur'}</span>
                        </div>
                    </div>

                    {/* Students section */}
                    <div
                        className="rounded-xl overflow-hidden"
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                    >
                        <div
                            className="flex items-center justify-between px-4 py-2.5"
                            style={{ borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={13} style={{ color: '#64748b' }} />
                                <span className="text-xs font-semibold" style={{ color: '#334155' }}>
                                    Daftar Mahasiswa
                                </span>
                            </div>
                            <span
                                className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: '#3b82f6', color: '#fff' }}
                            >
                                {kelas.students.length}
                            </span>
                        </div>

                        <ul className="divide-y max-h-44 overflow-y-auto" style={{ divideColor: '#e2e8f0' }}>
                            {kelas.students.length === 0 ? (
                                <li className="px-4 py-3 text-xs text-center" style={{ color: '#94a3b8' }}>
                                    Belum ada mahasiswa terdaftar
                                </li>
                            ) : (
                                kelas.students.map((student, idx) => (
                                    <li
                                        key={student.id}
                                        className="flex items-center justify-between px-4 py-2.5 group/item transition-colors duration-100"
                                        style={{ borderBottom: idx < kelas.students.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ background: '#dbeafe', color: '#2563eb' }}
                                            >
                                                {student.nama?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium" style={{ color: '#374151' }}>
                                                {student.nama}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => showStudentInfo(student.id)}
                                            className="p-1 rounded-lg transition-all duration-150"
                                            title={`Lihat detail ${student.nama}`}
                                            style={{ color: '#94a3b8' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.color = '#3b82f6';
                                                e.currentTarget.style.background = '#dbeafe';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.color = '#94a3b8';
                                                e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <Info size={14} />
                                        </button>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {viewingUser && <UserInfoModal user={userDetail} onClose={() => setViewingUser(null)} />}
        </>
    );
}