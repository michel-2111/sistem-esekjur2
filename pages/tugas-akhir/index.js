import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/router';

import TATimeline from '../../components/mahasiswa/TATimeline';
import Tahap1Persyaratan from '../../components/mahasiswa/Tahap1Persyaratan';
import Tahap2Proposal from '../../components/mahasiswa/Tahap2Proposal';
import Tahap3Hasil from '../../components/mahasiswa/Tahap3Hasil';

export default function TugasAkhirMahasiswa() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [taData, setTaData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [requirements, setRequirements] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState({});
    const [judul, setJudul] = useState('');
    const [fileProposal, setFileProposal] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = () => {
        setLoading(true);
        fetch('/api/mahasiswa/ta/persyaratan')
            .then(res => res.json())
            .then(data => {
                setRequirements(data.requirements || []);
                setTaData(data.application || null);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleFileChange = (reqId, file) => {
        setSelectedFiles(prev => ({ ...prev, [reqId]: file }));
    };

    useEffect(() => {
        if (!isAuthenticated) { router.push('/login'); return; }
        if (user?.selectedRole !== 'mahasiswa') { router.push('/dashboard'); return; }
        fetchData();
    }, [isAuthenticated, user, router]);

    const getStep1Status = () => {
        const s = taData?.requirements_status;
        if (s === 'valid') return 'valid';
        if (s === 'menunggu_validasi') return 'pending';
        if (s === 'invalid') return 'rejected';
        return 'active';
    };

    const getStep2Status = () => {
        const reqStatus = taData?.requirements_status;
        const propStatus = taData?.proposal_status;

        if (reqStatus !== 'valid') return 'locked';
        if (propStatus === 'disetujui') return 'valid';
        if (propStatus === 'menunggu_persetujuan') return 'pending';
        if (propStatus === 'ditolak') return 'rejected';
        return 'active';
    };

    const getStep3Status = () => {
        if (getStep2Status() !== 'valid') return 'locked';
        if (!taData?.examiners || taData.examiners.length === 0) return 'locked';

        const totalPenguji = taData.examiners.length;
        const sudahMenilai = taData.examiners.filter(ex => ex.status_penilaian === 'sudah_menilai').length;

        if (sudahMenilai === 0) return 'pending';
        if (sudahMenilai < totalPenguji) return 'pending';
        return 'valid';
    };

    const hitungRataRata = () => {
        if (!taData?.examiners || taData.examiners.length === 0) return 0;
        let totalSemuaDosen = 0;
        let dosenMenilai = 0;

        taData.examiners.forEach(ex => {
            if (ex.status_penilaian === 'sudah_menilai' && ex.grades) {
                let totalNilaiDosen = 0;
                ex.grades.forEach(g => {
                    totalNilaiDosen += (g.score * g.component.bobot) / 100;
                });
                totalSemuaDosen += totalNilaiDosen;
                dosenMenilai++;
            }
        });

        return dosenMenilai > 0 ? (totalSemuaDosen / dosenMenilai).toFixed(2) : 0;
    };

    const handleUploadRequirements = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            let hasFiles = false;
            for (const reqId in selectedFiles) {
                if (selectedFiles[reqId]) {
                    formData.append(`file_${reqId}`, selectedFiles[reqId]);
                    hasFiles = true;
                }
            }
            if (!hasFiles) {
                setIsSubmitting(false);
                return alert("Pilih minimal 1 file untuk diunggah/direvisi.");
            }
            const res = await fetch('/api/mahasiswa/ta/persyaratan', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Gagal menyimpan dokumen");
            alert("Dokumen persyaratan dikirim!");
            setSelectedFiles({});
            fetchData();
        } catch (err) { 
            alert(err.message || "Terjadi kesalahan saat mengunggah."); 
        } finally { setIsSubmitting(false); }
    };

    const handleUploadProposal = async (e) => {
        e.preventDefault();
        if (!judul || !fileProposal) return alert("Judul dan File Proposal wajib diisi.");
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', judul);
        formData.append('file', fileProposal);
        try {
            const res = await fetch('/api/mahasiswa/ta/proposal', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Gagal upload proposal");
            alert("Proposal berhasil diajukan!");
            fetchData();
        } catch (err) { alert(err.message); } 
        finally { setIsSubmitting(false); }
    };

    if (loading) return <Layout><p>Loading...</p></Layout>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Tugas Akhir</h1>

            <div className="px-4 mb-8">
                <TATimeline 
                    status1={getStep1Status()} 
                    status2={getStep2Status()} 
                    status3={getStep3Status()} 
                />
            </div>

            <div className="space-y-6">
                
                <Tahap1Persyaratan 
                    status={getStep1Status()}
                    taData={taData}
                    requirements={requirements}
                    handleFileChange={handleFileChange}
                    handleUploadRequirements={handleUploadRequirements}
                    isSubmitting={isSubmitting}
                />

                <Tahap2Proposal 
                    status={getStep2Status()}
                    taData={taData}
                    judul={judul}
                    setJudul={setJudul}
                    setFileProposal={setFileProposal}
                    handleUploadProposal={handleUploadProposal}
                    isSubmitting={isSubmitting}
                />

                <Tahap3Hasil 
                    status={getStep3Status()}
                    taData={taData}
                    hitungRataRata={hitungRataRata}
                />

            </div>
        </Layout>
    );
}