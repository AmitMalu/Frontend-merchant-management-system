import { useState, useEffect } from 'react'
import { Archive, ArrowDownToLine, ArrowUpFromLine, Layers, Plus, RotateCcw } from 'lucide-react'
import InventoryTable from './InventoryTable'
import InwardTable from './InwardTable'
import OutwardTable from './OutwardTable'
import ReturnTable from './ReturnTable'
import InwardFormModal from '../Forms/Inward/Inward'
import OutwardFormModal from '../Forms/Outward'
import OptimizedReturns from '../Forms/Return'
import inwardAPI from '../../constants/API/inwardApi'
import { createOutwardTransaction, deleteOutwardTransaction, updateOutwardTransaction } from '../../constants/API/OutwardTransAPI'
import { toast } from 'react-toastify'
import returnTransactionAPI from '../../constants/API/returnTransactionApi'

const InventoryManagement = () => {
    const [activeTab, setActiveTab] = useState('inventory')
    const [isInwardModalOpen, setIsInwardModalOpen] = useState(false)
    const [isOutwardModalOpen, setIsOutwardModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)


    const [inventoryData, setInventoryData] = useState([])

    const [inwardData, setInwardData] = useState([])
    const [returnData, setReturnData] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingInward, setEditingInward] = useState(null)
    const [editingOutward, setEditingOutward] = useState(null)
    const [editingReturn, setEditingReturn] = useState(null)
    const [outwardRefreshTrigger, setOutwardRefreshTrigger] = useState(0)

    const tabs = [
        { id: 'inventory', label: 'Inventory', count: inventoryData.length, icon: Layers },
        { id: 'inward', label: 'Inward Entry', count: inwardData.length, icon: ArrowDownToLine },
        { id: 'outward', label: 'Outward Entry', count: null, icon: ArrowUpFromLine },
        { id: 'returns', label: 'Returns', count: returnData.length, icon: RotateCcw }
    ]

    const handleOutwardSubmit = async (data) => {
        setLoading(true)
        try {
            if (editingOutward) {
                await updateOutwardTransaction(editingOutward.id, data)
                toast.success("Outward transaction updated successfully!")
            } else {
                await createOutwardTransaction(data)
                toast.success("Outward transaction created successfully!")
            }

            setOutwardRefreshTrigger(prev => prev + 1)
            setIsOutwardModalOpen(false)
            setEditingOutward(null)
        } catch (error) {
            console.error("Error saving outward transaction:", error)
            const backendMessage =
                error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred";

            toast.error(backendMessage);
        } finally {
            setLoading(false)
        }
    }

    const handleEditOutward = (outwardEntry) => {
        setEditingOutward(outwardEntry)
        setIsOutwardModalOpen(true)
    }

    const handleDeleteOutward = async (id) => {
        setLoading(true)
        try {
            await deleteOutwardTransaction(id)
            toast.success("Outward transaction deleted successfully!")
            setOutwardRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error("Error deleting outward transaction:", error)
            const backendMessage =
                error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred";

            toast.error(backendMessage);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === 'inward') {
            fetchInwardData()
        } else if (activeTab === 'returns') {
            fetchReturnData()
        }
    }, [activeTab])

    const fetchInwardData = async () => {
        setLoading(true)
        try {
            const response = await inwardAPI.getAllInwardTransactions()
            setInwardData(response)
        } catch (error) {
            console.error('Error fetching inward data:', error)
            toast.error('Error fetching inward transactions. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleInwardSubmit = async (data) => {
        setLoading(true);
        try {
            if (editingInward) {
                await inwardAPI.updateInwardTransaction(editingInward.id, data);
                toast.success('Inward transaction updated successfully!');
            } else {
                await inwardAPI.createInwardTransaction(data);
                toast.success('Inward transaction created successfully!');
            }

            await fetchInwardData();
            setIsInwardModalOpen(false);
            setEditingInward(null);
        } catch (error) {
            console.error('Error saving inward transaction:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditInward = (inwardEntry) => {
        setEditingInward(inwardEntry)
        setIsInwardModalOpen(true)
    }

    const handleViewInward = (inwardEntry) => {
        console.log('View inward entry:', inwardEntry)
    }

    const handleDeleteInward = async (id) => {
        if (window.confirm('Are you sure you want to delete this inward transaction?')) {
            setLoading(true)
            try {
                await inwardAPI.deleteInwardTransaction(id)
                toast.success('Inward transaction deleted successfully!')
                await fetchInwardData()
            } catch (error) {
                console.error('Error deleting inward transaction:', error)
                toast.error(error.message)
            } finally {
                setLoading(false)
            }
        }
    }

    const fetchReturnData = async () => {
        setLoading(true)
        try {
            const data = await returnTransactionAPI.getAllReturnTransactions()
            setReturnData(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching return data:", error)
            const backendMessage =
                error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred";

            toast.error(backendMessage);
        } finally {
            setLoading(false)
        }
    }

    const handleReturnSubmit = async (data) => {
        try {
            let result;
            if (editingReturn) {
                result = await returnTransactionAPI.updateReturnTransaction(editingReturn.id, data);
                toast.success("Return Transaction updated Successfully!")
            } else {
                result = await returnTransactionAPI.createReturnTransaction(data);
                toast.success("Return Transaction Created Successfully!")
            }

            await fetchReturnData();
            setIsReturnModalOpen(false);
            setEditingReturn(null);

            return result;
        } catch (error) {
            console.error("Error saving return transaction:", error);
            const backendMessage =
                error.response?.data?.message ||
                error.message ||
                "An unexpected error occurred";

            toast.error(backendMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleReturnCancel = () => {
        setIsReturnModalOpen(false);
        setEditingReturn(null);
    };

    const handleEditReturn = (returnEntry) => {
        setEditingReturn(returnEntry)
        setIsReturnModalOpen(true)
    }

    const handleViewReturn = (returnEntry) => {
        console.log("View return entry:", returnEntry)
    }

    const handleDeleteReturn = async (id) => {
        if (window.confirm("Are you sure you want to delete this return transaction?")) {
            setLoading(true)
            try {
                await returnTransactionAPI.deleteReturnTransaction(id)
                toast.success("Return transaction deleted successfully!")
                await fetchReturnData()
            } catch (error) {
                console.error("Error deleting return transaction:", error)
                const backendMessage =
                    error.response?.data?.message ||
                    error.message ||
                    "An unexpected error occurred";

                toast.error(backendMessage);
            } finally {
                setLoading(false)
            }
        }
    }

    const getActionButtons = () => {
        switch (activeTab) {
            case 'inward':
                return (
                    <button
                        onClick={() => setIsInwardModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Inward Entry</span>
                    </button>
                )
            case 'outward':
                return (
                    <button
                        onClick={() => setIsOutwardModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Outward Entry</span>
                    </button>
                )
            case 'returns':
                return (
                    <button
                        onClick={() => setIsReturnModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Return Entry</span>
                    </button>
                )
            default:
                return null
        }
    }

    const renderActiveTable = () => {
        switch (activeTab) {
            case 'inventory':
                return <InventoryTable data={inventoryData} />
            case 'inward':
                return (
                    <InwardTable
                        data={inwardData}
                        onEdit={handleEditInward}
                        onView={handleViewInward}
                        onDelete={handleDeleteInward}
                        loading={loading}
                    />
                )
            case 'outward':
                return (
                    <OutwardTable
                        onEdit={handleEditOutward}
                        onDelete={handleDeleteOutward}
                        refreshTrigger={outwardRefreshTrigger}
                    />
                )
            case 'returns':
                return (
                    <ReturnTable
                        data={returnData}
                        onEdit={handleEditReturn}
                        onView={handleViewReturn}
                        onDelete={handleDeleteReturn}
                        loading={loading}
                    />
                )
            default:
                return <InventoryTable data={inventoryData} />
        }
    }

    return (
        <div className="min-h-screen">
            <div className="min-h-screen bg-gray-50 pr-4">
                <div className="rounded-lg mb-3">
                    <div className="px-">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className='flex items-center'>
                                    <Archive className="text-blue-600 mr-3 ml-1 mb-3" />
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                                        <p className="text-gray-600 mb-4">Manage your inventory, inward, outward and returns</p>
                                    </div>
                                </div>
                                <div className="bg-white shadow-sm rounded-lg mb-4">
                                    <div className="border-b border-gray-200">
                                        <nav className="-mb-px flex px-4">
                                            {tabs.map((tab) => {
                                                const Icon = tab.icon;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`py-3 px-1 ml-15 mr-8 border-b-3 font-medium text-sm ${activeTab === tab.id
                                                            ? 'border-blue-500 text-blue-600'
                                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className='flex '>
                                                            {Icon && <Icon className="mr-1 m-1 text-black" size={15} />}
                                                            {tab.label}
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </nav>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center pt-24 pr-5">
                                {getActionButtons()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg">
                    {renderActiveTable()}
                </div>

                <InwardFormModal
                    isOpen={isInwardModalOpen}
                    onClose={() => {
                        setIsInwardModalOpen(false)
                        setEditingInward(null)
                    }}
                    onSubmit={handleInwardSubmit}
                    editData={editingInward}
                />

                {isOutwardModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                            <OutwardFormModal
                                isOpen={isOutwardModalOpen}
                                onClose={() => {
                                    setIsOutwardModalOpen(false)
                                    setEditingOutward(null)
                                }}
                                onSubmit={handleOutwardSubmit}
                                editData={editingOutward}
                            />
                        </div>
                    </div>
                )}

                {isReturnModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
                            <OptimizedReturns
                                onSubmit={handleReturnSubmit}
                                onCancel={handleReturnCancel}
                                editData={editingReturn}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default InventoryManagement