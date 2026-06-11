// components/PsnModal.jsx
import React from 'react';

const PsnModal = ({ open, onClose, productName, serialNumbers }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Product Serial Numbers – {productName}
                    </h2>
                    <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto max-h-96 border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold">SID</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold">MID</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold">TID</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold">VPAID</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold">Mob No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {serialNumbers.map(sn => (
                                <tr key={sn.id} className="border-t">
                                    <td className="px-4 py-2 text-sm">{sn.sid || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{sn.mid || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{sn.tid || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{sn.vpaid || '-'}</td>
                                    <td className="px-4 py-2 text-sm">{sn.mobNumber || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PsnModal;
