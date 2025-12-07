// pages/manajemen-dokumen.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SendDocumentModal from '../components/sekjur/SendDocumentModal';
import EditTemplateModal from '../components/sekjur/EditTemplateModal';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { FileUp, Edit3, Download } from 'lucide-react';

// --- Komponen Tambahan untuk Read More / Show Less ---
const ExpandableText = ({ text, maxLength = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text) return <span>-</span>;

    // Jika teks lebih pendek dari batas, tampilkan biasa
    if (text.length <= maxLength) {
        return <span>{text}</span>;
    }

    return (
        <div>
            <span>
                {isExpanded ? text : `${text.substring(0, maxLength)}...`}
            </span>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="ml-1 text-blue-600 hover:text-blue-800 font-semibold hover:underline focus:outline-none"
            >
                {isExpanded ? '(Sembunyikan)' : '(Selengkapnya)'}
            </button>
        </div>
    );
};
// ---------------------------------------------------

export default function ManajemenDokumenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [data, setData] = useState({ templates: [], sentDocuments: [], recipients: [] });
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sekjur/dokumen');
            if (!res.ok) throw new Error('Gagal memuat data.');
            const jsonData = await res.json();
            
            // Pastikan recipients selalu array untuk menghindari error map
            const safeSentDocuments = jsonData.sentDocuments.map(doc => ({
                ...doc,
                recipients: Array.isArray(doc.recipients) ? doc.recipients : []
            }));

            setData({ ...jsonData, sentDocuments: safeSentDocuments });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else if (user?.selectedRole === 'sekjur') {
            fetchData();
        }
    }, [isAuthenticated, router, user]);

    const handleSaveDocument = async (payload) => {
        const formData = new FormData();
        formData.append('file', payload.file);
        formData.append('title', payload.title);
        formData.append('isTemplate', payload.isTemplate);
        formData.append('templateType', payload.templateType);
        formData.append('recipientIds', JSON.stringify(payload.recipientIds));
        
        await fetch('/api/sekjur/dokumen', { method: 'POST', body: formData });
        fetchData(); // Refresh data setelah berhasil
    };

    const handleUpdateTemplate = async (templateId, file) => {
        const formData = new FormData();
        formData.append('action', 'UPDATE_TEMPLATE');
        formData.append('templateId', templateId);
        formData.append('file', file);
        
        await fetch('/api/sekjur/dokumen', { method: 'POST', body: formData });
        fetchData(); // Refresh data
    };

    const openEditModal = (template) => {
        setTemplateToEdit(template);
        setIsEditModalOpen(true);
    };

    if (!user || user.selectedRole !== 'sekjur') {
        return <Layout><p>Hanya Sekjur yang dapat mengakses halaman ini.</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Manajemen Dokumen</h1>
            <div className="space-y-8 ">
                {/* Bagian Template Dokumen */}
                <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
                    <h2 className="text-xl font-bold mb-4">Template Dokumen</h2>
                    {loading ? <p>Loading...</p> : (
                        <ul className="space-y-2">
                            {data.templates.map(template => (
                                <li key={template.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span>{template.title}</span>
                                    <button onClick={() => openEditModal(template)} className="text-yellow-600 hover:underline text-sm flex items-center">
                                        <Edit3 size={14} className="mr-1" /> Ubah File
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Bagian Riwayat Kirim */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4 text-gray-900">
                        <h2 className="text-xl font-bold">Riwayat Dokumen Terkirim</h2>
                        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm"><FileUp size={16} className="mr-1" /> Kirim Baru</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900">
                                <tr>
                                    <th className="p-3 w-1/4">Judul Dokumen</th>
                                    <th className="p-3 w-1/2">Penerima</th>
                                    <th className="p-3 w-1/6">Tanggal Kirim</th>
                                    <th className="p-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.sentDocuments.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="p-3 font-bold text-gray-900 align-top">{doc.title}</td>
                                        
                                        {/* --- Update Bagian Ini: Menggunakan ExpandableText --- */}
                                        <td className="p-3 text-xs text-gray-900 align-top">
                                            <ExpandableText 
                                                text={doc.recipients.map(r => r.user.nama).join(', ')} 
                                                maxLength={120} 
                                            />
                                        </td>
                                        {/* --------------------------------------------------- */}

                                        <td className="p-3 font-medium text-gray-900 align-top">
                                            {new Date(doc.timestamp).toLocaleString('id-ID')}
                                        </td>
                                        <td className="p-3 align-top text-center">
                                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center justify-center">
                                                <Download size={14} className="mr-1" /> Unduh
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.sentDocuments.length === 0 && <p className="text-center text-gray-500 py-6">Belum ada dokumen yang dikirim.</p>}
                    </div>
                </div>
            </div>

            <SendDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDocument}
                recipientList={data.recipients}
            />

            <EditTemplateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateTemplate}
                template={templateToEdit}
            />
        </Layout>
    );
}