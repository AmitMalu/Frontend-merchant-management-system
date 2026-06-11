import React, { useState, useEffect, useMemo } from 'react';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    Package,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    AlertTriangle,
    CheckCircle,
    TrendingDown,
    Inbox
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../constants/API/axiosInstance'; 
// ============================================================================
// SHARED UI COMPONENTS
// ============================================================================

const SearchBar = ({ searchInput, setSearchInput, onSearch, onClear, loading }) => (
    <div className="relative flex max-w-md">
        <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchInput && (
            <button
                onClick={onClear}
                className="absolute right-12 top-2.5 text-gray-400 hover:text-gray-600"
            >
                <X size={16} />
            </button>
        )}
        <button
            onClick={onSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
            <Search size={16} />
        </button>
    </div>
);

const FilterButtons = ({ activeFilters, onFilterChange, userType }) => (
    <div className="flex flex-wrap gap-2">
        <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${activeFilters.includes('all')
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
        >
            All Products
        </button>

        {userType === 'franchise' && (
            <>
                <button
                    onClick={() => onFilterChange('low_stock')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${activeFilters.includes('low_stock')
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <AlertTriangle size={12} />
                    Low Stock
                </button>

                <button
                    onClick={() => onFilterChange('out_of_stock')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${activeFilters.includes('out_of_stock')
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <TrendingDown size={12} />
                    Out of Stock
                </button>

                <button
                    onClick={() => onFilterChange('in_stock')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${activeFilters.includes('in_stock')
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <CheckCircle size={12} />
                    In Stock
                </button>
            </>
        )}
    </div>
);

const LoadingSpinner = () => (
    <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Loading products...</p>
    </div>
);

const EmptyState = ({ userType }) => (
    <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <p className="text-lg text-gray-500 mb-2">No products found</p>
        <p className="text-sm text-gray-400">
            {userType === 'franchise'
                ? 'Products will appear here once they are received from vendors.'
                : 'Products will appear here once they are distributed to you.'
            }
        </p>
    </div>
);

const CategoryBadge = ({ categoryName }) => {
    const getCategoryStyle = (category) => {
        const categoryMap = {
            'POS': 'bg-blue-100 text-blue-800',
            'QR_SCANNER': 'bg-green-100 text-green-800',
            'CARD_READER': 'bg-yellow-100 text-yellow-800',
            'PRINTER': 'bg-red-100 text-red-800',
            'SOUNDBOX': 'bg-purple-100 text-purple-800',
        };
        return categoryMap[category?.toUpperCase()] || 'bg-gray-100 text-gray-800';
    };

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyle(categoryName)}`}>
            {categoryName || 'Unknown'}
        </span>
    );
};

const StockStatus = ({ remaining, total }) => {
    const isOutOfStock = remaining === 0;
    const isLowStock = remaining > 0 && remaining <= 5;

    if (isOutOfStock) {
        return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                <TrendingDown size={12} className="mr-1" />
                Out of Stock
            </span>
        );
    }

    if (isLowStock) {
        return (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                <AlertTriangle size={12} className="mr-1" />
                Low Stock
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            In Stock
        </span>
    );
};

const Pagination = ({ table, pagination, data }) => {
    if (data.length === 0) return null;

    return (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
                Showing {Math.min(pagination.pageIndex * pagination.pageSize + 1, data.length)} to{' '}
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, data.length)} of {data.length} products
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="flex items-center px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    <ChevronLeft size={16} className="mr-1" />
                    Previous
                </button>

                <span className="text-sm text-gray-600">
                    Page {pagination.pageIndex + 1} of {table.getPageCount()}
                </span>

                <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="flex items-center px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                    Next
                    <ChevronRight size={16} className="ml-1" />
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN PRODUCT LIST COMPONENT
// ============================================================================

const CustomerProductsList = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState(['all']);
    const [userType, setUserType] = useState('');
    const [userId, setUserId] = useState(null);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([]);

    const columnHelper = createColumnHelper();

    // Get user type and ID from localStorage
    useEffect(() => {
        const storedUserType = localStorage.getItem('userType').toLowerCase();
        const storedUserId = localStorage.getItem('customerId');

        setUserType(storedUserType);
        setUserId(storedUserId);
    }, []);

    // Fetch products based on user type
    useEffect(() => {
        const fetchProducts = async () => {
            if (!userType || !userId) return;

            setLoading(true);
            try {
                let response;

                if (userType === 'franchise') {
                    response = await api.get(`/franchise/products/${userId}`);
                } else if (userType === 'merchant') {
                    response = await api.get(`/merchants/products/${userId}`);
                }

                const products = response?.data || [];
                setData(products);
                setFilteredData(products);

                if (products.length > 0) {
                    toast.success(`Loaded ${products.length} products`);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                toast.error('Failed to load products');
                setData([]);
                setFilteredData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [userType, userId]);

    // Apply filters and search
    useEffect(() => {
        let filtered = [...data];

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(product =>
                product.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.productCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.productCategory?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply inventory filters (only for franchise)
        if (userType === 'franchise' && !activeFilters.includes('all')) {
            filtered = filtered.filter(product => {
                const remaining = product.remainingQuantity || 0;

                if (activeFilters.includes('out_of_stock') && remaining === 0) return true;
                if (activeFilters.includes('low_stock') && remaining > 0 && remaining <= 5) return true;
                if (activeFilters.includes('in_stock') && remaining > 5) return true;

                return false;
            });
        }

        setFilteredData(filtered);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, [data, searchQuery, activeFilters, userType]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const clearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
    };

    const handleFilterChange = (filter) => {
        if (filter === 'all') {
            setActiveFilters(['all']);
        } else {
            setActiveFilters(prev => {
                const newFilters = prev.includes('all') ? [] : [...prev];

                if (newFilters.includes(filter)) {
                    const updated = newFilters.filter(f => f !== filter);
                    return updated.length === 0 ? ['all'] : updated;
                } else {
                    return [...newFilters, filter];
                }
            });
        }
    };

    // Define columns based on user type
    const columns = useMemo(() => {
        const baseColumns = [
            columnHelper.accessor('productId', {
                header: 'Product ID',
                cell: info => (
                    <span className={`font-mono text-sm font-semibold ${userType === 'franchise' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                        #{info.getValue()}
                    </span>
                ),
            }),
            columnHelper.accessor('productName', {
                header: 'Product Name',
                cell: info => (
                    <div>
                        <div className="font-medium text-gray-900">{info.getValue()}</div>
                        <div className="text-sm text-gray-500 font-mono">{info.row.original.productCode}</div>
                    </div>
                ),
            }),
            columnHelper.accessor('productCategory', {
                header: 'Category',
                cell: info => <CategoryBadge categoryName={info.getValue()} />,
            }),
        ];

        if (userType === 'franchise') {
            // Franchise columns with inventory management
            return [
                ...baseColumns,
                columnHelper.accessor('totalQuantity', {
                    header: 'Total Qty',
                    cell: info => (
                        <span className="font-semibold text-gray-900">
                            {info.getValue()}
                        </span>
                    ),
                }),
                columnHelper.accessor('valid', {
                    header: 'Available',
                    cell: info => {
                        const remaining = info.getValue();
                        const total = info.row.original.totalQuantity;
                        return (
                            <div className="space-y-1">
                                <div className="font-semibold text-gray-900">{remaining}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${remaining === 0 ? 'bg-red-500' :
                                                remaining <= 5 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${total > 0 ? (remaining / total) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    },
                }),
                columnHelper.display({
                    id: 'status',
                    header: 'Status',
                    cell: info => (
                        <StockStatus
                            remaining={info.row.original.valid}
                            total={info.row.original.totalQuantity}
                        />
                    ),
                }),
                columnHelper.display({
                    id: 'distributed',
                    header: 'Distributed',
                    cell: info => {
                        const distributed = info.row.original.totalQuantity - info.row.original.valid;
                        return (
                            <span className="text-sm text-gray-600">
                                {distributed} units
                            </span>
                        );
                    },
                }),
            ];
        } else {
            // Merchant columns - simpler view
            return [
                ...baseColumns,
                columnHelper.accessor('totalQuantity', {
                    header: 'Quantity Received',
                    cell: info => (
                        <div className="text-center">
                            <span className="font-semibold text-lg text-gray-900">
                                {info.getValue()}
                            </span>
                            <div className="text-xs text-gray-500">units</div>
                        </div>
                    ),
                }),
                columnHelper.display({
                    id: 'status',
                    header: 'Status',
                    cell: () => (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            <Inbox size={12} className="mr-1" />
                            Received
                        </span>
                    ),
                }),
            ];
        }
    }, [userType, columnHelper]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: { pagination, sorting },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    // Get title and subtitle based on user type
    const getHeaderInfo = () => {
        if (userType === 'franchise') {
            return {
                title: 'Franchise Inventory',
                subtitle: 'Manage your product inventory and track distribution to merchants'
            };
        } else {
            return {
                title: 'My Products',
                subtitle: 'View all products that have been distributed to your store'
            };
        }
    };

    const { title, subtitle } = getHeaderInfo();

    if (!userType) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                        <p className="text-gray-600">{subtitle}</p>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${userType === 'franchise' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {userType === 'franchise' ? 'Franchise Panel' : 'Merchant Panel'}
                </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <SearchBar
                        searchInput={searchInput}
                        setSearchInput={setSearchInput}
                        onSearch={handleSearch}
                        onClear={clearSearch}
                        loading={loading}
                    />

                    <div className="text-sm text-gray-600">
                        {filteredData.length} of {data.length} products
                    </div>
                </div>

                <FilterButtons
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    userType={userType}
                />

                {searchQuery && (
                    <p className="text-sm text-gray-600">
                        Searching for: "<strong>{searchQuery}</strong>"
                    </p>
                )}
            </div>

            {/* Loading State */}
            {loading && <LoadingSpinner />}

            {/* Table */}
            {!loading && filteredData.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <div className="flex items-center space-x-1">
                                                <span>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </span>
                                                <span className="text-gray-400">
                                                    {{
                                                        asc: '↑',
                                                        desc: '↓',
                                                    }[header.column.getIsSorted()] ?? '↕'}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredData.length === 0 && (
                <EmptyState userType={userType} />
            )}

            {/* Pagination */}
            <Pagination table={table} pagination={pagination} data={filteredData} />
        </div>
    );
};

export default CustomerProductsList;