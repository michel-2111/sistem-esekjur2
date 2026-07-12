// components/sekjur/akademik/CourseManager.js
import { useState } from 'react';
import { Plus, Edit3, Trash2, BookOpen, ChevronDown, Users, Hash, Search } from 'lucide-react';
import AddEditCourseModal from './AddEditCourseModal';
import ConfirmationModal from '../../shared/ConfirmationModal';

const selectStyle = {
    padding: '7px 10px',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '13px',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    paddingRight: '28px',
};

function SelectWrapper({ children, disabled }) {
    return (
        <div className="relative" style={{ opacity: disabled ? 0.5 : 1 }}>
            {children}
            <ChevronDown
                size={12}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: '#94a3b8' }}
            />
        </div>
    );
}

export default function CourseManager({ prodiList, courseList, dosenList, onDataChange }) {
    const [selectedProdiId, setSelectedProdiId] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [search, setSearch] = useState('');
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleApiCall = async (action, payload) => {
        setIsLoading(true);
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
            setIsLoading(false);
            setIsCourseModalOpen(false);
            setCourseToDelete(null);
        }
    };

    const handleSaveCourse = (courseData) => {
        const action = courseData.id ? 'UPDATE_COURSE' : 'CREATE_COURSE';
        handleApiCall(action, { ...courseData, prodi_id: selectedProdiId, semester: parseInt(selectedSemester) });
    };

    const handleDeleteCourse = () => {
        handleApiCall('DELETE_COURSE', { id: courseToDelete.id });
    };

    const filtered = Array.isArray(courseList)
        ? courseList.filter(c => {
            const matchProdi = c.prodi_id === selectedProdiId;
            const matchSem = c.semester?.toString() === selectedSemester;
            const matchSearch = !search ||
                c.nama?.toLowerCase().includes(search.toLowerCase()) ||
                c.kode?.toLowerCase().includes(search.toLowerCase());
            return matchProdi && matchSem && matchSearch;
        })
        : [];

    const canAdd = selectedProdiId && selectedSemester;
    const isFiltered = selectedProdiId && selectedSemester;

    return (
        <>
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <BookOpen size={14} style={{ color: '#3b82f6' }} />
                            <h2
                                className="text-base font-bold"
                                style={{ color: '#0f172a', fontFamily: "'Lato', sans-serif" }}
                            >
                                Mata Kuliah
                            </h2>
                        </div>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                            Kelola mata kuliah per program studi dan semester
                        </p>
                    </div>

                    <button
                        onClick={() => { setCourseToEdit(null); setIsCourseModalOpen(true); }}
                        disabled={!canAdd || isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                        style={{
                            background: canAdd ? 'linear-gradient(135deg, #3b82f6, #6366f1)' : '#e2e8f0',
                            color: canAdd ? '#fff' : '#94a3b8',
                            boxShadow: canAdd ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                        }}
                        onMouseEnter={e => { if (canAdd) e.currentTarget.style.filter = 'brightness(1.08)'; }}
                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                    >
                        <Plus size={13} />
                        Tambah MK
                    </button>
                </div>

                {/* Filters row */}
                <div className="flex items-center gap-2 flex-wrap mb-5">
                    <SelectWrapper>
                        <select
                            value={selectedProdiId}
                            onChange={e => { setSelectedProdiId(e.target.value); setSelectedSemester(''); setSearch(''); }}
                            style={selectStyle}
                            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="">Pilih Program Studi</option>
                            {Array.isArray(prodiList) && prodiList.map(p => (
                                <option key={p.id} value={p.id}>{p.nama}</option>
                            ))}
                        </select>
                    </SelectWrapper>

                    <SelectWrapper disabled={!selectedProdiId}>
                        <select
                            value={selectedSemester}
                            onChange={e => { setSelectedSemester(e.target.value); setSearch(''); }}
                            disabled={!selectedProdiId}
                            style={{ ...selectStyle, cursor: !selectedProdiId ? 'not-allowed' : 'pointer' }}
                            onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        >
                            <option value="">Pilih Semester</option>
                            {[1,2,3,4,5,6,7,8].map(s => (
                                <option key={s} value={s}>Semester {s}</option>
                            ))}
                        </select>
                    </SelectWrapper>

                    {isFiltered && (
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }} />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama / kode..."
                                style={{ ...selectStyle, paddingLeft: '28px', width: '160px' }}
                                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; e.target.style.background = '#fff'; }}
                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
                            />
                        </div>
                    )}

                    {isFiltered && (
                        <span
                            className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: '#eff6ff', color: '#3b82f6' }}
                        >
                            {filtered.length} mata kuliah
                        </span>
                    )}
                </div>

                {/* Table */}
                <div
                    className="rounded-xl overflow-hidden"
                    style={{ border: '1px solid #e2e8f0' }}
                >
                    {/* Table header */}
                    <div
                        className="grid text-xs font-semibold uppercase tracking-wide px-4 py-2.5"
                        style={{
                            gridTemplateColumns: '110px 1fr 60px 1fr 80px',
                            background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            color: '#64748b',
                        }}
                    >
                        <span className="flex items-center gap-1"><Hash size={10} />Kode</span>
                        <span className="flex items-center gap-1"><BookOpen size={10} />Nama MK</span>
                        <span className="text-center">SKS</span>
                        <span className="flex items-center gap-1"><Users size={10} />Dosen Pengampu</span>
                        <span className="text-center">Aksi</span>
                    </div>

                    {/* Rows */}
                    {!isFiltered ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                            <div className="p-3 rounded-xl" style={{ background: '#f1f5f9' }}>
                                <BookOpen size={20} style={{ color: '#94a3b8' }} />
                            </div>
                            <p className="text-sm font-medium" style={{ color: '#334155' }}>Pilih Prodi &amp; Semester</p>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>untuk melihat daftar mata kuliah</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <div className="p-3 rounded-xl" style={{ background: '#f1f5f9' }}>
                                {search ? <Search size={18} style={{ color: '#94a3b8' }} /> : <Plus size={18} style={{ color: '#94a3b8' }} />}
                            </div>
                            <p className="text-sm font-medium" style={{ color: '#334155' }}>
                                {search ? 'Tidak ditemukan' : 'Belum ada mata kuliah'}
                            </p>
                            <p className="text-xs" style={{ color: '#94a3b8' }}>
                                {search ? `Tidak ada hasil untuk "${search}"` : 'Klik "+ Tambah MK" untuk menambahkan'}
                            </p>
                        </div>
                    ) : (
                        filtered.map((course, idx) => {
                            const pengampuNames = course.pengampu
                                ?.map(p => dosenList.find(d => d.id === p.dosen_id)?.nama)
                                .filter(Boolean)
                                .join(', ') || null;
                            const isLast = idx === filtered.length - 1;

                            return (
                                <div
                                    key={course.id}
                                    className="grid items-center px-4 py-3 transition-colors duration-100"
                                    style={{
                                        gridTemplateColumns: '110px 1fr 60px 1fr 80px',
                                        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafe'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Kode */}
                                    <span
                                        className="text-xs font-mono font-semibold px-2 py-1 rounded-lg w-fit"
                                        style={{ background: '#eff6ff', color: '#3b82f6' }}
                                    >
                                        {course.kode}
                                    </span>

                                    {/* Nama */}
                                    <span className="text-sm font-medium pr-4" style={{ color: '#334155' }}>
                                        {course.nama}
                                    </span>

                                    {/* SKS */}
                                    <div className="flex justify-center">
                                        <span
                                            className="text-xs font-bold px-2 py-0.5 rounded-lg"
                                            style={{ background: '#f1f5f9', color: '#475569' }}
                                        >
                                            {course.sks}
                                        </span>
                                    </div>

                                    {/* Dosen */}
                                    <span className="text-xs pr-4" style={{ color: pengampuNames ? '#334155' : '#94a3b8' }}>
                                        {pengampuNames || (
                                            <span style={{ fontStyle: 'italic' }}>Belum ditugaskan</span>
                                        )}
                                    </span>

                                    {/* Aksi */}
                                    <div className="flex items-center justify-center gap-1.5">
                                        <button
                                            onClick={() => { setCourseToEdit(course); setIsCourseModalOpen(true); }}
                                            className="p-1.5 rounded-lg transition-all duration-150"
                                            title="Edit"
                                            style={{ color: '#d97706', background: 'transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Edit3 size={13} />
                                        </button>
                                        <button
                                            onClick={() => setCourseToDelete(course)}
                                            className="p-1.5 rounded-lg transition-all duration-150"
                                            title="Hapus"
                                            style={{ color: '#ef4444', background: 'transparent' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
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