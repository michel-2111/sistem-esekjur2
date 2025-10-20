// components/kaprodi/AssignmentModal.js
import { useState } from 'react';

export default function AssignmentModal({ application, dosenList, onClose, onSaveSuccess }) {
    const [assignments, setAssignments] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleAssignmentChange = (courseId, dosenId) => {
        setAssignments(prev => ({ ...prev, [courseId]: dosenId }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/kaprodi/penugasan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId: application.id, assignments }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal menyimpan penugasan.');
            }
            onSaveSuccess(application.id);
            onClose(); // Tutup modal setelah berhasil
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Tugaskan Dosen untuk {application.mahasiswa.nama}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-3xl">&times;</button>
                    </div>
                    <div className="space-y-4">
                        {application.application_courses.map(({ course }) => (
                            <div key={course.id}>
                                <label className="block text-sm font-medium text-gray-700">{course.nama}</label>
                                <select
                                    onChange={(e) => handleAssignmentChange(course.id, e.target.value)}
                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">-- Pilih Dosen --</option>
                                    {dosenList.map(dosen => (
                                        <option key={dosen.id} value={dosen.id}>{dosen.nama}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                    {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan Penugasan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}