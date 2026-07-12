import { Check, Clock, Lock, Edit3, AlertCircle } from 'lucide-react';

export default function TATimeline({ status1, status2, status3 }) {
    const steps = [
        { id: 1, title: 'Persyaratan', subtitle: 'Dokumen & berkas', status: status1 },
        { id: 2, title: 'Proposal', subtitle: 'Pengajuan & ujian', status: status2 },
        { id: 3, title: 'Hasil Ujian', subtitle: 'Nilai & berita acara', status: status3 },
    ];

    const getStepConfig = (status) => {
        switch (status) {
            case 'valid':
                return {
                    circle: 'bg-green-500 border-green-500 shadow-green-200',
                    icon: <Check size={16} className="text-white" strokeWidth={3} />,
                    label: 'text-green-700',
                    badge: 'bg-green-100 text-green-700',
                    badgeText: 'Selesai',
                };
            case 'pending':
                return {
                    circle: 'bg-yellow-400 border-yellow-400 shadow-yellow-200',
                    icon: <Clock size={16} className="text-white" />,
                    label: 'text-yellow-700',
                    badge: 'bg-yellow-100 text-yellow-700',
                    badgeText: 'Menunggu',
                };
            case 'active':
                return {
                    circle: 'bg-blue-500 border-blue-500 shadow-blue-200',
                    icon: <Edit3 size={16} className="text-white" />,
                    label: 'text-blue-700',
                    badge: 'bg-blue-100 text-blue-700',
                    badgeText: 'Aktif',
                };
            case 'rejected':
                return {
                    circle: 'bg-red-500 border-red-500 shadow-red-200',
                    icon: <AlertCircle size={16} className="text-white" />,
                    label: 'text-red-700',
                    badge: 'bg-red-100 text-red-700',
                    badgeText: 'Ditolak',
                };
            case 'locked':
            default:
                return {
                    circle: 'bg-gray-100 border-gray-300 shadow-none',
                    icon: <Lock size={14} className="text-gray-400" />,
                    label: 'text-gray-400',
                    badge: 'bg-gray-100 text-gray-400',
                    badgeText: 'Terkunci',
                };
        }
    };

    const getLineWidth = () => {
        if (status3 !== 'locked') return '100%';
        if (status2 !== 'locked') return '50%';
        return '0%';
    };

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-6 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
                Progress Tugas Akhir
            </p>

            <div className="flex items-start justify-between relative">

                <div className="absolute left-0 top-5 w-full h-0.5 bg-gray-200 z-0" />

                <div
                    className="absolute left-0 top-5 h-0.5 bg-green-500 z-0 transition-all duration-700 ease-in-out"
                    style={{ width: getLineWidth() }}
                />

                {steps.map((step) => {
                    const config = getStepConfig(step.status);
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center w-1/3">

                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow-md transition-all duration-300 ${config.circle}`}>
                                {config.icon}
                            </div>

                            <div className="mt-3 text-center">
                                <p className={`text-sm font-bold ${config.label}`}>{step.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{step.subtitle}</p>
                                <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${config.badge}`}>
                                    {config.badgeText}
                                </span>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}