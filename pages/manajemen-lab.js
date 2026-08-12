import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';

export default function ManajemenLab() {
    const { user } = useAppContext();
    // Gunakan jurusan_id dari user yang login (Sekjur), jika ada. Jika tidak, set default (contoh 'JTI').
    const jurusanId = user?.jurusan_id || 'JTI'; 

    const [labs, setLabs] = useState([]);
    const [dosenList, setDosenList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [formId, setFormId] = useState('');
    const [namaLab, setNamaLab] = useState('');
    const [selectedKalab, setSelectedKalab] = useState('');
    const [statusMsg, setStatusMsg] = useState(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
        const res = await fetch(`/api/sekjur/lab?jurusan_id=${jurusanId}`);
        const data = await res.json();
        if (res.ok) {
            setLabs(data.labs || []);
            setDosenList(data.dosen || []);
        }
        } catch (err) {
        console.error(err);
        } finally {
        setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [jurusanId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMsg(null);
        try {
        const res = await fetch('/api/sekjur/lab', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id: formId,
            nama_lab: namaLab,
            jurusan_id: jurusanId,
            kepala_lab_id: selectedKalab || null,
            }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message);
        
        setStatusMsg({ type: 'success', text: result.message });
        resetForm();
        loadData();
        } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
        }
    };

    const handleEdit = (lab) => {
        setFormId(lab.id);
        setNamaLab(lab.nama_lab);
        setSelectedKalab(lab.kepala_lab_id ? String(lab.kepala_lab_id) : '');
        setStatusMsg(null);
    };

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus lab ini?')) return;
        try {
        await fetch(`/api/sekjur/lab?id=${id}`, { method: 'DELETE' });
        loadData();
        } catch (error) {
        console.error(error);
        }
    };

    const resetForm = () => {
        setFormId('');
        setNamaLab('');
        setSelectedKalab('');
    };

    return (
        <Layout>
        <div className="p-8 max-w-5xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Laboratorium</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {formId ? 'Edit Laboratorium' : 'Tambah Laboratorium Baru'}
            </h2>

            {statusMsg && (
                <div className={`p-3 rounded mb-4 text-sm font-medium ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {statusMsg.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Laboratorium</label>
                    <input
                    type="text"
                    placeholder="Contoh: Lab Jaringan Komputer"
                    value={namaLab}
                    onChange={(e) => setNamaLab(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kepala Lab</label>
                    <select
                    value={selectedKalab}
                    onChange={(e) => setSelectedKalab(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700"
                    >
                    <option value="">-- Pilih Dosen --</option>
                    {dosenList.map((d) => (
                        <option key={d.id} value={d.id}>{d.nama} ({d.identifier})</option>
                    ))}
                    </select>
                </div>
                </div>

                <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm">
                    Simpan
                </button>
                {formId && (
                    <button type="button" onClick={resetForm} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded text-sm">
                    Batal
                    </button>
                )}
                </div>
            </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                    <th className="p-3">Nama Lab</th>
                    <th className="p-3">Kepala Lab</th>
                    <th className="p-3 text-center">Aksi</th>
                </tr>
                </thead>
                <tbody className="text-sm divide-y">
                {labs.map((lab) => (
                    <tr key={lab.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-700">{lab.nama_lab}</td>
                    <td className="p-3 text-gray-700">{lab.kepala_lab?.nama || '-'}</td>
                    <td className="p-3 text-center space-x-3">
                        <button onClick={() => handleEdit(lab)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(lab.id)} className="text-red-600 hover:underline">Hapus</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
        </Layout>
    );
}