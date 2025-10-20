// pages/pengajuan-cuti.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Download, Send } from 'lucide-react';
import StatusView from '../components/mahasiswa/StatusView';

const LEAVE_STATUS_MAP = {
    menunggu_kajur: 'Menunggu Persetujuan Kajur',
    menunggu_wadir: 'Menunggu Persetujuan Wadir',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
};

export default function PengajuanCutiPage() {
    const [file, setFile] = useState(null);
    const [durasi, setDurasi] = useState('');
    const [template, setTemplate] = useState(null);
    const [existingApp, setExistingApp] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/master/templates?type=cuti_form'),
            fetch('/api/mahasiswa/cuti')
        ]).then(async ([templateRes, appRes]) => {
            if (templateRes.ok) setTemplate(await templateRes.json());
            if (appRes.ok) setExistingApp(await appRes.json());
        }).catch(console.error)
          .finally(() => setIsLoading(false));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !durasi) {
            alert('Harap lengkapi durasi dan formulir yang akan diunggah.');
            return;
        }
        setIsLoading(true);
        const formData = new FormData();
        formData.append('formFile', file);
        formData.append('durasi', durasi);

        try {
            const res = await fetch('/api/mahasiswa/cuti', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Gagal mengirim pengajuan.');
            const newApp = await res.json();
            setExistingApp(newApp);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Layout><p>Loading...</p></Layout>;

    if (existingApp) {
        return (
            <Layout>
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Status Pengajuan Cuti</h1>
                <StatusView message={`Status: ${LEAVE_STATUS_MAP[existingApp.status] || existingApp.status}`} />
                    {existingApp.status === 'ditolak' && (
                    <div className="mt-4 max-w-lg mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                        <p className="font-bold">Alasan Penolakan:</p>
                        <p>{existingApp.alasan_ditolak || "Tidak ada alasan spesifik."}</p>
                    </div>
                )}
            </Layout>
        );
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Pengajuan Cuti Akademik</h1>
            <div className="bg-white p-6 rounded-lg shadow-md mx-auto">
                <h2 className="text-xl font-bold mb-2 text-gray-900">1. Unduh dan Isi Formulir</h2>
                <p className="text-gray-600 mb-4 text-gray-900">Silakan unduh formulir di bawah ini, isi, lalu unggah kembali untuk mengajukan cuti.</p>
                {template ? (
                    <a href={template.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm">
                        <Download size={16} className="mr-2" /> {template.title}
                    </a>
                ) : <p className="text-red-500 ">Template formulir tidak tersedia.</p>}

                <hr className="my-6" />

                <h2 className="text-xl font-bold mb-2 text-gray-900">2. Unggah Formulir</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Durasi Cuti</label>
                        <select value={durasi} onChange={e => setDurasi(e.target.value)} required className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900">
                            <option value="">-- Pilih Durasi --</option>
                            <option value="2 Semester (1 Tahun)">2 Semester (1 Tahun)</option>
                            <option value="4 Semester (2 Tahun)">4 Semester (2 Tahun)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Formulir yang Telah Diisi</label>
                        <input type="file" onChange={e => setFile(e.target.files[0])} required className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <button type="submit" disabled={!template} className="wraped-full flex justify-center items-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                        <Send className="h-5 w-5 mr-2" /> Kirim Pengajuan
                    </button>
                </form>
            </div>
        </Layout>
    );
}