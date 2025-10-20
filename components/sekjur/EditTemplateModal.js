// components/sekjur/EditTemplateModal.js
import { useState } from 'react';
import { Upload } from 'lucide-react';

export default function EditTemplateModal({ isOpen, onClose, onSave, template }) {
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSave = async () => {
        if (!file) {
            alert('Silakan pilih file template yang baru.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave(template.id, file);
            onClose();
        } catch (error) {
            alert('Gagal memperbarui template.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Ubah File Template</h2>
                    <p className="mb-4 text-gray-600">Anda akan mengganti file untuk: <span className="font-medium">{template.title}</span></p>
                    <div>
                        <label className="block text-sm font-medium">Upload File Baru</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 hover:file:bg-blue-100" />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Batal</button>
                        <button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-400">
                            <Upload size={16} className="mr-2" /> {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}