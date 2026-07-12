// components/shared/ProfileModal.js
import { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, User, Lock, GraduationCap, Phone, CreditCard, IdCard } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const MessageDisplay = ({ message }) => {
    if (!message.text) return null;
    const isSuccess = message.type === 'success';
    return (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg border ${
            isSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {message.text}
        </div>
    );
};

const FieldGroup = ({ label, icon: Icon, children }) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {Icon && <Icon size={12} />}
            {label}
        </label>
        {children}
    </div>
);

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
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            const isMahasiswa = user.roles.includes('mahasiswa');
            setProfileData({
                nama: user.nama || '',
                telepon: user.telepon || '',
                nomor_rekening: isMahasiswa ? '' : user.nomor_rekening || '',
                identifier: user.identifier || '',
                jurusan: user.jurusan?.nama || user.prodi?.jurusan?.nama || 'N/A',
                prodi: user.prodi?.nama || 'N/A',
            });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setProfileMessage({ type: '', text: '' });
            setPasswordMessage({ type: '', text: '' });
            setActiveTab('profil');
        }
    }, [isOpen, user]);

    const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
    const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleProfileSave = async () => {
        setProfileMessage({ type: '', text: '' });
        setSaving(true);
        try {
            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama: profileData.nama, telepon: profileData.telepon, nomor_rekening: profileData.nomor_rekening }),
            });
            const updatedUserFromServer = await res.json();
            if (!res.ok) throw new Error(updatedUserFromServer.message);
            login({ ...user, ...updatedUserFromServer, prodi: user.prodi, jurusan: user.jurusan });
            setProfileMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.message || 'Gagal menyimpan profil.' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        setPasswordMessage({ type: '', text: '' });
        setSaving(true);
        try {
            const res = await fetch('/api/profile/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwords),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah.' });
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message || 'Gagal mengubah password.' });
        } finally {
            setSaving(false);
        }
    };

    const isMahasiswa = user?.roles?.includes('mahasiswa');

    const inputBase = [
        "w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white",
        "border border-slate-200 rounded-lg",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
        "placeholder:text-slate-400"
    ].join(' ');

    const inputDisabled = [
        "w-full px-3.5 py-2.5 text-sm text-slate-400 bg-slate-50",
        "border border-slate-100 rounded-lg cursor-not-allowed select-none"
    ].join(' ');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden"
                style={{ boxShadow: '0 25px 60px -10px rgba(15,23,42,0.25)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-0 border-b border-slate-100">
                    <div className="flex gap-1">
                        {[
                            { id: 'profil', label: 'Profil', Icon: User },
                            { id: 'keamanan', label: 'Keamanan', Icon: Lock },
                        ].map(({ id, label, Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 border-b-2 -mb-px ${
                                    activeTab === id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Icon size={14} />
                                {label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="mb-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                        <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-md select-none">
                            {user?.nama?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800">{user?.nama || '—'}</p>
                            <p className="text-xs text-slate-400 capitalize">{user?.roles?.join(', ') || '—'}</p>
                        </div>
                    </div>

                    {activeTab === 'profil' && (
                        <div className="space-y-4">
                            {profileMessage.text && <MessageDisplay message={profileMessage} />}
                            <FieldGroup label="Nama Lengkap" icon={User}>
                                <input type="text" name="nama" value={profileData.nama} onChange={handleProfileChange} className={inputBase} />
                            </FieldGroup>
                            <FieldGroup label="Nomor Telepon" icon={Phone}>
                                <input type="tel" name="telepon" value={profileData.telepon} onChange={handleProfileChange} className={inputBase} />
                            </FieldGroup>
                            {!isMahasiswa && (
                                <FieldGroup label="Nomor Rekening" icon={CreditCard}>
                                    <input type="text" name="nomor_rekening" value={profileData.nomor_rekening} onChange={handleProfileChange} className={inputBase} />
                                </FieldGroup>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <FieldGroup label={isMahasiswa ? 'NIM' : 'NIP/NIDN'} icon={IdCard}>
                                    <input type="text" value={profileData.identifier} className={inputDisabled} readOnly />
                                </FieldGroup>
                                <FieldGroup label="Jurusan" icon={GraduationCap}>
                                    <input type="text" value={profileData.jurusan} className={inputDisabled} readOnly />
                                </FieldGroup>
                            </div>
                            {profileData.prodi !== 'N/A' && (
                                <FieldGroup label="Program Studi" icon={GraduationCap}>
                                    <input type="text" value={profileData.prodi} className={inputDisabled} readOnly />
                                </FieldGroup>
                            )}
                        </div>
                    )}

                    {activeTab === 'keamanan' && (
                        <div className="space-y-4">
                            {passwordMessage.text && <MessageDisplay message={passwordMessage} />}
                            <p className="text-sm text-slate-500">Masukkan password lama Anda terlebih dahulu untuk membuat password baru.</p>
                            {[
                                { name: 'oldPassword', label: 'Password Lama' },
                                { name: 'newPassword', label: 'Password Baru' },
                                { name: 'confirmPassword', label: 'Konfirmasi Password Baru' },
                            ].map(({ name, label }) => (
                                <FieldGroup key={name} label={label} icon={Lock}>
                                    <input
                                        type="password"
                                        name={name}
                                        value={passwords[name]}
                                        onChange={handlePasswordChange}
                                        className={inputBase}
                                        autoComplete="new-password"
                                    />
                                </FieldGroup>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    {activeTab === 'profil' && (
                        <button
                            onClick={handleProfileSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
                        >
                            <Save size={14} />
                            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    )}
                    {activeTab === 'keamanan' && (
                        <button
                            onClick={handlePasswordSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
                        >
                            <ShieldCheck size={14} />
                            {saving ? 'Menyimpan...' : 'Simpan Password'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}