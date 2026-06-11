import React from 'react';

const ViewTicketModal = ({ isOpen, onClose, ticket }) => {
    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Ticket Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Ticket ID
                            </label>
                            <p className="text-gray-900">#{ticket.id}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Status
                            </label>
                            <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${ticket.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-green-100 text-green-800'
                                    }`}
                            >
                                {ticket.status}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Issue Type
                            </label>
                            <p className="text-gray-900">{ticket.issueType}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Customer Type
                            </label>
                            <p className="text-gray-900">{ticket.customerType}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-1">
                            Created At
                        </label>
                        <p className="text-gray-900">
                            {new Date(ticket.createdAt).toLocaleString()}
                        </p>
                    </div>

                    {ticket.resolvedAt && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-1">
                                Resolved At
                            </label>
                            <p className="text-gray-900">
                                {new Date(ticket.resolvedAt).toLocaleString()}
                            </p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                            Description
                        </label>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <p className="text-gray-900 whitespace-pre-wrap">
                                {ticket.description}
                            </p>
                        </div>
                    </div>

                    {ticket.adminRemarks && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2">
                                Admin Remarks
                            </label>
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                <p className="text-gray-900 whitespace-pre-wrap">
                                    {ticket.adminRemarks}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTicketModal;