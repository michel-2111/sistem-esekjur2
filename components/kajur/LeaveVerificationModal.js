// components/kajur/LeaveVerificationModal.js
import { useState } from 'react';

export default function LeaveVerificationModal({ application, userRole, onClose, onUpdate }) {
    const [alasanDitolak, setAlasanDitolak] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!application) return null;

    // Tentukan API endpoint dan teks tombol berdasarkan peran
    const apiEndpoint = userRole === 'kajur' ? '/api/kajur/verifikasi-cuti' : '/api/wadir/verifikasi-cuti';
    const approveButtonText = userRole === 'kajur' ? 'Setujui & Teruskan ke Wadir' : 'Setujui Pengajuan Cuti';

    const handleSubmit = async (action) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, action, alasanDitolak }),
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
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Verifikasi Cuti - {application.mahasiswa.nama}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>
                <div className="p-4 flex-grow overflow-y-auto">
                    <iframe src={application.form_url} className="w-full h-96 rounded-md border" title="Formulir Cuti"></iframe>
                </div>
                <div className="p-4 bg-gray-50 rounded-b-lg space-y-4">
                    <div>
                        <button onClick={() => handleSubmit('approve')} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
                            {approveButtonText}
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-50 px-2 text-gray-500">Atau</span></div>
                    </div>
                    <div>
                        <textarea value={alasanDitolak} onChange={(e) => setAlasanDitolak(e.target.value)} placeholder="Tulis alasan penolakan di sini..." rows="2" className="block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
                        <button onClick={() => handleSubmit('reject')} disabled={isSubmitting} className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400">
                            Tolak Pengajuan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}