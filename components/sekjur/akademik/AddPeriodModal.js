// components/sekjur/akademik/AddPeriodModal.js
import { useState, useEffect, forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Save, Calendar } from 'lucide-react';

// Komponen input kustom dengan ikon, persis seperti yang Anda inginkan
const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
    <button 
        type="button" 
        className="mt-1 w-full flex justify-between items-center p-2 border border-gray-300 rounded-md text-left font-normal"
        onClick={onClick} 
        ref={ref}
    >
        <span>{value}</span>
        <Calendar className="h-4 w-4 text-gray-500" />
    </button>
));

CustomDateInput.displayName = 'CustomDateInput';

export default function AddPeriodModal({ isOpen, onClose, onSave }) {
    const [id, setId] = useState('');
    const [nama, setNama] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        if (isOpen) {
            setId('');
            setNama('');
            setStartDate(new Date());
            setEndDate(new Date());
        }
    }, [isOpen]);

    const handleSave = () => {
        onSave({ id, nama, start_date: startDate, end_date: endDate });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 overflow-auto text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Tambah Periode Akademik Baru</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">ID Periode</label>
                            <input 
                                type="text" 
                                value={id} 
                                onChange={e => setId(e.target.value.toUpperCase())} 
                                placeholder="Contoh: GENAP2025" 
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Nama Periode</label>
                            <input 
                                type="text" 
                                value={nama} 
                                onChange={e => setNama(e.target.value)} 
                                placeholder="Contoh: SA Genap 2025" 
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tanggal Mulai</label>
                            <DatePicker
                                selected={startDate}
                                onChange={date => setStartDate(date)}
                                dateFormat="dd/MM/yyyy"
                                customInput={<CustomDateInput />}
                                wrapperClassName="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Tanggal Selesai</label>
                            <DatePicker
                                selected={endDate}
                                onChange={date => setEndDate(date)}
                                dateFormat="dd/MM/yyyy"
                                customInput={<CustomDateInput />}
                                wrapperClassName="w-full"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md">Batal</button>
                        <button onClick={handleSave} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            <Save size={16} className="mr-2" /> Simpan Periode
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}