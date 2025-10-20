// components/shared/UserInfoModal.js
import { X } from 'lucide-react';

const DetailRow = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900 text-right">{value}</dd>
        </div>
    );
};

export default function UserInfoModal({ user, onClose }) {
    if (!user) return null;

    const isMahasiswa = user.roles && user.roles.some(r => r.role.nama_role === 'mahasiswa');
    const jurusanNama = user.jurusan?.nama || user.prodi?.jurusan?.nama;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Informasi Kontak - {user.nama}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <dl className="space-y-1">
                        <DetailRow label="Nama Lengkap" value={user.nama} />
                        <DetailRow label={isMahasiswa ? 'NIM' : 'NIP'} value={user.identifier} />
                        <DetailRow label="Jurusan" value={jurusanNama || 'N/A'} />
                        <DetailRow label="Program Studi" value={user.prodi?.nama} />
                        <DetailRow label="Nomor Telepon" value={user.telepon} />
                        {!isMahasiswa && <DetailRow label="Nomor Rekening" value={user.nomor_rekening} />}
                    </dl>
                </div>
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="bg-white text-gray-700 font-semibold px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}