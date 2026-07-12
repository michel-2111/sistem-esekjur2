// components/sekjur/akademik/PeriodManager.js
import { useState } from 'react';
import { Plus } from 'lucide-react';
import AddPeriodModal from './AddPeriodModal';

const style = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    .pdm-wrap { font-family: 'Plus Jakarta Sans', sans-serif; }

    .pdm-card {
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06);
        border: 1px solid #F1F5F9;
        overflow: hidden;
    }

    .pdm-card-header {
        padding: 20px 20px 16px;
        border-bottom: 1px solid #F1F5F9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }

    .pdm-header-left { display: flex; align-items: center; gap: 10px; }

    .pdm-icon-box {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #059669;
        flex-shrink: 0;
    }

    .pdm-card-title {
        font-size: 15px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.3px;
    }

    .pdm-card-sub {
        font-size: 12px;
        color: #94A3B8;
        font-weight: 500;
        margin-top: 1px;
    }

    .pdm-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, #059669, #047857);
        color: white;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Plus Jakarta Sans', sans-serif;
        padding: 8px 14px;
        border-radius: 9px;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s;
        box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
    }

    .pdm-add-btn:hover {
        background: linear-gradient(135deg, #047857, #065F46);
        box-shadow: 0 4px 10px rgba(5, 150, 105, 0.4);
        transform: translateY(-1px);
    }

    .pdm-add-btn:active { transform: translateY(0); }

    .pdm-body { padding: 20px; }

    /* Status pill */
    .pdm-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px 4px 8px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 16px;
    }

    .pdm-status-pill .pdm-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .pdm-status-pill.active {
        background: #ECFDF5;
        color: #065F46;
        border: 1px solid #A7F3D0;
    }

    .pdm-status-pill.active .pdm-dot {
        background: #10B981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
        animation: pdm-pulse 2s infinite;
    }

    @keyframes pdm-pulse {
        0%, 100% { box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25); }
        50% { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.1); }
    }

    .pdm-status-pill.upcoming {
        background: #FFFBEB;
        color: #92400E;
        border: 1px solid #FDE68A;
    }

    .pdm-status-pill.upcoming .pdm-dot { background: #F59E0B; }

    .pdm-status-pill.ended {
        background: #FEF2F2;
        color: #991B1B;
        border: 1px solid #FECACA;
    }

    .pdm-status-pill.ended .pdm-dot { background: #EF4444; }

    /* Period name */
    .pdm-period-name {
        font-size: 20px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.4px;
        margin-bottom: 16px;
        line-height: 1.2;
    }

    /* Info grid */
    .pdm-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 0;
    }

    .pdm-info-card {
        background: #F8FAFC;
        border: 1px solid #F1F5F9;
        border-radius: 10px;
        padding: 12px 14px;
    }

    .pdm-info-label {
        font-size: 11px;
        font-weight: 600;
        color: #94A3B8;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .pdm-info-value {
        font-size: 13.5px;
        font-weight: 600;
        color: #1E293B;
        font-family: 'DM Mono', monospace;
    }

    /* Timeline bar */
    .pdm-timeline {
        margin-top: 16px;
        padding: 14px;
        background: #F8FAFC;
        border: 1px solid #F1F5F9;
        border-radius: 10px;
    }

    .pdm-timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .pdm-timeline-label {
        font-size: 11px;
        font-weight: 600;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .pdm-timeline-pct {
        font-size: 12px;
        font-weight: 700;
        color: #475569;
        font-family: 'DM Mono', monospace;
    }

    .pdm-bar-track {
        height: 6px;
        background: #E2E8F0;
        border-radius: 99px;
        overflow: hidden;
    }

    .pdm-bar-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.6s ease;
    }

    .pdm-bar-fill.active { background: linear-gradient(90deg, #10B981, #059669); }
    .pdm-bar-fill.upcoming { background: #F59E0B; }
    .pdm-bar-fill.ended { background: #EF4444; width: 100% !important; }

    .pdm-empty {
        padding: 32px 16px;
        text-align: center;
        color: #94A3B8;
        font-size: 13px;
    }
    `;

    const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const formatDateShort = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    const getPeriodStatus = (period) => {
    const now = new Date();
    const start = new Date(period.start_date);
    const end = new Date(period.end_date);
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (now < start) return { text: 'Akan Datang', key: 'upcoming' };
    if (now > end) return { text: 'Telah Berakhir', key: 'ended' };
    return { text: 'Sedang Berlangsung', key: 'active' };
    };

    const getProgress = (period) => {
    const now = new Date().getTime();
    const start = new Date(period.start_date).getTime();
    const end = new Date(period.end_date).getTime();
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
    };

    export default function PeriodManager({ period, onDataChange }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSave = async (newPeriod) => {
        try {
        const res = await fetch('/api/sekjur/periods', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPeriod),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Gagal menyimpan periode.');
        }
        onDataChange();
        setIsModalOpen(false);
        } catch (error) {
        alert(error.message);
        }
    };

    if (!period) {
        return (
        <>
            <style>{style}</style>
            <div className="pdm-wrap">
            <div className="pdm-card">
                <div className="pdm-card-header">
                <div className="pdm-header-left">
                    <div className="pdm-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    </div>
                    <div>
                    <div className="pdm-card-title">Manajemen Periode Akademik</div>
                    <div className="pdm-card-sub">Belum ada periode aktif</div>
                    </div>
                </div>
                <button className="pdm-add-btn" onClick={() => setIsModalOpen(true)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Tambah Periode
                </button>
                </div>
                <div className="pdm-empty">Periode tidak ditemukan. Tambahkan periode baru untuk memulai.</div>
            </div>
            </div>
            <AddPeriodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} period={period} />
        </>
        );
    }

    const status = getPeriodStatus(period);
    const progress = getProgress(period);

    return (
        <>
        <style>{style}</style>
        <div className="pdm-wrap">
            <div className="pdm-card">

            {/* Header */}
            <div className="pdm-card-header">
                <div className="pdm-header-left">
                <div className="pdm-icon-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <div>
                    <div className="pdm-card-title">Manajemen Periode Akademik</div>
                    <div className="pdm-card-sub">Periode aktif saat ini</div>
                </div>
                </div>
                <button className="pdm-add-btn" onClick={() => setIsModalOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Tambah Periode
                </button>
            </div>

            {/* Body */}
            <div className="pdm-body">

                {/* Status pill */}
                <div className={`pdm-status-pill ${status.key}`}>
                <span className="pdm-dot"/>
                {status.text}
                </div>

                {/* Period name */}
                <div className="pdm-period-name">{period.nama}</div>

                {/* Info grid */}
                <div className="pdm-info-grid">
                <div className="pdm-info-card">
                    <div className="pdm-info-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Tanggal Mulai
                    </div>
                    <div className="pdm-info-value">{formatDateShort(period.start_date)}</div>
                </div>
                <div className="pdm-info-card">
                    <div className="pdm-info-label">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Tanggal Selesai
                    </div>
                    <div className="pdm-info-value">{formatDateShort(period.end_date)}</div>
                </div>
                </div>

                {/* Progress timeline */}
                <div className="pdm-timeline">
                <div className="pdm-timeline-header">
                    <span className="pdm-timeline-label">Progress Periode</span>
                    <span className="pdm-timeline-pct">{progress}%</span>
                </div>
                <div className="pdm-bar-track">
                    <div
                    className={`pdm-bar-fill ${status.key}`}
                    style={{ width: `${status.key === 'ended' ? 100 : progress}%` }}
                    />
                </div>
                </div>
            </div>
            </div>
        </div>

        <AddPeriodModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
            period={period}
        />
        </>
    );
}