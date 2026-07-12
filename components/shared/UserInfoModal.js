// components/shared/UserInfoModal.js
import { X, Phone, CreditCard, GraduationCap, IdCard, User } from 'lucide-react';

const DetailRow = ({ label, value, icon: Icon }) => {
    if (!value) return null;
    return (
        <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
            <dt className="flex items-center gap-2 text-xs font-medium text-slate-500 shrink-0">
                {Icon && <Icon size={12} className="text-slate-400" />}
                {label}
            </dt>
            <dd className="text-sm text-slate-800 font-medium text-right truncate">{value}</dd>
        </div>
    );
};

export default function UserInfoModal({ user, onClose }) {
    if (!user) return null;

    let isMahasiswa = false;
    
    if (user.roles && user.roles.length > 0) {
        isMahasiswa = user.roles.some(r => r === 'mahasiswa' || r.role?.nama_role === 'mahasiswa');
    } else if (user.identifier) {
        isMahasiswa = user.identifier.length < 15;
    }
    const jurusanNama = user.jurusan?.nama || user.prodi?.jurusan?.nama;

    const initials = user.nama
        ?.split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase() || '?';

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
                style={{ boxShadow: '0 20px 50px -10px rgba(15,23,42,0.2)' }}
            >
                {/* Header */}
                <div className="relative bg-linear-to-br from-indigo-600 to-violet-600 px-6 pt-6 pb-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                        <X size={16} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white font-bold text-xl">
                            {initials}
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-base leading-snug">{user.nama}</h2>
                            <p className="text-indigo-200 text-xs mt-0.5 capitalize">
                                {isMahasiswa ? 'Mahasiswa' : 'Dosen'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Detail card pulls up */}
                <div className="mx-4 bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-1 mb-4 mt-4">
                    <dl>
                        <DetailRow label={isMahasiswa ? 'NIM' : 'NIP'} value={user.identifier} icon={IdCard} />
                        <DetailRow label="Jurusan" value={jurusanNama || 'N/A'} icon={GraduationCap} />
                        <DetailRow label="Program Studi" value={user.prodi?.nama} icon={GraduationCap} />
                        <DetailRow label="Nomor Telepon" value={user.telepon} icon={Phone} />
                        {!isMahasiswa && <DetailRow label="Nomor Rekening" value={user.nomor_rekening} icon={CreditCard} />}
                    </dl>
                </div>

                <div className="px-4 pb-4">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}