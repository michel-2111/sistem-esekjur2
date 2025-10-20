// components/sekjur/SendDocumentModal.js
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function SendDocumentModal({ isOpen, onClose, onSave, recipientList }) {
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [recipientIds, setRecipientIds] = useState([]);
    const [isTemplate, setIsTemplate] = useState(false);
    const [templateType, setTemplateType] = useState('cuti_form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTitle(''); setFile(null); setRecipientIds([]); setIsTemplate(false);
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!title || !file || (!isTemplate && recipientIds.length === 0)) {
            alert('Harap lengkapi semua field yang diperlukan.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave({ title, file, recipientIds, isTemplate, templateType });
            onClose();
        } catch (error) {
            alert('Gagal mengirim dokumen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const rolesForBulkSelect = ['dosen', 'kaprodi', 'wadir', 'p4m'];

    const handleSelectRole = (role, isChecked) => {
        const roleUserIds = recipientList
            .filter(u => u.roles.some(r => r.role.nama_role === role))
            .map(u => u.id);

        if (isChecked) {
            setRecipientIds(prev => [...new Set([...prev, ...roleUserIds])]);
        } else {
            setRecipientIds(prev => prev.filter(id => !roleUserIds.includes(id)));
        }
    };

    const isRoleSelected = (role) => {
        const roleUserIds = recipientList
            .filter(u => u.roles.some(r => r.role.nama_role === role))
            .map(u => u.id);
        if (roleUserIds.length === 0) return false;
        return roleUserIds.every(id => recipientIds.includes(id));
    };

    const [searchTerm, setSearchTerm] = useState('');
    const filteredRecipients = recipientList.filter(user => 
        user.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Kirim Dokumen Baru</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Judul Dokumen</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Upload File</label>
                            <input type="file" onChange={e => setFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 hover:file:bg-blue-100" />
                        </div>
                            <div>
                                <label className="block text-sm font-medium">Pilih Penerima</label>
                                <input 
                                    type="text" 
                                    placeholder="Cari nama penerima..." 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="mt-1 w-full p-2 border rounded-md" 
                                />
                                <div className="flex flex-wrap gap-x-4 gap-y-2 my-4">
                                    {rolesForBulkSelect.map(role => (
                                        <label key={role} className="flex items-center space-x-2 text-sm font-medium">
                                            <input 
                                                type="checkbox" 
                                                checked={isRoleSelected(role)}
                                                onChange={(e) => handleSelectRole(role, e.target.checked)}
                                            />
                                            <span className="capitalize font-bold">Semua {role}</span>
                                        </label>
                                    ))}
                                </div>

                                <div className="mt-2 p-2 border rounded-md max-h-48 overflow-y-auto">
                                    {filteredRecipients.map(user => (
                                        <label key={user.id} className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded">
                                            <input type="checkbox" checked={recipientIds.includes(user.id)} onChange={() => setRecipientIds(p => p.includes(user.id) ? p.filter(id => id !== user.id) : [...p, user.id])} />
                                            <span>{user.nama} <span className="text-xs text-gray-500">({user.roles.map(r => r.role.nama_role).join(', ')})</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Batal</button>
                        <button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center disabled:bg-gray-400">
                            <Send size={16} className="mr-2" /> {isSubmitting ? 'Mengirim...' : 'Kirim'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}