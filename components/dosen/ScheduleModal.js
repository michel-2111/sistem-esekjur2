// components/dosen/ScheduleModal.js
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';

// Helper function untuk memformat tanggal dan waktu
const formatDate = (start, end) => {
    if (!start || !end) return '';
    const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
    const datePart = start.toLocaleDateString('id-ID', options);
    
    const timeFormat = { hour: '2-digit', minute: '2-digit', hour12: false };
    const startTime = start.toLocaleTimeString('id-ID', timeFormat);
    const endTime = end.toLocaleTimeString('id-ID', timeFormat);

    return `${datePart}, ${startTime} - ${endTime}`;
}

export default function ScheduleModal({ kelas, onClose, onSaveSuccess }) {
    // State baru untuk waktu mulai dan selesai
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    
    const [ruang, setRuang] = useState('');
    const [materiUrl, setMateriUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (kelas) {
            // Untuk kesederhanaan, kita tidak mem-parsing string jadwal yang lama.
            // Dosen akan memilih tanggal baru setiap kali mengedit.
            setRuang(kelas.ruang || '');
            setMateriUrl(kelas.materi_url || '');
        }
    }, [kelas]);

    if (!kelas) return null;

    const handleSubmit = async () => {
        if (!startTime || !endTime) {
            alert("Harap tentukan waktu mulai dan selesai.");
            return;
        }
        setIsSubmitting(true);
        const formattedJadwal = formatDate(startTime, endTime); // Format jadwal menjadi string

        try {
            const res = await fetch('/api/dosen/kelas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    courseId: kelas.course_id, 
                    jadwal: formattedJadwal, 
                    ruang, 
                    materi_url: materiUrl 
                }),
            });
            if (!res.ok) throw new Error('Gagal menyimpan perubahan.');
            onSaveSuccess();
            onClose();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const datePickerInputClass = "mt-1 w-full p-2 border border-gray-300 rounded-md";

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Atur Jadwal & Materi - {kelas.nama}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Jadwal Perkuliahan</label>
                            <div className="grid grid-cols-2 gap-4 mt-1">
                                <DatePicker
                                    selected={startTime}
                                    onChange={(date) => setStartTime(date)}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    placeholderText="Waktu Mulai"
                                    className={datePickerInputClass}
                                />
                                <DatePicker
                                    selected={endTime}
                                    onChange={(date) => setEndTime(date)}
                                    showTimeSelect
                                    dateFormat="Pp"
                                    placeholderText="Waktu Selesai"
                                    className={datePickerInputClass}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ruang Kelas</label>
                            <input type="text" value={ruang} onChange={e => setRuang(e.target.value)} placeholder="Contoh: Lab RPL" className={datePickerInputClass} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL Materi (Google Drive, dll)</label>
                            <input type="text" value={materiUrl} onChange={e => setMateriUrl(e.target.value)} className={datePickerInputClass} />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Batal</button>
                        <button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}