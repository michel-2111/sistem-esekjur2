// components/shared/ConfirmationModal.js
export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    children,
    confirmText = 'Konfirmasi',
    confirmColor = 'bg-indigo-600 hover:bg-indigo-700',
    danger = false,
}) {
    if (!isOpen) return null;

    const confirmStyle = danger
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/30'
        : `${confirmColor} focus:ring-indigo-500/30`;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
                style={{ boxShadow: '0 20px 50px -10px rgba(15,23,42,0.2)' }}
            >
                {/* Top accent */}
                {danger && <div className="h-1 w-full bg-linear-to-r from-red-500 to-rose-500" />}
                {!danger && <div className="h-1 w-full bg-linear-to-r from-indigo-500 to-violet-500" />}

                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-50' : 'bg-indigo-50'}`}>
                        {danger ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <line x1="12" y1="9" x2="12" y2="13"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        )}
                    </div>

                    <h2 className="text-base font-bold text-slate-800 mb-2">{title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{children}</p>
                </div>

                <div className="px-6 pb-6 flex gap-2.5 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm focus:outline-none focus:ring-2 ${confirmStyle}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}