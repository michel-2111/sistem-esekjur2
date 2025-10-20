// components/sekjur/akademik/AddEditCourseModal.js
import { useState, useEffect } from 'react';

export default function AddEditCourseModal({ isOpen, onClose, onSave, initialData, dosenList }) {
    const [kode, setKode] = useState('');
    const [nama, setNama] = useState('');
    const [sks, setSks] = useState('');
    const [pengampuIds, setPengampuIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const isEdit = !!initialData;

    useEffect(() => {
        if (isOpen) {
            setKode(initialData?.kode || '');
            setNama(initialData?.nama || '');
            setSks(initialData?.sks || '');
            setPengampuIds(initialData?.pengampu?.map(p => p.dosen_id) || []);
            setSearchTerm('');
        }
    }, [isOpen, initialData]);

    const handleDosenToggle = (dosenId) => {
        setPengampuIds(prev =>
            prev.includes(dosenId) ? prev.filter(id => id !== dosenId) : [...prev, dosenId]
        );
    };

    const handleSave = () => {
        if (!kode.trim() || !nama.trim() || !sks) {
            alert('Kode MK, Nama, dan SKS wajib diisi.');
            return;
        }
        onSave({ id: initialData?.id, kode, nama, sks: parseInt(sks), pengampuIds });
    };

    if (!isOpen) return null;
    
    const filteredDosen = dosenList.filter(dosen =>
        dosen.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Tambah'} Mata Kuliah</h2>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Kode MK</label>
                            <input type="text" value={kode} onChange={e => setKode(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Mata Kuliah</label>
                            <input type="text" value={nama} onChange={e => setNama(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">SKS</label>
                            <input type="number" value={sks} onChange={e => setSks(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dosen Pengampu</label>
                            <input type="text" placeholder="Cari dosen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                            <div className="mt-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                                {filteredDosen.map(dosen => (
                                    <label key={dosen.id} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded">
                                        <input type="checkbox" checked={pengampuIds.includes(dosen.id)} onChange={() => handleDosenToggle(dosen.id)} className="h-4 w-4 rounded text-blue-600" />
                                        <span>{dosen.nama}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
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