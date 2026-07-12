import { QRCodeSVG } from 'qrcode.react';

export default function BeritaAcaraQR({ token, dosenName, peran }) {
    if (!token) return <span className="text-xs text-gray-400 italic">Belum dinilai</span>;

    const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verifikasi/berita-acara/${token}`;

    return (
        <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm w-max">
            <QRCodeSVG value={verifyUrl} size={120} level="H" includeMargin={true} />
            <p className="text-xs font-bold text-gray-800 mt-2 text-center">{dosenName}</p>
            <p className="text-[10px] text-gray-500 text-center uppercase tracking-wider">{peran}</p>
            <a href={verifyUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2 flex items-center">
                Buka Detail ↗
            </a>
        </div>
    );
}