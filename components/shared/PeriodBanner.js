// components/shared/PeriodBanner.js
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

// Helper function untuk memformat tanggal
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// Helper function untuk menentukan status periode
const getPeriodStatus = (period) => {
    const now = new Date();
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start) {
        return { text: 'Akan Datang', color: 'bg-yellow-500', icon: AlertTriangle };
    } else if (now > end) {
        return { text: 'Telah Berakhir', color: 'bg-red-600', icon: Clock };
    } else {
        return { text: 'Sedang Berlangsung', color: 'bg-green-500', icon: CheckCircle };
    }
};

export default function PeriodBanner({ period }) {
    // Jangan tampilkan apa-apa jika data periode belum ada
    if (!period) return null;

    const status = getPeriodStatus(period);
    const Icon = status.icon;

    return (
        <div className={`p-4 mb-6 rounded-lg text-white ${status.color} flex items-center shadow-md`}>
            <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
                <p className="font-bold">Periode Akademik: {status.text}</p>
                <p className="text-sm">
                    Rentang Waktu: {formatDate(period.start_date)} - {formatDate(period.end_date)}
                </p>
            </div>
        </div>
    );
}