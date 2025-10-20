// components/shared/ProfileModal.js
import { useState, useEffect } from 'react';
import { X, Save, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext'; // Correct path

// Helper component for displaying messages
const MessageDisplay = ({ message }) => {
    if (!message.text) return null;
    const color = message.type === 'success' ? 'text-green-600' : 'text-red-600';
    return <p className={`text-sm ${color} mt-2`}>{message.text}</p>;
};

export default function ProfileModal({ isOpen, onClose }) {
    const { user, login } = useAppContext();
    const [activeTab, setActiveTab] = useState('profil');
    const [profileData, setProfileData] = useState({
        nama: '', telepon: '', nomor_rekening: '',
        identifier: '', jurusan: 'N/A', prodi: 'N/A',
    });
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (isOpen && user) {
            const isMahasiswa = user.roles.includes('mahasiswa');
            const jurusanNama = user.jurusan?.nama || user.prodi?.jurusan?.nama || 'N/A';
            const prodiNama = user.prodi?.nama || 'N/A';

            setProfileData({
                nama: user.nama || '',
                telepon: user.telepon || '',
                nomor_rekening: isMahasiswa ? '' : user.nomor_rekening || '',
                identifier: user.identifier || '',
                jurusan: jurusanNama,
                prodi: prodiNama,
            });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setProfileMessage({ type: '', text: '' });
            setPasswordMessage({ type: '', text: '' });
            setActiveTab('profil');
        }
    }, [isOpen, user]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleProfileSave = async () => {
        setProfileMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: profileData.nama,
                    telepon: profileData.telepon,
                    nomor_rekening: profileData.nomor_rekening
                }),
            });
            const updatedUserFromServer = await res.json();
            if (!res.ok) throw new Error(updatedUserFromServer.message);

            const updatedUserForContext = {
                ...user,
                nama: updatedUserFromServer.nama,
                telepon: updatedUserFromServer.telepon,
                nomor_rekening: updatedUserFromServer.nomor_rekening,
                prodi: user.prodi, 
                jurusan: user.jurusan, 
            };
            login(updatedUserForContext);

            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.message || 'Gagal menyimpan profil.' });
        }
    };

    const handlePasswordSave = async () => {
        setPasswordMessage({ type: '', text: '' });
        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwords),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message || 'Gagal mengubah password.' });
        }
    };

    const isMahasiswa = user?.roles?.includes('mahasiswa');
    const inputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md";
    const inputDisabledClass = "mt-1 w-full p-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center border-b px-6 pt-4">
                    <div className="flex space-x-6">
                        <button
                            className={`pb-3 px-1 text-sm font-medium ${activeTab === 'profil' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('profil')}
                        >
                            Profil
                        </button>
                        <button
                            className={`pb-3 px-1 text-sm font-medium ${activeTab === 'keamanan' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('keamanan')}
                        >
                            Keamanan
                        </button>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mb-2"><X size={24} /></button>
                </div>

                <div className="p-6 overflow-y-auto text-gray-900">
                    {activeTab === 'profil' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Edit Profil</h3>
                            <p className="text-sm text-gray-600">Buat perubahan pada profil Anda. Klik simpan jika sudah selesai.</p>
                            <MessageDisplay message={profileMessage} />

                            <div><label className="text-sm font-medium">Nama Lengkap</label><input type="text" name="nama" value={profileData.nama} onChange={handleProfileChange} className={inputClass} /></div>
                            <div><label className="text-sm font-medium">Nomor Telepon</label><input type="tel" name="telepon" value={profileData.telepon} onChange={handleProfileChange} className={inputClass} /></div>
                            {!isMahasiswa && <div><label className="text-sm font-medium">Nomor Rekening</label><input type="text" name="nomor_rekening" value={profileData.nomor_rekening} onChange={handleProfileChange} className={inputClass} /></div>}

                            <div><label className="text-sm font-medium">{isMahasiswa ? 'NIM' : 'NIP/NIDN'}</label><input type="text" value={profileData.identifier} className={inputDisabledClass} readOnly /></div>
                            <div><label className="text-sm font-medium">Jurusan</label><input type="text" value={profileData.jurusan} className={inputDisabledClass} readOnly /></div>
                            {profileData.prodi !== 'N/A' && <div><label className="text-sm font-medium">Program Studi</label><input type="text" value={profileData.prodi} className={inputDisabledClass} readOnly /></div>}
                        </div>
                    )}

                    {activeTab === 'keamanan' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Ganti Password</h3>
                            <p className="text-sm text-gray-600">Untuk keamanan, masukkan password lama Anda sebelum membuat password baru.</p>
                            <MessageDisplay message={passwordMessage} />
                            <div><label className="text-sm font-medium">Password Lama</label><input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordChange} className={inputClass} /></div>
                            <div><label className="text-sm font-medium">Password Baru</label><input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className={inputClass} /></div>
                            <div><label className="text-sm font-medium">Konfirmasi Password Baru</label><input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className={inputClass} /></div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-white text-gray-700 font-semibold px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 text-sm">Batal</button>
                    {activeTab === 'profil' && <button onClick={handleProfileSave} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 text-sm"><Save size={16} className="mr-2"/> Simpan Perubahan</button>}
                    {activeTab === 'keamanan' && <button onClick={handlePasswordSave} className="flex items-center bg-blue-600 text-white font-semibold px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 text-sm"><ShieldCheck size={16} className="mr-2"/> Simpan Password</button>}
                </div>
            </div>
        </div>
    );
}