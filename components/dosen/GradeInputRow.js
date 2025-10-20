// components/dosen/GradeInputRow.js
import { useState } from 'react';
import { Save } from 'lucide-react';

export default function GradeInputRow({ student, courseId, isKelasSelesai, onSave }) {
    const [grade, setGrade] = useState(student.nilai || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(!!student.nilai);

    const handleSave = async () => {
        if (!grade) {
            alert('Pilih nilai terlebih dahulu.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave({
                applicationId: student.application_id,
                courseId,
                nilai: grade,
            });
            setIsSaved(true);
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 border-b text-gray-900">
            <span className="text-gray-800">{student.nama}</span>
            
            {!isKelasSelesai ? (
                <span className="text-sm font-medium text-gray-500">Kelas belum selesai</span>
            ) : (
                <div className="flex items-center space-x-2">
                    <select 
                        value={grade} 
                        onChange={(e) => { setGrade(e.target.value); setIsSaved(false); }}
                        className="py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm"
                        disabled={isSaved}
                    >
                        <option value="">-- Nilai --</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                    </select>
                    {isSaved ? (
                        <button onClick={() => setIsSaved(false)} className="text-sm text-gray-500 hover:text-gray-800">Edit</button>
                    ) : (
                        <button onClick={handleSave} disabled={isSubmitting} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? '...' : <Save size={16} />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}