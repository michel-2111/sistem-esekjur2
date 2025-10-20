// components/sekjur/akademik/PeriodManager.js
import { useState } from 'react';
import { Plus} from 'lucide-react';
import AddPeriodModal from './AddPeriodModal';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
const getPeriodStatus = (period) => {
    const now = new Date();
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start) {
        return { text: 'Akan Datang', color: 'border-yellow-500' };
    } else if (now > end) {
        return { text: 'Telah Berakhir', color: 'border-red-500' };
    } else {
        return { text: 'Sedang Berlangsung', color: 'border-green-500' };
    }
};

export default function PeriodManager({ period, onDataChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = async (newPeriod) => {
        try {
            const res = await fetch('/api/sekjur/periods', {
                method: 'POST', // Menggunakan POST untuk membuat
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPeriod)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal menyimpan periode.');
            }
            onDataChange();
            setIsModalOpen(false);
        } catch (error) {
            alert(error.message);
        }
    };

    if (!period) return <p>Periode tidak ditemukan.</p>;

    const status = getPeriodStatus(period);

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md text-gray-900">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manajemen Periode Akademik</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        className="flex items-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm whitespace-nowrap">
                        <Plus size={16} className="mr-1" /> Tambah Periode
                    </button>
                </div>
                <div className={`p-4 rounded-md border-l-4 ${status.color}`}>
                    <p className="font-semibold text-lg text-gray-800">Periode Aktif Saat Ini:</p>
                    <p className="font-semibold text-lg">{period.nama}</p>
                    <p className="text-sm text-gray-600">Rentang Waktu: {formatDate(period.start_date)} s/d {formatDate(period.end_date)}</p>
                    <p className="text-sm text-gray-600">Status: <span className="font-bold">{status.text}</span></p>
                </div>
            </div>
            <AddPeriodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} period={period} />
        </>
    );
}