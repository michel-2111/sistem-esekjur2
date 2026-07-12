// pages/manajemen-dokumen.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import SendDocumentModal from '../components/sekjur/SendDocumentModal';
import EditTemplateModal from '../components/sekjur/EditTemplateModal';
import { useAppContext } from '../context/AppContext';
import { useRouter } from 'next/router';
import { FileUp, Edit3, Download, FileText, Send, RefreshCw, AlertCircle, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react';

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .dok-page { font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }

  /* === PAGE HEADER === */
  .dok-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
  }

  .dok-header-icon {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #0EA5E9, #6366F1);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .dok-header-badge {
    font-size: 10.5px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: #94A3B8; margin-bottom: 3px;
  }

  .dok-page-title {
    font-size: 24px; font-weight: 800;
    color: #0F172A; letter-spacing: -0.6px; line-height: 1.1;
  }

  .dok-page-sub { font-size: 13.5px; color: #64748B; margin-top: 4px; }

  /* === STATS ROW === */
  .dok-stats {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-bottom: 24px;
  }

  .dok-stat-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px;
    border-radius: 12px;
    border: 1px solid;
    font-size: 13px;
  }

  .dok-stat-val { font-size: 16px; font-weight: 800; font-family: 'DM Mono', monospace; }
  .dok-stat-lbl { font-weight: 600; font-size: 12px; opacity: 0.75; }

  /* === SECTION CARD === */
  .dok-section {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #F1F5F9;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05);
    overflow: hidden;
    margin-bottom: 20px;
  }

  .dok-section-accent { height: 3px; width: 100%; }

  .dok-section-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid #F8FAFC;
    gap: 12px;
  }

  .dok-section-left { display: flex; align-items: center; gap: 10px; }

  .dok-section-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .dok-section-title { font-size: 14.5px; font-weight: 700; color: #0F172A; letter-spacing: -0.2px; }
  .dok-section-sub { font-size: 12px; color: #94A3B8; margin-top: 1px; }

  /* === ACTION BUTTON === */
  .dok-action-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 9px; border: none;
    font-size: 13px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; white-space: nowrap; transition: all 0.15s;
  }

  .dok-action-btn.blue {
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    color: white;
    box-shadow: 0 2px 6px rgba(37,99,235,0.28);
  }

  .dok-action-btn.blue:hover {
    background: linear-gradient(135deg, #1D4ED8, #1E40AF);
    box-shadow: 0 4px 10px rgba(37,99,235,0.38);
    transform: translateY(-1px);
  }

  /* === TEMPLATE LIST === */
  .dok-template-list { padding: 12px; display: flex; flex-direction: column; gap: 6px; }

  .dok-template-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 14px;
    background: #FAFAFA;
    border: 1px solid #F1F5F9;
    border-radius: 10px;
    transition: all 0.15s;
  }

  .dok-template-item:hover { background: #EFF6FF; border-color: #BFDBFE; }

  .dok-template-file-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, #DBEAFE, #C7D2FE);
    display: flex; align-items: center; justify-content: center;
    color: #3730A3; flex-shrink: 0;
  }

  .dok-template-name { flex: 1; font-size: 13.5px; font-weight: 500; color: #1E293B; }

  .dok-edit-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 11px; border-radius: 7px;
    border: 1.5px solid #FDE68A;
    background: #FFFBEB; color: #B45309;
    font-size: 12px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.12s;
    opacity: 0;
  }

  .dok-template-item:hover .dok-edit-btn { opacity: 1; }
  .dok-edit-btn:hover { background: #FEF3C7; border-color: #F59E0B; }

  /* === TABLE === */
  .dok-table-wrap { padding: 0; overflow-x: auto; }

  .dok-table {
    width: 100%; border-collapse: collapse;
    font-size: 13px;
  }

  .dok-table thead tr {
    background: #F8FAFC;
    border-bottom: 1px solid #F1F5F9;
  }

  .dok-table th {
    padding: 10px 16px;
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #94A3B8;
    white-space: nowrap;
  }

  .dok-table th:last-child { text-align: center; }

  .dok-table tbody tr {
    border-bottom: 1px solid #F8FAFC;
    transition: background 0.12s;
  }

  .dok-table tbody tr:last-child { border-bottom: none; }
  .dok-table tbody tr:hover { background: #F8FAFC; }

  .dok-table td {
    padding: 12px 16px;
    vertical-align: top;
    color: #1E293B;
  }

  .dok-doc-title {
    font-weight: 700; font-size: 13.5px; color: #0F172A;
    display: flex; align-items: flex-start; gap: 8px;
  }

  .dok-doc-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #3B82F6; flex-shrink: 0; margin-top: 5px;
  }

  .dok-recipients-text { font-size: 12.5px; color: #475569; line-height: 1.6; }

  .dok-expand-btn {
    display: inline-flex; align-items: center; gap: 3px;
    background: none; border: none; cursor: pointer;
    font-size: 11.5px; font-weight: 600;
    color: #3B82F6; font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 1px 0; margin-top: 2px;
  }

  .dok-expand-btn:hover { color: #1D4ED8; }

  .dok-timestamp {
    font-size: 12px; color: #64748B;
    font-family: 'DM Mono', monospace;
    white-space: nowrap;
  }

  .dok-download-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px; border-radius: 7px;
    background: #EFF6FF; border: 1px solid #BFDBFE;
    color: #1D4ED8; font-size: 12px; font-weight: 600;
    text-decoration: none; transition: all 0.12s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap;
  }

  .dok-download-btn:hover { background: #DBEAFE; border-color: #93C5FD; }

  .dok-empty {
    padding: 40px 20px; text-align: center;
    color: #94A3B8; font-size: 13px;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }

  .dok-empty-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: #F8FAFC; border: 1.5px dashed #E2E8F0;
    display: flex; align-items: center; justify-content: center; color: #CBD5E1;
  }

  /* === LOADING === */
  .dok-skeleton {
    background: #F8FAFC; border-radius: 12px;
    animation: dok-pulse 1.5s infinite;
    height: 14px; border-radius: 6px;
  }

  @keyframes dok-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* === ERROR === */
  .dok-error {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 16px 20px; border-radius: 12px;
    background: #FEF2F2; border: 1px solid #FECACA;
  }
`;

const ExpandableText = ({ text, maxLength = 120 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!text) return <span style={{ color: '#CBD5E1' }}>—</span>;
    if (text.length <= maxLength) return <span className="dok-recipients-text">{text}</span>;
    return (
        <div>
            <span className="dok-recipients-text">
                {isExpanded ? text : `${text.substring(0, maxLength)}…`}
            </span>
            <br />
            <button className="dok-expand-btn" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded
                    ? <><ChevronUp size={11} /> Sembunyikan</>
                    : <><ChevronDown size={11} /> Selengkapnya</>}
            </button>
        </div>
    );
};

function SkeletonRow() {
    return (
        <tr style={{ borderBottom: '1px solid #F8FAFC' }}>
            {[40, 60, 20, 10].map((w, i) => (
                <td key={i} style={{ padding: '14px 16px' }}>
                    <div className="dok-skeleton" style={{ width: `${w}%` }} />
                </td>
            ))}
        </tr>
    );
}

export default function ManajemenDokumenPage() {
    const { user, isAuthenticated } = useAppContext();
    const router = useRouter();
    const [data, setData] = useState({ templates: [], sentDocuments: [], recipients: [] });
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState(null);

    const fetchData = async (silent = false) => {
        if (silent) setIsRefreshing(true);
        else setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/sekjur/dokumen');
            if (!res.ok) throw new Error('Gagal memuat data.');
            const jsonData = await res.json();
            const safeSentDocuments = jsonData.sentDocuments.map(doc => ({
                ...doc,
                recipients: Array.isArray(doc.recipients) ? doc.recipients : [],
            }));
            setData({ ...jsonData, sentDocuments: safeSentDocuments });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        else if (user?.selectedRole === 'sekjur') fetchData();
    }, [isAuthenticated, router, user]);

    const handleSaveDocument = async (payload) => {
        const formData = new FormData();
        formData.append('file', payload.file);
        formData.append('title', payload.title);
        formData.append('isTemplate', payload.isTemplate);
        formData.append('templateType', payload.templateType);
        formData.append('recipientIds', JSON.stringify(payload.recipientIds));
        await fetch('/api/sekjur/dokumen', { method: 'POST', body: formData });
        fetchData(true);
    };

    const handleUpdateTemplate = async (templateId, file) => {
        const formData = new FormData();
        formData.append('action', 'UPDATE_TEMPLATE');
        formData.append('templateId', templateId);
        formData.append('file', file);
        await fetch('/api/sekjur/dokumen', { method: 'POST', body: formData });
        fetchData(true);
    };

    if (!user || user.selectedRole !== 'sekjur') {
        return (
            <Layout>
                <style>{style}</style>
                <div className="dok-error">
                    <AlertCircle size={18} style={{ color: '#EF4444', flexShrink: 0 }} />
                    <p style={{ fontSize: '13.5px', color: '#DC2626', fontWeight: 500 }}>
                        Hanya Sekretaris Jurusan yang dapat mengakses halaman ini.
                    </p>
                </div>
            </Layout>
        );
    }

    const totalRecipients = new Set(
        data.sentDocuments.flatMap(d => d.recipients.map(r => r.user?.id))
    ).size;

    return (
        <Layout>
            <style>{style}</style>
            <div className="dok-page">

                {/* Page Header */}
                <div className="dok-page-header">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div className="dok-header-icon">
                            <FolderOpen size={19} color="#fff" />
                        </div>
                        <div>
                            <div className="dok-header-badge">Sekretaris Jurusan</div>
                            <h1 className="dok-page-title">Manajemen Dokumen</h1>
                            <p className="dok-page-sub">Kelola template dan riwayat pengiriman dokumen</p>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchData(true)}
                        disabled={isRefreshing || loading}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '10px',
                            border: '1px solid #E2E8F0', background: '#F8FAFC',
                            color: '#475569', fontSize: '13px', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
                            opacity: (isRefreshing || loading) ? 0.5 : 1,
                            marginTop: '4px',
                        }}
                    >
                        <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                        Refresh
                    </button>
                </div>

                {/* Stats */}
                {!loading && !error && (
                    <div className="dok-stats">
                        <div className="dok-stat-chip" style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' }}>
                            <FileText size={14} />
                            <span className="dok-stat-val">{data.templates.length}</span>
                            <span className="dok-stat-lbl">Template</span>
                        </div>
                        <div className="dok-stat-chip" style={{ background: '#F0FDF4', borderColor: '#BBF7D0', color: '#15803D' }}>
                            <Send size={14} />
                            <span className="dok-stat-val">{data.sentDocuments.length}</span>
                            <span className="dok-stat-lbl">Dokumen Terkirim</span>
                        </div>
                        <div className="dok-stat-chip" style={{ background: '#F5F3FF', borderColor: '#DDD6FE', color: '#6D28D9' }}>
                            <FileUp size={14} />
                            <span className="dok-stat-val">{totalRecipients}</span>
                            <span className="dok-stat-lbl">Total Penerima</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="dok-error" style={{ marginBottom: 20 }}>
                        <AlertCircle size={16} style={{ color: '#EF4444', flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p style={{ fontSize: '13.5px', fontWeight: 600, color: '#DC2626' }}>Gagal Memuat Data</p>
                            <p style={{ fontSize: '12px', color: '#EF4444', marginTop: 2 }}>{error}</p>
                            <button onClick={() => fetchData()} style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, marginTop: 6 }}>
                                Coba lagi
                            </button>
                        </div>
                    </div>
                )}

                {/* Template Section */}
                <div className="dok-section">
                    <div className="dok-section-accent" style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }} />
                    <div className="dok-section-header">
                        <div className="dok-section-left">
                            <div className="dok-section-icon" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)', color: '#4F46E5' }}>
                                <FileText size={15} />
                            </div>
                            <div>
                                <div className="dok-section-title">Template Dokumen</div>
                                <div className="dok-section-sub">{data.templates.length} template tersedia</div>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: '12px' }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: 44, background: '#F8FAFC', borderRadius: 10, marginBottom: 6, animation: 'dok-pulse 1.5s infinite' }} />
                            ))}
                        </div>
                    ) : data.templates.length === 0 ? (
                        <div className="dok-empty">
                            <div className="dok-empty-icon"><FileText size={18} /></div>
                            <span>Belum ada template dokumen</span>
                        </div>
                    ) : (
                        <div className="dok-template-list">
                            {data.templates.map((template, i) => (
                                <div key={template.id} className="dok-template-item">
                                    <div className="dok-template-file-icon">
                                        <FileText size={14} />
                                    </div>
                                    <span style={{ fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#94A3B8', marginRight: 4 }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    <span className="dok-template-name">{template.title}</span>
                                    <button
                                        className="dok-edit-btn"
                                        onClick={() => { setTemplateToEdit(template); setIsEditModalOpen(true); }}
                                    >
                                        <Edit3 size={12} /> Ubah File
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sent Documents Section */}
                <div className="dok-section">
                    <div className="dok-section-accent" style={{ background: 'linear-gradient(90deg, #2563EB, #0EA5E9)' }} />
                    <div className="dok-section-header">
                        <div className="dok-section-left">
                            <div className="dok-section-icon" style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', color: '#1D4ED8' }}>
                                <Send size={14} />
                            </div>
                            <div>
                                <div className="dok-section-title">Riwayat Dokumen Terkirim</div>
                                <div className="dok-section-sub">{data.sentDocuments.length} dokumen telah dikirim</div>
                            </div>
                        </div>
                        <button className="dok-action-btn blue" onClick={() => setIsModalOpen(true)}>
                            <FileUp size={14} /> Kirim Dokumen
                        </button>
                    </div>

                    <div className="dok-table-wrap">
                        {loading ? (
                            <table className="dok-table">
                                <thead>
                                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                                        {['JUDUL', 'PENERIMA', 'TANGGAL KIRIM', 'AKSI'].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>{[1,2,3].map(i => <SkeletonRow key={i} />)}</tbody>
                            </table>
                        ) : data.sentDocuments.length === 0 ? (
                            <div className="dok-empty">
                                <div className="dok-empty-icon"><Send size={18} /></div>
                                <span style={{ fontWeight: 600 }}>Belum ada dokumen yang dikirim</span>
                                <span style={{ fontSize: '12px', color: '#CBD5E1' }}>Klik "Kirim Dokumen" untuk memulai</span>
                            </div>
                        ) : (
                            <table className="dok-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '28%' }}>Judul Dokumen</th>
                                        <th style={{ width: '42%' }}>Penerima</th>
                                        <th style={{ width: '18%' }}>Tanggal Kirim</th>
                                        <th style={{ width: '12%', textAlign: 'center' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.sentDocuments.map(doc => (
                                        <tr key={doc.id}>
                                            <td>
                                                <div className="dok-doc-title">
                                                    <span className="dok-doc-dot" />
                                                    {doc.title}
                                                </div>
                                            </td>
                                            <td>
                                                <ExpandableText
                                                    text={doc.recipients.map(r => r.user?.nama).filter(Boolean).join(', ')}
                                                    maxLength={120}
                                                />
                                            </td>
                                            <td>
                                                <span className="dok-timestamp">
                                                    {new Date(doc.timestamp).toLocaleDateString('id-ID', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                    <br />
                                                    <span style={{ color: '#CBD5E1', fontSize: '11px' }}>
                                                        {new Date(doc.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <a
                                                    href={doc.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="dok-download-btn"
                                                >
                                                    <Download size={12} /> Unduh
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <SendDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDocument}
                recipientList={data.recipients}
            />
            <EditTemplateModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateTemplate}
                template={templateToEdit}
            />
        </Layout>
    );
}