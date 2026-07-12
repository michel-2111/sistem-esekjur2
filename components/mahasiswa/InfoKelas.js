// components/mahasiswa/InfoKelas.js
import { useState } from 'react';
import { Download, Info, MapPin, Clock, BookOpen } from 'lucide-react';
import UserInfoModal from '../shared/UserInfoModal';

const KelasInfoCard = ({ applicationCourse }) => {
    const [viewingUser, setViewingUser] = useState(null);
    const [userDetail, setUserDetail] = useState(null);
    const { course, dosen } = applicationCourse;

    const showDosenInfo = async () => {
        if (!dosen) return;
        try {
            const res = await fetch(`/api/users/${dosen.id}`);
            const data = await res.json();
            if (res.ok) { setUserDetail(data); setViewingUser(true); }
        } catch (error) {
            console.error('Failed to fetch user details', error);
        }
    };

    const hasMaterial = !!applicationCourse.materi_url;

    return (
        <>
            <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col overflow-hidden">
                {/* Card header accent */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />

                <div className="p-5 flex flex-col flex-1">
                    {/* Course title */}
                    <div className="mb-4">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-slate-800 text-base leading-snug">{course.nama}</h3>
                                <span className="inline-block mt-1 text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    {course.kode}
                                </span>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <BookOpen size={16} className="text-indigo-500" />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2.5 flex-1">
                        {/* Dosen */}
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                <span className="text-slate-700 truncate font-medium">
                                    {dosen ? dosen.nama : <span className="text-slate-400 font-normal italic">Belum ditugaskan</span>}
                                </span>
                                {dosen && (
                                    <button
                                        onClick={showDosenInfo}
                                        className="flex-shrink-0 p-1 rounded-md text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Lihat info dosen"
                                    >
                                        <Info size={13} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Ruang */}
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <MapPin size={13} className="text-slate-500" />
                            </div>
                            <span className={`truncate ${applicationCourse.ruang ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                {applicationCourse.ruang || 'Belum diatur'}
                            </span>
                        </div>

                        {/* Jadwal */}
                        <div className="flex items-center gap-2.5 text-sm">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <Clock size={13} className="text-slate-500" />
                            </div>
                            <span className={`truncate ${applicationCourse.jadwal ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                {applicationCourse.jadwal || 'Belum diatur'}
                            </span>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="mt-5 pt-4 border-t border-slate-100">
                        <a
                            href={applicationCourse.materi_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={!hasMaterial ? 'pointer-events-none' : ''}
                            tabIndex={!hasMaterial ? -1 : undefined}
                        >
                            <button
                                disabled={!hasMaterial}
                                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-150 ${
                                    hasMaterial
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Download size={14} />
                                {hasMaterial ? 'Akses Materi' : 'Materi Belum Tersedia'}
                            </button>
                        </a>
                    </div>
                </div>
            </div>

            {viewingUser && <UserInfoModal user={userDetail} onClose={() => setViewingUser(null)} />}
        </>
    );
};

export default function InfoKelas({ application }) {
    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Informasi Kelas</h1>
                <p className="text-sm text-slate-500 mt-1">Detail mata kuliah yang Anda ikuti semester ini.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.application_courses.map(ac => (
                    <KelasInfoCard key={ac.course.id} applicationCourse={ac} />
                ))}
            </div>
        </div>
    );
}