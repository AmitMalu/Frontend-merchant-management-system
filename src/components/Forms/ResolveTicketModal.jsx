import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../constants/API/axiosInstance';

const ResolveTicketModal = ({ isOpen, onClose, ticket, onTicketResolved }) => {
    
    const [adminRemarks, setAdminRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            
            setAdminRemarks('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();

     

        if (!adminRemarks.trim()) {
            setError('Please enter admin remarks');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/support-tickets/admin/resolve/${ticket.id}`, null, {
                params: {
                    adminRemarks: adminRemarks.trim()
                }
            });

            onTicketResolved();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resolve ticket');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-2xl font-bold">Resolve Ticket #{ticket?.id}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Ticket Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-lg mb-3">Ticket Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Customer Name</p>
                                <p className="font-medium">{ticket?.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Customer Type</p>
                                <p className="font-medium">{ticket?.customerType}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Phone Number</p>
                                <p className="font-medium">{ticket?.phoneNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Issue Type</p>
                                <p className="font-medium">{ticket?.issueType}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-sm text-gray-600">Description</p>
                                <p className="font-medium">{ticket?.description}</p>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Remarks <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={adminRemarks}
                                    onChange={(e) => setAdminRemarks(e.target.value)}
                                    rows="4"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter resolution details and remarks"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                                disabled={loading}
                            >
                                {loading ? 'Resolving...' : 'Resolve Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResolveTicketModal;