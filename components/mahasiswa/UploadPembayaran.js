// components/mahasiswa/UploadPembayaran.js
import { useState, useEffect, useRef } from 'react';
import { Upload, FileImage, X, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadPembayaran({ onUploadSuccess }) {
    const [file, setFile]             = useState(null);
    const [period, setPeriod]         = useState(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragOver, setDragOver]     = useState(false);
    const fileInputRef                = useRef(null);

    useEffect(() => {
        fetch('/api/master/periods')
            .then(res => res.json())
            .then(setPeriod)
            .catch(() => setError('Gagal memuat periode akademik.'))
            .finally(() => setLoading(false));
    }, []);

    const acceptFile = (selected) => {
        if (!selected) return;
        setFile(selected);
        setError('');
    };

    const handleFileChange = (e) => acceptFile(e.target.files[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        acceptFile(e.dataTransfer.files[0]);
    };

    const handleRemove = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!file) { setError('Silakan pilih file bukti pembayaran.'); return; }
        setError('');
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('periodId', period.id);

        try {
            const res = await fetch('/api/sa/start', { method: 'POST', body: formData });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal mengunggah bukti.');
            }
            onUploadSuccess(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Memuat periode akademik...</span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 w-full text-slate-900">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Upload Bukti Pembayaran</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Lakukan pembayaran terlebih dahulu, lalu unggah bukti transfer di bawah ini untuk memulai proses Semester Antara.
                </p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,application/pdf"
            />

            {!file ? (
                <div
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`
                        cursor-pointer border-2 border-dashed rounded-xl p-10
                        flex flex-col items-center justify-center gap-3 transition-colors
                        ${dragOver
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/50'
                        }
                    `}
                >
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Upload className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700">
                            Klik untuk memilih file
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">atau seret & lepas ke sini</p>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, PDF hingga 10MB</p>
                </div>
            ) : (
                <div className="flex items-center gap-4 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                        <FileImage className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                        title="Hapus file"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !file || !period}
                className="mt-6 w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                {isSubmitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah...</>
                    : <><Upload className="h-4 w-4" /> Upload Bukti</>
                }
            </button>
        </div>
    );
}