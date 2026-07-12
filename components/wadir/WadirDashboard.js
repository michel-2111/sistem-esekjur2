// components/wadir/WadirDashboard.js
import { useEffect, useState } from 'react';
import { FileCheck, Mail, TrendingUp, ArrowRight } from 'lucide-react';

const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    .wd-wrap * { box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
    @keyframes wd-pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
    @keyframes wd-up { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    .wd-skeleton { background: #f1f3f5; border-radius: 8px; animation: wd-pulse 1.4s ease-in-out infinite; }
    .wd-stat-card {
        background: white; border-radius: 16px;
        border: 1.5px solid #e5e7eb;
        padding: 22px 24px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        display: flex; flex-direction: column; gap: 16px;
        animation: wd-up 0.3s ease both;
        transition: box-shadow 0.15s, transform 0.15s;
        cursor: default;
    }
    .wd-stat-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-2px); }
    .wd-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
    .wd-icon-wrap { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .wd-trend { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
    .wd-value { font-size: 2.4rem; font-weight: 800; color: #0f1923; line-height: 1; letter-spacing: -0.04em; }
    .wd-label { font-size: 0.8rem; color: #6b7280; font-weight: 500; margin-top: 4px; line-height: 1.4; }
    .wd-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f1f3f5; }
    .wd-footer-link { display: inline-flex; align-items: center; gap: 5px; font-size: 0.78rem; font-weight: 600; text-decoration: none; transition: gap 0.15s; cursor: pointer; background: none; border: none; padding: 0; }
    .wd-footer-link:hover { gap: 8px; }
    .wd-divider-label { font-size: 0.7rem; color: #d1d5db; font-weight: 500; text-transform: uppercase; letter-spacing: 0.06em; }
    .wd-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    @media(max-width: 580px){ .wd-grid { grid-template-columns: 1fr; } }
`;

const STATS_CONFIG = [
    {
        key: 'leaveApplicationsCount',
        icon: FileCheck,
        label: 'Pengajuan Cuti Perlu Persetujuan',
        iconBg: '#f0fdf4',
        iconColor: '#059669',
        trendBg: '#f0fdf4',
        trendColor: '#059669',
        trendLabel: 'Menunggu',
        valueColor: '#059669',
        footerLabel: 'Tinjau pengajuan',
        footerColor: '#059669',
        animDelay: '0s',
    },
    {
        key: 'documentCount',
        icon: Mail,
        label: 'Total Dokumen Diterima',
        iconBg: '#fff7ed',
        iconColor: '#ea580c',
        trendBg: '#fff7ed',
        trendColor: '#ea580c',
        trendLabel: 'Dokumen',
        valueColor: '#ea580c',
        footerLabel: 'Lihat semua dokumen',
        footerColor: '#ea580c',
        animDelay: '0.07s',
    },
];

function StatCardSkeleton() {
    return (
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid #e5e7eb', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="wd-skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
                <div className="wd-skeleton" style={{ width: 70, height: 24, borderRadius: 20 }} />
            </div>
            <div>
                <div className="wd-skeleton" style={{ width: 60, height: 38, borderRadius: 8, marginBottom: 8 }} />
                <div className="wd-skeleton" style={{ width: '70%', height: 14, borderRadius: 6 }} />
            </div>
            <div style={{ paddingTop: 14, borderTop: '1px solid #f1f3f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="wd-skeleton" style={{ width: '50%', height: 12, borderRadius: 6 }} />
                <div className="wd-skeleton" style={{ width: 20, height: 12, borderRadius: 6 }} />
            </div>
        </div>
    );
}

function StatCard({ config, value, index }) {
    const Icon = config.icon;
    return (
        <div className="wd-stat-card" style={{ animationDelay: config.animDelay }}>
            <div className="wd-card-top">
                <div className="wd-icon-wrap" style={{ background: config.iconBg }}>
                    <Icon size={22} color={config.iconColor} />
                </div>
                <div className="wd-trend" style={{ background: config.trendBg, color: config.trendColor }}>
                    <TrendingUp size={11} /> {config.trendLabel}
                </div>
            </div>
            <div>
                <div className="wd-value" style={{ color: config.valueColor }}>{value}</div>
                <div className="wd-label">{config.label}</div>
            </div>
            <div className="wd-card-footer">
                <button className="wd-footer-link" style={{ color: config.footerColor }}>
                    {config.footerLabel} <ArrowRight size={13} />
                </button>
                <span className="wd-divider-label">#{index + 1}</span>
            </div>
        </div>
    );
}

export default function WadirDashboard() {
    const [data, setData] = useState({ leaveApplicationsCount: 0, documentCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/wadir/dashboard')
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <style>{css}</style>
            <div className="wd-wrap" style={{ padding: 4 }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        Portal Akademik
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f1923', letterSpacing: '-0.03em', marginBottom: 4 }}>
                        Dashboard Wakil Direktur
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Selamat datang — berikut ringkasan aktivitas terkini</p>
                </div>

                {/* Stats Grid */}
                <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                        Ringkasan
                    </div>
                    <div className="wd-grid">
                        {loading
                            ? [1, 2].map(i => <StatCardSkeleton key={i} />)
                            : STATS_CONFIG.map((cfg, i) => (
                                <StatCard key={cfg.key} config={cfg} value={data[cfg.key]} index={i} />
                            ))
                        }
                    </div>
                </div>
            </div>
        </>
    );
}