// components/sekjur/manajemen-dosen/DosenTables.js
import { useState } from 'react';
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

function Pagination({ totalItems, itemsPerPage, currentPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-medium">{totalItems}</span> hasil
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {/* Loop simple untuk nomor halaman */}
                        {[...Array(totalPages)].map((_, idx) => (
                            <button
                                key={idx + 1}
                                onClick={() => onPageChange(idx + 1)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === idx + 1
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export function RekapSksTable({ lecturers, loading, calculateSksFn, onDetail }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Logika Slice Data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = lecturers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-900">
                        <tr>
                            <th className="p-3 border-b">Nama Dosen</th>
                            <th className="p-3 border-b">NIP</th>
                            <th className="p-3 border-b text-center">Total SKS</th>
                            <th className="p-3 border-b text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Memuat data...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">Tidak ada data dosen.</td></tr>
                        ) : currentItems.map(dosen => (
                            <tr key={dosen.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-700 font-medium">{dosen.nama}</td>
                                <td className="p-3 text-gray-700">{dosen.identifier}</td>
                                <td className="p-3 text-center font-bold text-blue-600">{calculateSksFn(dosen.id)}</td>
                                <td className="p-3 text-gray-700 text-center">
                                    <button onClick={() => onDetail(dosen)} className="text-gray-500 hover:text-blue-600">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && lecturers.length > 0 && (
                <Pagination 
                    totalItems={lecturers.length} 
                    itemsPerPage={itemsPerPage} 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                />
            )}
        </div>
    );
}

export function CrudDosenTable({ lecturers, loading, onEdit, onDelete }) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Logika Slice Data
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = lecturers.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="p-3 border-b">Nama</th>
                            <th className="p-3 border-b">NIP</th>
                            <th className="p-3 border-b">Prodi</th>
                            <th className="p-3 border-b text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Memuat data...</td></tr>
                        ) : currentItems.length === 0 ? (
                            <tr><td colSpan="4" className="p-4 text-center text-gray-500">Tidak ada data dosen.</td></tr>
                        ) : currentItems.map(dosen => (
                            <tr key={dosen.id} className="hover:bg-gray-50">
                                <td className="p-3 text-gray-700 font-medium">{dosen.nama}</td>
                                <td className="p-3 text-gray-700">{dosen.identifier}</td>
                                <td className="p-3 text-gray-700">{dosen.prodi?.nama || '-'}</td>
                                <td className="p-3 text-gray-700 flex justify-center space-x-2">
                                    <button 
                                        onClick={() => onEdit(dosen)}
                                        className="text-amber-500 hover:text-amber-700 bg-amber-50 p-2 rounded-full"
                                        title="Edit"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(dosen.id)}
                                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-full"
                                        title="Hapus"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {!loading && lecturers.length > 0 && (
                <Pagination 
                    totalItems={lecturers.length} 
                    itemsPerPage={itemsPerPage} 
                    currentPage={currentPage} 
                    onPageChange={setCurrentPage} 
                />
            )}
        </div>
    );
}