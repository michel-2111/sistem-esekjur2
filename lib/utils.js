// lib/utils.js
export const getPeriodStatus = (period) => {
    if (!period) {
        return { text: 'Tidak Diketahui', code: 'unknown' };
    }
    const now = new Date();
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start) {
        return { text: 'Akan Datang', code: 'upcoming' };
    } else if (now > end) {
        return { text: 'Telah Berakhir', code: 'ended' };
    } else {
        return { text: 'Sedang Berlangsung', code: 'ongoing' };
    }
};

export const getLeaveEndDate = (leaveApp) => {
    if (!leaveApp || !leaveApp.tanggal_pengajuan || !leaveApp.durasi) return null;
    
    const semesterMatch = leaveApp.durasi.match(/(\d+)\s+Semester/);
    if (!semesterMatch) return null;

    const semesterCount = parseInt(semesterMatch[1], 10);
    const startDate = new Date(leaveApp.tanggal_pengajuan);
    
    // Assumes 1 semester is 6 months
    const endDate = new Date(startDate.setMonth(startDate.getMonth() + semesterCount * 6));
    return endDate;
};