// pages/manajemen-dosen.js
import { useEffect, useState, useCallback } from 'react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';
import UserInfoModal from '../components/shared/UserInfoModal';

// --- IMPORT KOMPONEN ANDA ---
import ConfirmationModal from '../components/shared/ConfirmationModal'; // Menggunakan file yang sudah Anda punya
import DosenFormModal from '../components/sekjur/manajemen-dosen/DosenFormModal';
import { RekapSksTable, CrudDosenTable } from '../components/sekjur/manajemen-dosen/DosenTables';

export default function ManajemenDosenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    
    // State Data
    const [activeTab, setActiveTab] = useState('rekap');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lecturers, setLecturers] = useState([]);
    const [saCourses, setSaCourses] = useState([]);
    const [academicPeriods, setAcademicPeriods] = useState([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState('latest');
    const [prodiList, setProdiList] = useState([]);

    // State Modal Form & Detail
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedDosen, setSelectedDosen] = useState(null); // Untuk edit
    const [detailDosen, setDetailDosen] = useState(null); // Untuk view detail
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- STATE UNTUK CONFIRMATION MODAL ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [dosenToDelete, setDosenToDelete] = useState(null);

    // --- FETCH DATA ---
    const fetchData = useCallback(async (periodId = 'latest') => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/sekjur/manajemen-dosen${periodId !== 'latest' ? `?periodId=${periodId}` : ''}`);
            if (!res.ok) throw new Error('Gagal memuat data dosen.');
            const data = await res.json();
            
            setLecturers(Array.isArray(data.lecturers) ? data.lecturers : []);
            setSaCourses(Array.isArray(data.saCourses) ? data.saCourses : []);
            setAcademicPeriods(Array.isArray(data.academicPeriods) ? data.academicPeriods : []);

            if (prodiList.length === 0) {
                const resProdi = await fetch('/api/master/prodi');
                if (resProdi.ok) setProdiList(await resProdi.json());
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [prodiList.length]);

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user?.selectedRole === 'sekjur') fetchData('latest');
        else setLoading(false);
    }, [isAuthenticated, router, user, fetchData]);

    // --- HANDLERS ---
    const calculateSksForDosen = useCallback((dosenId) => {
        if (!Array.isArray(saCourses)) return 0;
        return saCourses
            .filter(course => course.dosen_id === dosenId)
            .reduce((total, course) => total + (course?.course?.sks || 0), 0);
    }, [saCourses]);

    // Buka Modal Tambah/Edit
    const handleOpenModal = (mode, dosen = null) => {
        setModalMode(mode);
        setSelectedDosen(dosen);
        setIsModalOpen(true);
    };

    // 1. Trigger saat tombol hapus diklik (Buka Modal Konfirmasi)
    const confirmDelete = (dosenId) => {
        setDosenToDelete(dosenId);
        setIsDeleteModalOpen(true);
    };

    // 2. Eksekusi Hapus (Dipanggil jika user klik "Hapus" di modal)
    const executeDelete = async () => {
        if (!dosenToDelete) return;
        
        try {
            const res = await fetch(`/api/sekjur/dosen-crud?id=${dosenToDelete}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus');
            
            // Sukses
            alert('Dosen berhasil dihapus.'); // Fallback alert sederhana untuk sukses
            fetchData(selectedPeriodId);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsDeleteModalOpen(false);
            setDosenToDelete(null);
        }
    };

    // Submit Form Tambah/Edit
    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);
        try {
            const url = '/api/sekjur/dosen-crud';
            const method = modalMode === 'add' ? 'POST' : 'PUT';
            
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal menyimpan');
            }

            alert(`Dosen berhasil ${modalMode === 'add' ? 'ditambahkan' : 'diperbarui'}!`);
            setIsModalOpen(false);
            fetchData(selectedPeriodId);
        } catch (err) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user || user.selectedRole !== 'sekjur') return <Layout><p>Akses Ditolak.</p></Layout>;

    const selectedPeriodName = academicPeriods.find(p => p.id === selectedPeriodId)?.nama || 'Periode SA Aktif';

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Dosen</h1>
                <div className="bg-gray-200 p-1 rounded-lg flex">
                    <button onClick={() => setActiveTab('rekap')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'rekap' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                        Rekapitulasi SKS
                    </button>
                    <button onClick={() => setActiveTab('crud')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'crud' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
                        Kelola Data Dosen
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{error}</div>}

            {activeTab === 'rekap' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Beban SKS ({selectedPeriodName})</h2>
                        <select value={selectedPeriodId} onChange={(e) => { setSelectedPeriodId(e.target.value); fetchData(e.target.value); }} className="border border-gray-300 p-2 rounded-md bg-white shadow-sm text-sm text-gray-800">
                            <option value="latest" >Periode Terbaru</option>
                            {academicPeriods.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                        </select>
                    </div>
                    <RekapSksTable lecturers={lecturers} loading={loading} calculateSksFn={calculateSksForDosen} onDetail={setDetailDosen} />
                </div>
            )}

            {activeTab === 'crud' && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Daftar Semua Dosen</h2>
                        <button onClick={() => handleOpenModal('add')} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center text-sm hover:bg-blue-700 transition">
                            <Plus size={16} className="mr-2" /> Tambah Dosen
                        </button>
                    </div>
                    <CrudDosenTable 
                        lecturers={lecturers} 
                        loading={loading} 
                        onEdit={(dosen) => handleOpenModal('edit', dosen)} 
                        onDelete={confirmDelete} 
                    />
                </div>
            )}

            <DosenFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleFormSubmit}
                initialData={selectedDosen}
                prodiList={prodiList}
                isSubmitting={isSubmitting}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title="Hapus Data Dosen"
                confirmText="Hapus"
                confirmColor="bg-red-600 hover:bg-red-700" // Agar tombol jadi merah
            >
                Apakah Anda yakin ingin menghapus data dosen ini?
                
            </ConfirmationModal>

            {detailDosen && <UserInfoModal user={detailDosen} onClose={() => setDetailDosen(null)} />}
        </Layout>
    );
}