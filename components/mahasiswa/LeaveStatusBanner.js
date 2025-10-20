// components/mahasiswa/LeaveStatusBanner.js
import { Info } from 'lucide-react';

// Helper function to calculate the leave end date
const getLeaveEndDate = (leaveApp) => {
    if (!leaveApp || !leaveApp.tanggal_pengajuan || !leaveApp.durasi) return null;
    
    // Extracts the number of semesters from a string like "2 Semester (1 Tahun)"
    const semesterMatch = leaveApp.durasi.match(/(\d+)\s+Semester/);
    if (!semesterMatch) return null;

    const semesterCount = parseInt(semesterMatch[1], 10);
    const startDate = new Date(leaveApp.tanggal_pengajuan);
    
    // Assumes 1 semester is 6 months
    const endDate = new Date(startDate.setMonth(startDate.getMonth() + semesterCount * 6));
    return endDate;
};

// Helper function to format the date
const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export default function LeaveStatusBanner({ leaveApplication }) {
    if (!leaveApplication || leaveApplication.status !== 'disetujui') {
        return null;
    }

    const leaveEndDate = getLeaveEndDate(leaveApplication);
    const isCutiAktif = leaveEndDate && new Date() < leaveEndDate;

    // Only render the banner if the leave is currently active
    if (!isCutiAktif) {
        return null;
    }

    return (
        <div className="p-4 mb-6 rounded-lg text-white bg-green-500 flex items-center shadow-md">
            <Info className="h-6 w-6 mr-3 flex-shrink-0" />
            <div>
                <p className="font-bold">Status Akademik: Sedang Dalam Masa Cuti</p>
                <p className="text-sm">
                    Durasi Cuti: {leaveApplication.durasi}. Diperkirakan selesai pada {formatDate(leaveEndDate)}.
                </p>
            </div>
        </div>
    );
}