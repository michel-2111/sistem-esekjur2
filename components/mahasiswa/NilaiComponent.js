// components/mahasiswa/NilaiComponent.js

const STATUS_MAP = {
    telah_dinilai: 'Telah Dinilai',
};

export default function NilaiComponent({ application }) {
    const gradedCourses = application.application_courses.map(ac => ({
        nama: ac.course.nama,
        nilai: ac.nilai || 'N/A', 
    }));

    return (
        <div className="w-full text-gray-900">
            <h1 className="text-3xl font-bold mb-6">Nilai Akhir Semester Antara</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-4">
                    Status: {STATUS_MAP[application.status] || application.status}
                </h2>
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="py-2 font-bold text-gray-900">Mata Kuliah</th>
                            <th className="py-2 font-bold text-gray-900">Nilai Huruf</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradedCourses.map((course, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-3 text-gray-800">{course.nama}</td>
                                <td className="py-3 font-bold text-gray-800">{course.nilai}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}