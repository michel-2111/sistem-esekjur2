// components/sekjur/akademik/AddEditProdiModal.js
import { useState, useEffect } from 'react';

export default function AddEditProdiModal({ isOpen, onClose, onSave, initialData }) {
    const [nama, setNama] = useState('');
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setNama(initialData?.nama || '');
        }
    }, [isOpen, initialData]);

    const handleSave = () => {
        if (!nama.trim()) {
            alert('Nama Program Studi tidak boleh kosong.');
            return;
        }
        onSave({ ...initialData, nama });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 transition-opacity text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Tambah'} Program Studi</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Program Studi</label>
                        <input
                            type="text"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Batal</button>
                        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Simpan</button>
                    </div>
                </div>
            </div>
        </div>
    );
}