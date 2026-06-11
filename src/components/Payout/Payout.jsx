// Payout.jsx
import React, { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Trash, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AddBankModal from './AddBankModal';
import api from '../../constants/API/axiosInstance';
//import { dummyBanks } from './payoutDummyData';


const Payout = () => {
    const [banks, setBanks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const customerId = localStorage.getItem('customerId');
    const customerType = localStorage.getItem("userType");

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/payout/banks/${customerId}`, {
                params: {
                    customerType
                }
            });

            setBanks(response.data);
        } catch (error) {
            toast.error('Failed to fetch banks');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBank = async (bankId) => {
        toast.warn(
            <div>
                <p>Are you sure you want to delete this bank?</p>
                <div className="flex gap-2 mt-2">
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                        onClick={() => confirmDelete(bankId)}
                    >
                        Yes, Delete
                    </button>
                    <button
                        className="bg-gray-300 text-black px-3 py-1 rounded text-sm"
                        onClick={() => toast.dismiss()}
                    >
                        Cancel
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeButton: false,
            }
        );
    };

    const confirmDelete = async (bankId) => {
        try {
            await api.delete(`/payout/delete-bank/${bankId}`);
            setBanks(banks.filter(bank => bank.id !== bankId));
            toast.success('Bank deleted successfully');
            toast.dismiss();
        } catch (error) {
            toast.error('Failed to delete bank');
        }
    };

    const handleTransfer = async (bankId, amount, transferType) => {
        try {
            const response = await api.post('/payment-payout/transfer', {
                payoutBankId:bankId,
                amount,
                paymentMode:transferType,
                customerId
            });
            toast.success(response.data.message || 'Transfer initiated successfully');
            
        } catch (error) {
            const errMsg =
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Transfer failed";

            toast.error(errMsg);
        }

    };

    const columns = [
        {
            accessorKey: 'holderName',
            header: 'Holder Name',
        },
        {
            accessorKey: 'bankName',
            header: 'Bank Name',
        },
        {
            accessorKey: 'accountNumber',
            header: 'Account No',
            cell: ({ getValue }) => {
                const value = getValue();
                return `****${value?.slice(-4)}`;
            },
        },
        {
            accessorKey: 'ifscCode',
            header: 'IFSC Code',
        },
        {
            id: 'transfer',
            header: 'Transfer',
            cell: ({ row }) => (
                <TransferCell
                    bank={row.original}
                    onTransfer={handleTransfer}
                />
            ),
        },
        {
            accessorKey: 'verified',
            header: 'Verified',
            cell: ({ getValue }) => (
                <span className={`px-2 py-1 rounded text-xs ${getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {getValue() ? 'Verified' : 'Not Verified'}
                </span>
            ),
        },
        {
            id: 'action',
            header: 'Action',
            cell: ({ row }) => (
                <button
                    onClick={() => handleDeleteBank(row.original.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    title='Delete'
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            ),
        },
    ];

    const table = useReactTable({
        data: banks,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const canAddBank = banks.length < 3;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Payout</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!canAddBank}
                    className={`px-4 py-2 rounded ${canAddBank
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Add Bank {!canAddBank && '(Max 3 reached)'}
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {banks.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No banks added yet. Click "Add Bank" to get started.</p>
                </div>
            )}

            <AddBankModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onBankAdded={() => {
                    fetchBanks()
                    setIsModalOpen(false);
                }}
            />
        </div>
    );
};

// Transfer Cell Component
const TransferCell = ({ bank, onTransfer }) => {
    const [amount, setAmount] = useState('');
    const [transferType, setTransferType] = useState('NEFT');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleTransfer = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        onTransfer(bank.id, parseFloat(amount), transferType);
        setAmount('');
        setIsExpanded(false);
    };

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
                Transfer
            </button>
        );
    }

    return (
        <div className="space-y-2 min-w-48">
            <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                className=" p-1 border border-gray-300 rounded text-sm"
            >
                <option value="NEFT">NEFT</option>
                <option value="IMPS">IMPS</option>
                <option value="RTGS">RTGS</option>
            </select>
            <input
                type="number"
                placeholder="Amount"
                value={amount}
                min='0'
                onChange={(e) => setAmount(e.target.value)}
                className=" p-1 border border-gray-300 rounded text-sm"
            />
            <div className="flex gap-1">
                <button
                    onClick={handleTransfer}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                >
                    Transfer
                </button>
                <button
                    onClick={() => setIsExpanded(false)}
                    className="bg-gray-300 text-black px-2 py-1 rounded text-xs hover:bg-gray-400"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Payout;