// components/mahasiswa/PengajuanMK.js
import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function PengajuanMK({ application, onSuccess }) {
    const [coursesBySemester, setCoursesBySemester] = useState({});
    const [selectedSemester, setSelectedSemester] = useState('1'); // Default ke semester 1
    const [selectedCourses, setSelectedCourses] = useState([]);
    const [currentSks, setCurrentSks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const maxSks = application.max_sks;

    useEffect(() => {
        fetch('/api/master/courses')
            .then(res => res.json())
            .then(data => {
                setCoursesBySemester(data);
                // Set default semester ke semester pertama yang ada data
                const firstSemesterWithCourses = Object.keys(data)[0];
                if(firstSemesterWithCourses) setSelectedSemester(firstSemesterWithCourses);
            })
            .catch(() => setError('Gagal memuat daftar mata kuliah.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const totalSks = selectedCourses.reduce((sum, course) => sum + course.sks, 0);
        setCurrentSks(totalSks);
    }, [selectedCourses]);

    const handleCourseToggle = (course, isChecked) => {
        if (isChecked) {
            if (currentSks + course.sks > maxSks) {
                alert(`Batas SKS akan terlampaui. Anda hanya dapat mengambil ${maxSks} SKS.`);
                return;
            }
            setSelectedCourses(prev => [...prev, course]);
        } else {
            setSelectedCourses(prev => prev.filter(c => c.id !== course.id));
        }
    };

    const handleSubmit = async () => {
        if (selectedCourses.length === 0) {
            alert('Pilih minimal satu mata kuliah.');
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            const res = await fetch('/api/sa/submit-courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    applicationId: application.id,
                    selectedCourseIds: selectedCourses.map(c => c.id),
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal mengirim pengajuan.');
            }
            const updatedApplication = await res.json();
            onSuccess(updatedApplication);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p>Memuat mata kuliah...</p>;

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full text-gray-900">
            <h2 className="text-2xl font-bold">Pembayaran Terkonfirmasi!</h2>
            <p className="text-gray-600 mt-2">Anda dapat mengambil maksimal <span className="font-bold">{maxSks} SKS</span>.</p>
            <p className="text-gray-600 mb-6">Silakan pilih semester, lalu pilih mata kuliah yang ingin Anda ambil.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-6">
                <div>
                    <label htmlFor="semester-select" className="block text-sm font-medium text-gray-700 mb-1">Pilih Semester</label>
                    <select id="semester-select" value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        {Object.keys(coursesBySemester).length > 0 ? Object.keys(coursesBySemester).map(sem => 
                            <option key={sem} value={sem}>Semester {sem}</option>
                        ) : <option>Loading...</option>}
                    </select>
                </div>
                <div className={`font-bold text-lg p-3 rounded-md ${currentSks > maxSks ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100'}`}>
                    Total SKS: {currentSks} / {maxSks}
                </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {(coursesBySemester[selectedSemester] || []).map(course => (
                    <label key={course.id} className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="checkbox" onChange={(e) => handleCourseToggle(course, e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-4 text-gray-800">{course.nama} ({course.sks} SKS)</span>
                    </label>
                ))}
            </div>

            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}

            <button onClick={handleSubmit} disabled={isSubmitting} className="w-full flex justify-center items-center py-2.5 px-4 mt-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                <Send className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
        </div>
    );
}