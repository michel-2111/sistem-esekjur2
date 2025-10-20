// components/shared/ConfirmationModal.js
export default function ConfirmationModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children,
    confirmText = 'Konfirmasi', // Teks default
    confirmColor = 'bg-blue-600 hover:bg-blue-700' // Warna default
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 text-gray-900">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">{title}</h2>
                    <p className="text-gray-600">{children}</p>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Batal</button>
                        <button onClick={onConfirm} className={`${confirmColor} text-white px-4 py-2 rounded-md`}>
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}