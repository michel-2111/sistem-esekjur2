// components/mahasiswa/StatusView.js
import { Info } from 'lucide-react';

export default function StatusView({ message, icon: Icon = Info }) {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
            <div className="flex flex-col items-center justify-center text-center">
                <Icon className="h-12 w-12 text-blue-500 mb-4" />
                <p className="text-gray-700">{message}</p>
            </div>
        </div>
    );
}