import { useState, useEffect } from 'react';
import Layout from '../../components/Layout'; 

export default function KelolaJurusan() {
    const [jurusanList, setJurusanList] = useState([]);
    const [dosenList, setDosenList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State untuk Formulir
    const [idJurusan, setIdJurusan] = useState('');
    const [namaJurusan, setNamaJurusan] = useState('');
    const [selectedKajur, setSelectedKajur] = useState('');
    const [selectedSekjur, setSelectedSekjur] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Fungsi untuk mengambil data dari Database melalui API
    const loadData = async () => {
        setIsLoading(true);
        try {
        const res = await fetch('/api/admin/jurusan');
        const data = await res.json();
        if (res.ok) {
            setJurusanList(data.jurusan || []);
            setDosenList(data.dosen || []);
        }
        } catch (err) {
        console.error('Gagal memuat data', err);
        } finally {
        setIsLoading(false);
        }
    };

    // Memuat data pertama kali saat halaman dibuka
    useEffect(() => {
        loadData();
    }, []);

    // Fungsi untuk mengisi form saat tombol 'Edit' ditekan
    const handleEdit = (jurusan) => {
        setIdJurusan(jurusan.id);
        setNamaJurusan(jurusan.nama);
        setSelectedKajur(jurusan.kajur_id ? String(jurusan.kajur_id) : '');
        setSelectedSekjur(jurusan.sekjur_id ? String(jurusan.sekjur_id) : '');
        setIsEditing(true);
        setStatusMessage(null);
    };

    // Fungsi untuk mengosongkan kembali form
    const resetForm = () => {
        setIdJurusan('');
        setNamaJurusan('');
        setSelectedKajur('');
        setSelectedSekjur('');
        setIsEditing(false);
    };

    // Fungsi untuk mengirim data ke API saat form di-submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);

        try {
        const res = await fetch('/api/admin/jurusan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            id: idJurusan,
            nama: namaJurusan,
            kajur_id: selectedKajur || null,
            sekjur_id: selectedSekjur || null,
            }),
        });

        const result = await res.json();

        if (!res.ok) {
            throw new Error(result.message || 'Gagal menyimpan data');
        }

        setStatusMessage({ type: 'success', text: result.message });
        resetForm();
        loadData(); // Memuat ulang tabel agar data terbaru muncul
        } catch (err) {
        setStatusMessage({ type: 'error', text: err.message });
        }
    };

    // Seluruh elemen dibungkus dengan <Layout> agar Header & Sidebar muncul
    return (
        <Layout>
        <div className="p-8 max-w-5xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Kelola Jurusan & Pejabat (Kajur / Sekjur)
            </h1>

            {/* --- Bagian Formulir Input --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {isEditing ? `Edit Jurusan (${idJurusan})` : 'Tambah Jurusan Baru'}
            </h2>

            {/* Menampilkan pesan sukses/error */}
            {statusMessage && (
                <div
                className={`p-3 rounded mb-4 text-sm font-medium ${
                    statusMessage.type === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
                >
                {statusMessage.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Input ID Jurusan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode / ID Jurusan
                    </label>
                    <input
                    type="text"
                    placeholder="Contoh: JTI"
                    value={idJurusan}
                    onChange={(e) => setIdJurusan(e.target.value)}
                    disabled={isEditing} 
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 text-gray-700"
                    />
                </div>

                {/* Input Nama Jurusan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Jurusan
                    </label>
                    <input
                    type="text"
                    placeholder="Contoh: Jurusan Teknologi Informasi"
                    value={namaJurusan}
                    onChange={(e) => setNamaJurusan(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    />
                </div>

                {/* Dropdown Pilihan Kajur */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kepala Jurusan (Kajur)
                    </label>
                    <select
                    value={selectedKajur}
                    onChange={(e) => setSelectedKajur(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    >
                    <option value="">-- Tanpa Kajur --</option>
                    {dosenList.map((d) => (
                        <option key={d.id} value={d.id}>
                        {d.nama} ({d.identifier})
                        </option>
                    ))}
                    </select>
                </div>

                {/* Dropdown Pilihan Sekjur */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sekretaris Jurusan (Sekjur)
                    </label>
                    <select
                    value={selectedSekjur}
                    onChange={(e) => setSelectedSekjur(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                    >
                    <option value="">-- Tanpa Sekjur --</option>
                    {dosenList.map((d) => (
                        <option key={d.id} value={d.id}>
                        {d.nama} ({d.identifier})
                        </option>
                    ))}
                    </select>
                </div>
                </div>

                {/* Tombol Aksi Form */}
                <div className="flex gap-2">
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
                >
                    {isEditing ? 'Simpan Perubahan' : 'Tambah Jurusan'}
                </button>
                {isEditing && (
                    <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded text-sm transition-colors"
                    >
                    Batal
                    </button>
                )}
                </div>
            </form>
            </div>

            {/* --- Bagian Tabel Data --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Daftar Jurusan & Pejabat</h2>

            {isLoading ? (
                <p className="text-gray-500 text-sm">Memuat data...</p>
            ) : (
                <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Jurusan</th>
                    <th className="p-3">Kajur</th>
                    <th className="p-3">Sekjur</th>
                    <th className="p-3 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="text-sm divide-y">
                    {jurusanList.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="p-3 text-center text-gray-900">
                        Belum ada data jurusan.
                        </td>
                    </tr>
                    ) : (
                    jurusanList.map((j) => (
                        <tr key={j.id} className="hover:bg-gray-50">
                        <td className="p-3 font-semibold text-gray-800">{j.id}</td>
                        <td className="p-3 text-gray-700">{j.nama}</td>
                        <td className="p-3 text-gray-700">{j.kajur ? j.kajur.nama : '-'}</td>
                        <td className="p-3 text-gray-700">{j.sekjur ? j.sekjur.nama : '-'}</td>
                        <td className="p-3 text-center">
                            <button
                            onClick={() => handleEdit(j)}
                            className="text-blue-600 hover:underline text-xs font-semibold"
                            >
                            Edit / Assign
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            )}
            </div>
        </div>
        </Layout>
    );
}