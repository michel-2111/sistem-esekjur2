import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CheckCircle, XCircle, Calendar, User, FileText, Award } from 'lucide-react';

export default function VerifikasiBeritaAcaraPage() {
    const router = useRouter();
    const { token } = router.query;
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (token) {
            fetch(`/api/verifikasi/berita-acara/${token}`)
                .then(async (res) => {
                    const result = await res.json();
                    if (!res.ok) throw new Error(result.message);
                    setData(result);
                })
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [token]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Memverifikasi dokumen...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <Head>
                <title>Verifikasi Berita Acara Ujian</title>
            </Head>

            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                {error ? (
                    <div className="p-8 text-center">
                        <XCircle size={64} className="mx-auto text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Gagal</h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                ) : data && (
                    <div>
                        <div className="bg-green-600 p-6 text-center text-white">
                            <CheckCircle size={56} className="mx-auto mb-3 text-green-100" />
                            <h2 className="text-xl font-bold tracking-wide">DOKUMEN VALID</h2>
                            <p className="text-green-100 text-sm mt-1">Tanda Tangan Digital Terverifikasi</p>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="border-b pb-4">
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Disahkan Oleh</p>
                                <div className="flex items-start">
                                    <User className="text-gray-400 mr-2 mt-1" size={18} />
                                    <div>
                                        <p className="font-bold text-gray-800">{data.dosen.nama}</p>
                                        <p className="text-sm text-gray-600">NIP/NIDN: {data.dosen.identifier}</p>
                                        <p className="text-sm text-blue-600 font-medium mt-1">
                                            {data.peran === 'ketua' ? 'Ketua Penguji' : 'Anggota Penguji'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b pb-4">
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Mahasiswa Teruji</p>
                                <div className="flex items-start">
                                    <FileText className="text-gray-400 mr-2 mt-1" size={18} />
                                    <div>
                                        <p className="font-bold text-gray-800">{data.mahasiswa.nama}</p>
                                        <p className="text-sm text-gray-600">{data.mahasiswa.identifier} - {data.mahasiswa.prodi.nama}</p>
                                        <p className="text-sm text-gray-700 italic mt-2 line-clamp-2">"{data.judul_proposal}"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center"><Calendar size={12} className="mr-1"/> Tanggal Ujian</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {new Date(data.tanggal_ujian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold mb-1 flex items-center"><Award size={12} className="mr-1"/> Total Nilai</p>
                                    <p className="text-lg font-bold text-blue-700">{data.total_nilai}</p>
                                </div>
                            </div>

                            <div className="text-center pt-2">
                                <p className="text-xs text-gray-400">
                                    Dicatat dalam sistem pada:<br/>
                                    {new Date(data.waktu_penilaian).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}