import React from 'react';
import { X } from 'lucide-react';

const LogDetailModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const formatValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return value.toString();
    };

    const entries = Object.entries(log).filter(([key]) => key !== 'id');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Log Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="px-6 py-4 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        {entries.map(([key, value]) => (
                            <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                                <div className="text-sm font-semibold text-gray-700 mb-1 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className={`text-sm text-gray-900 ${typeof value === 'object' || (typeof value === 'string' && value.length > 100)
                                        ? 'font-mono text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-60'
                                        : ''
                                    }`}>
                                    {formatValue(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogDetailModal;