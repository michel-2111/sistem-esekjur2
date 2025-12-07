// components/sekjur/manajemen-dosen/DosenFormModal.js
import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function DosenFormModal({ isOpen, onClose, onSubmit, initialData, prodiList, isSubmitting }) {
    // State lokal form
    const [formData, setFormData] = useState({ id: '', nama: '', nip: '', prodi_id: '', password: '' });

    // Efek untuk mengisi form saat mode edit (initialData berubah)
    useEffect(() => {
        if (initialData) {
            setFormData({
                id: initialData.id,
                nama: initialData.nama,
                nip: initialData.identifier,
                prodi_id: initialData.prodi_id || '',
                password: '' // Password selalu kosong saat edit
            });
        } else {
            // Reset form untuk mode tambah
            setFormData({ id: '', nama: '', nip: '', prodi_id: '', password: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const isEditMode = !!initialData;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">{isEditMode ? 'Edit Data Dosen' : 'Tambah Dosen Baru'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input 
                            type="text" required 
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.nama}
                            onChange={e => setFormData({...formData, nama: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIP (Sebagai Username)</label>
                        <input 
                            type="text" required 
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.nip}
                            onChange={e => setFormData({...formData, nip: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Studi</label>
                        <select 
                            required 
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.prodi_id}
                            onChange={e => setFormData({...formData, prodi_id: e.target.value})}
                        >
                            <option value="">-- Pilih Prodi --</option>
                            {prodiList.map(prodi => (
                                <option key={prodi.id} value={prodi.id}>{prodi.nama}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password {isEditMode && <span className="text-xs text-gray-500 font-normal">(Kosongkan jika tidak ingin mengubah)</span>}
                        </label>
                        <input 
                            type="password" 
                            required={!isEditMode} 
                            className="w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                            placeholder={!isEditMode ? "Masukkan password awal" : "Masukkan password baru"}
                        />
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50">
                            <Save size={16} className="mr-2" />
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}