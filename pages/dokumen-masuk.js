import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { Download, Mail } from 'lucide-react';
import StatusView from '../components/mahasiswa/StatusView';

export default function DokumenMasukPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user) {
            fetch('/api/dokumen/masuk')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDocuments(data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isAuthenticated, router, user]);

    if (loading) {
        return <Layout><p>Loading...</p></Layout>;
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Dokumen Masuk</h1>
            {documents.length > 0 ? (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-900">
                                <tr>
                                    <th className="p-4 font-medium">Judul Dokumen</th>
                                    <th className="p-4 font-medium">Pengirim</th>
                                    <th className="p-4 font-medium">Tanggal Kirim</th>
                                    <th className="p-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {documents.map(doc => (
                                    <tr key={doc.id}>
                                        <td className="p-4 font-medium text-gray-700">{doc.title}</td>
                                        <td className="p-4 text-gray-700">{doc.sender.nama}</td>
                                        <td className="p-4 text-gray-700">{new Date(doc.timestamp).toLocaleString('id-ID')}</td>
                                        <td className="p-4 text-gray-700">
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                <Download size={14} className="mr-1" /> Unduh
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <StatusView message="Tidak ada dokumen yang diterima." icon={Mail} />
            )}
        </Layout>
    );
}