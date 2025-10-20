// components/sekjur/VerificationModal.js
import { useState } from 'react';
import Image from 'next/image';

export default function VerificationModal({ application, onClose, onUpdate }) {
    const [maxSks, setMaxSks] = useState('');
    const [alasanDitolak, setAlasanDitolak] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!application) return null;

    const handleSubmit = async (action) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/sekjur/verifikasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, action, maxSks, alasanDitolak }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal memproses permintaan.');
            }
            onUpdate(application.id);
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Verifikasi Pembayaran - {application.mahasiswa.nama}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none">&times;</button>
                    </div>
                    <Image
                        src={application.bukti_pembayaran_url}
                        alt="Bukti Pembayaran"
                        width={600}
                        height={400}
                        className="w-full h-auto rounded-md object-contain"
                    />
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-md border border-green-200">
                            <label className="block text-sm font-medium text-gray-900 mb-1">Assign Jumlah SKS Maksimal</label>
                            <input type="number" value={maxSks} onChange={(e) => setMaxSks(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" placeholder="Contoh: 9" />
                            <button onClick={() => handleSubmit('approve')} disabled={isSubmitting} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
                                {isSubmitting ? 'Memproses...' : 'Setujui Pembayaran'}
                            </button>
                        </div>
                        <div className="p-4 bg-red-50 rounded-md border border-red-200">
                            <label className="block text-sm font-medium text-gray-900 mb-1">Alasan Penolakan</label>
                            <textarea value={alasanDitolak} onChange={(e) => setAlasanDitolak(e.target.value)} placeholder="Tulis alasan penolakan di sini..." rows="2" className="block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                            <button onClick={() => handleSubmit('reject')} disabled={isSubmitting} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
                                {isSubmitting ? 'Memproses...' : 'Tolak Pembayaran'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};