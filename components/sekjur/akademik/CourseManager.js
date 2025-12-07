// components/sekjur/akademik/CourseManager.js
import { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import AddEditCourseModal from './AddEditCourseModal';
import ConfirmationModal from '../../shared/ConfirmationModal';

export default function CourseManager({ prodiList, courseList, dosenList, onDataChange }) {
    const [selectedProdiId, setSelectedProdiId] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const handleApiCall = async (action, payload) => {
        try {
            const res = await fetch('/api/sekjur/akademik', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Terjadi kesalahan.');
            }
            onDataChange();
        } catch (error) {
            alert(error.message);
        } finally {
            setIsCourseModalOpen(false);
            setCourseToDelete(null);
        }
    };

    const handleSaveCourse = (courseData) => {
        const action = courseData.id ? 'UPDATE_COURSE' : 'CREATE_COURSE';
        const payload = { ...courseData, prodi_id: selectedProdiId, semester: parseInt(selectedSemester) };
        handleApiCall(action, payload);
    };

    const handleDeleteCourse = () => {
        handleApiCall('DELETE_COURSE', { id: courseToDelete.id });
    };

    const filteredCourses = Array.isArray(courseList) ? courseList.filter(c =>
        c.prodi_id === selectedProdiId && c.semester.toString() === selectedSemester
    ) : [];

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="md:flex justify-between items-center mb-4 text-gray-900">
                    <h2 className="text-xl font-bold mb-4 md:mb-0">Mata Kuliah</h2>
                    <div className="flex items-center space-x-4">
                        <select value={selectedProdiId} onChange={e => { setSelectedProdiId(e.target.value); setSelectedSemester(''); }} className="border p-2 rounded-md">
                            <option value="">-- Pilih Prodi --</option>
                            {Array.isArray(prodiList) && prodiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="border p-2 rounded-md" disabled={!selectedProdiId}>
                            <option value="">-- Pilih Semester --</option>
                            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                        <button
                            onClick={() => { setCourseToEdit(null); setIsCourseModalOpen(true); }}
                            disabled={!selectedProdiId || !selectedSemester}
                            className="flex items-center bg-blue-600 text-white font-semibold py-2 px-3 rounded-md text-sm disabled:bg-gray-400"
                        >
                            <Plus size={16} className="mr-1" /> Tambah
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm ">
                        <thead className="bg-gray-50 text-gray-900">
                            <tr>
                                <th className="p-3">Kode MK</th>
                                <th className="p-3">Nama Mata Kuliah</th>
                                <th className="p-3">SKS</th>
                                <th className="p-3">Dosen Pengampu</th>
                                <th className="p-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="border-b">
                                    <td className="p-3 text-gray-900">{course.kode}</td>
                                    <td className="p-3 text-gray-900">{course.nama}</td>
                                    <td className="p-3 text-gray-900">{course.sks}</td>
                                    <td className="p-3 text-xs text-gray-900">
                                        {course.pengampu?.map(p => dosenList.find(d => d.id === p.dosen_id)?.nama).join(', ') || 'N/A'}
                                    </td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => { setCourseToEdit(course); setIsCourseModalOpen(true); }} className="p-1 text-yellow-600 hover:text-yellow-800"><Edit3 size={16} /></button>
                                        <button onClick={() => setCourseToDelete(course)} className="p-1 text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCourses.length === 0 && selectedProdiId && selectedSemester && (
                        <p className="text-center text-gray-500 py-8">Belum ada mata kuliah untuk Prodi dan Semester ini.</p>
                    )}
                </div>
            </div>

            <AddEditCourseModal
                isOpen={isCourseModalOpen}
                onClose={() => setIsCourseModalOpen(false)}
                onSave={handleSaveCourse}
                initialData={courseToEdit}
                dosenList={dosenList}
            />

            <ConfirmationModal
                isOpen={!!courseToDelete}
                onClose={() => setCourseToDelete(null)}
                onConfirm={handleDeleteCourse}
                title="Konfirmasi Hapus Mata Kuliah"
            >
                Anda yakin ingin menghapus mata kuliah <strong>{courseToDelete?.nama}</strong>?
            </ConfirmationModal>
        </>
    );
}