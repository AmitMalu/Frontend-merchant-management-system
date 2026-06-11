import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import api from '../../constants/API/axiosInstance';

// Import components
import Table from '../UI/Table';
import LogFilters from '../BackendLogs/LogFilters';
import LogDetailModal from '../BackendLogs/LogDetailModal';

// Import configurations
import { tableOptions, filterOptions } from '../../config/logFilterConfig';
import { getLogColumns } from '../../config/logColumns';

const BusinessLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(null);
    const [activeTableType, setActiveTableType] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 100;

    const openModal = (log) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const columns = useMemo(() => {
        if (!activeTableType) return [];
        return getLogColumns(activeTableType, openModal);
    }, [activeTableType]);

    const table = useReactTable({
        data: logs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: false,
        pageCount: 1,
        state: {
            pagination: {
                pageIndex: 0,
                pageSize: 20,
            },
        },
    });

    const fetchLogs = async (page = 0) => {
        if (!selectedFilter) return;

        setLoading(true);
        try {
            let url = `${selectedFilter.endpoint}?page=${page}&size=${pageSize}`;

            // ADD STATUS PARAM (VERY IMPORTANT)
            if (selectedFilter.status) {
                url += `&status=${selectedFilter.status}`;
            }

            // Add date range if both dates are provided - send as YYYY-MM-DD format only
            if (dateRange.start && dateRange.end) {
                url += `&start=${dateRange.start}&end=${dateRange.end}`;
            }

            const response = await api.get(url);
            const data = response.data.content || response.data;
            const logsArray = Array.isArray(data) ? data : [];

            setLogs(logsArray);
            setActiveTableType(selectedTable.value);
            setCurrentPage(page);

            // Calculate total pages based on response
            if (response.data.totalPages) {
                setTotalPages(response.data.totalPages);
            } else {
                setTotalPages(Math.ceil(logsArray.length / pageSize));
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setLogs([]);
            setActiveTableType(selectedTable.value);
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            fetchLogs(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            fetchLogs(currentPage - 1);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLog(null);
    };

    const handleTableChange = (option) => {
        setSelectedTable(option);
        setSelectedFilter(null);
        setLogs([]);
        setDateRange({ start: '', end: '' });
        setCurrentPage(0);
    };

    const handleFilterChange = (option) => {
        setSelectedFilter(option);
        setDateRange({ start: '', end: '' });
        setCurrentPage(0);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">System Logs</h1>
                    <p className="text-gray-600">Monitor and analyze system activities across all modules</p>
                </div>

                <LogFilters
                    selectedTable={selectedTable}
                    selectedFilter={selectedFilter}
                    dateRange={dateRange}
                    onTableChange={handleTableChange}
                    onFilterChange={handleFilterChange}
                    onDateRangeChange={setDateRange}
                    onFetch={() => fetchLogs(0)}
                    loading={loading}
                    tableOptions={tableOptions}
                    filterOptions={filterOptions}
                />

                {logs.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {selectedFilter?.label}
                                </h3>
                                <div className="text-sm text-gray-600">
                                    Showing {logs.length} records (Page {currentPage + 1} of {totalPages || 1})
                                </div>
                            </div>
                        </div>

                        <div className="overflow-auto max-h-[600px]">
                            <Table
                                table={table}
                                columns={columns}
                                emptyState={{
                                    message: "No logs found"
                                }}
                            />
                        </div>

                        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing page {currentPage + 1} of {totalPages || 1}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handlePrevPage}
                                        disabled={currentPage === 0 || loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage >= totalPages - 1 || loading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {logs.length === 0 && activeTableType && !loading && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="text-4xl mb-3">📋</div>
                        <p className="text-gray-600 text-lg">No logs found for the selected filter</p>
                    </div>
                )}
            </div>

            <LogDetailModal
                isOpen={isModalOpen}
                onClose={closeModal}
                log={selectedLog}
            />
        </div>
    );
};

export default BusinessLogs;