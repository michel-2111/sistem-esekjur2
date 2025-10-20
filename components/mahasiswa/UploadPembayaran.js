// components/mahasiswa/UploadPembayaran.js
import { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';

export default function UploadPembayaran({ onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('No file chosen');
    const [period, setPeriod] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetch('/api/master/periods')
            .then(res => res.json())
            .then(data => setPeriod(data))
            .catch(() => setError("Gagal memuat periode akademik."))
            .finally(() => setLoading(false));
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const handleButtonClick = () => fileInputRef.current.click();

    const handleSubmit = async () => {
        if (!file) {
            setError("Silakan pilih file bukti pembayaran.");
            return;
        }
        setError('');
        setIsSubmitting(true);

        // --- PERUBAHAN UTAMA DI SINI ---
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);
        formData.append('periodId', period.id);

        try {
            // Send the FormData object
            const res = await fetch('/api/sa/start', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal mengunggah bukti.");
            }
            
            const newApplication = await res.json();
            onUploadSuccess(newApplication);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) return <p>Loading...</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full text-gray-900">
            <h2 className="text-2xl font-bold mb-2">Upload Bukti Pembayaran</h2>
            <p className="text-gray-600 mb-6">
                Silakan lakukan pembayaran dan unggah bukti transfer di sini untuk memulai proses Semester Antara.
            </p>
            
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
            />
            
            <div className="flex items-center space-x-4 mb-6">
                <button type="button" onClick={handleButtonClick} className="bg-white text-blue-600 font-semibold px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Choose File
                </button>
                <p className={`truncate text-sm ${fileName === 'No file chosen' ? 'text-gray-500' : 'text-gray-800'}`}>
                    {fileName}
                </p>
            </div>
            
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            
            <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !file || !period}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none"
            >
                <Upload className="h-5 w-5 mr-2" /> 
                {isSubmitting ? 'Mengunggah...' : 'Upload Bukti'}
            </button>
        </div>
    );
}