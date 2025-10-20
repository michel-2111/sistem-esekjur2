// components/sekjur/akademik/ProdiManager.js
import { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import AddEditProdiModal from './AddEditProdiModal';
import ConfirmationModal from '../../shared/ConfirmationModal';

export default function ProdiManager({ prodiList, onDataChange }) {
    const [isProdiModalOpen, setIsProdiModalOpen] = useState(false);
    const [prodiToEdit, setProdiToEdit] = useState(null);
    const [prodiToDelete, setProdiToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApiCall = async (action, payload) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/sekjur/akademik', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Terjadi kesalahan.');
            }
            onDataChange();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
            setIsProdiModalOpen(false);
            setProdiToDelete(null);
        }
    };

    const handleSaveProdi = (prodiData) => {
        const action = prodiData.id ? 'UPDATE_PRODI' : 'CREATE_PRODI';
        handleApiCall(action, prodiData);
    };

    const handleDeleteProdi = () => {
        handleApiCall('DELETE_PRODI', { id: prodiToDelete.id });
    };

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md h-full text-gray-900"> {/* Removed text-gray-900 as it's default */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Program Studi</h2>
                    <button
                        onClick={() => { setProdiToEdit(null); setIsProdiModalOpen(true); }}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-sm whitespace-nowrap" // Added whitespace-nowrap
                    >
                        <Plus size={16} className="mr-1" /> Tambah
                    </button>
                </div>
                <ul className="space-y-2">
                    {Array.isArray(prodiList) && prodiList.map(prodi => (
                        <li key={prodi.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                            <span className="text-gray-800">{prodi.nama}</span>
                            <div className="flex space-x-2">
                                {/* Tombol Edit saat ini dinonaktifkan karena API belum mendukungnya */}
                                {/* <button 
                                    onClick={() => { setProdiToEdit(prodi); setIsProdiModalOpen(true); }}
                                    className="p-1 text-yellow-600 hover:text-yellow-800"
                                >
                                    <Edit3 size={16} />
                                </button> */}
                                <button
                                    onClick={() => setProdiToDelete(prodi)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </li>
                    ))}

                    {(!Array.isArray(prodiList) || prodiList.length === 0) && (
                        <p className="text-center text-gray-500 py-4">Belum ada Program Studi.</p>
                    )}
                </ul>
            </div>

            <AddEditProdiModal
                isOpen={isProdiModalOpen}
                onClose={() => setIsProdiModalOpen(false)}
                onSave={handleSaveProdi}
                initialData={prodiToEdit}
            />

            <ConfirmationModal
                isOpen={!!prodiToDelete}
                onClose={() => setProdiToDelete(null)}
                onConfirm={handleDeleteProdi}
                title="Konfirmasi Hapus Prodi"
            >
                Anda yakin ingin menghapus prodi '<strong>{prodiToDelete?.nama}</strong>'? Ini akan menghapus semua mata kuliah yang terkait.
            </ConfirmationModal>
        </>
    );
}