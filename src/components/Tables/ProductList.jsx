import React, { useState, useEffect, useMemo } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Edit,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Package,
  Shield,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

import ProductMasterForm from '../Forms/Product';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../constants/API/productApi';


// Modular Components
const SearchBar = ({ searchInput, setSearchInput, onSearch, onClear, loading }) => (
  <div className="mb-4">
    <div className="flex max-w-md">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchInput && (
          <button
            onClick={onClear}
            className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button
        onClick={onSearch}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        <Search size={16} />
      </button>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="mb-4 text-center">
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
    <span className="ml-2">Loading products...</span>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8">
    <Package className="mx-auto h-12 w-12 text-gray-400" />
    <p className="mt-2 text-gray-500">No products found.</p>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
    {status ? 'Active' : 'Inactive'}
  </span>
);

const CategoryBadge = ({ categoryName }) => {
  const getCategoryStyle = (category) => {
    switch (category?.toUpperCase()) {
      case 'POS': return 'bg-blue-100 text-blue-800';
      case 'QR_SCANNER': return 'bg-green-100 text-green-800';
      case 'CARD_READER': return 'bg-yellow-100 text-yellow-800';
      case 'PRINTER': return 'bg-red-100 text-red-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryStyle(categoryName)}`}>
      {categoryName || 'Unknown'}
    </span>
  );
};

const ActionButtons = ({ product, onView, onEdit, onDelete }) => (
  <div className="flex space-x-1">
    <button
      onClick={() => onView(product)}
      className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
      title="View Details"
    >
      <Eye size={16} />
    </button>
    <button
      onClick={() => onEdit(product)}
      className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
      title="Edit Product"
    >
      <Edit size={16} />
    </button>
    {/* <button
      onClick={() => onDelete(product.id,product.productName)}
      className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
      title="Delete Product"
    >
      <Trash2 size={16} />
    </button> */}
  </div>
);

const ProductViewModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Package className="text-blue-500" size={16} />
              <span className="font-medium">Product Name:</span>
              <span>{product.productName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Code:</span>
              <span className="font-mono">{product.productCode}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="text-green-500" size={16} />
              <span className="font-medium">Vendor:</span>
              <span>{product.vendor.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Category:</span>
              <CategoryBadge categoryName={product.productCategory.categoryName} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Brand:</span>
              <span>{product.brand}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Model:</span>
              <span>{product.model}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Status:</span>
              <StatusBadge status={product.status} />
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="text-purple-500" size={16} />
              <span className="font-medium">Warranty:</span>
              <span>{product.warrantyPeriod} months ({product.warrantyType})</span>
            </div>
          </div>

          {product.hsn && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">HSN:</span>
              <span>{product.hsn}</span>
            </div>
          )}

          {product.description && (
            <div>
              <span className="font-medium">Description:</span>
              <p className="mt-1 text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Min Order Qty:</span>
              <span>{product.minOrderQuantity}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Max Order Qty:</span>
              <span>{product.maxOrderQuantity}</span>
            </div>
          </div>

          {product.remarks && (
            <div>
              <span className="font-medium">Remarks:</span>
              <p className="mt-1 text-gray-700">{product.remarks}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ table, pagination, totalPages, totalElements }) => (
  <div className="flex items-center justify-between mt-4">
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">
        Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
        {Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalElements)} of{' '}
        {totalElements} results
      </span>
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
        Page {pagination.pageIndex + 1} of {totalPages}
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

// Main Component
const ProductList = () => {
  const [data, setData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sorting, setSorting] = useState([]);

  const userType = localStorage.getItem('userType').toLowerCase();
  const columnHelper = createColumnHelper();

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
   
    try {
      const data = await getProducts(pagination.pageIndex, pagination.pageSize, sorting[0]?.id || 'productName', sorting[0]?.desc ? 'desc' : 'asc', searchQuery);

      setData(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);

      toast.dismiss('fetch-products');
    } catch (error) {
      setData([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount and when dependencies change
  useEffect(() => {
    const sortField = sorting[0]?.id || 'productName';
    const sortDirection = sorting[0]?.desc ? 'desc' : 'asc';

    fetchProducts(
      pagination.pageIndex,
      pagination.pageSize,
      sortField,
      sortDirection,
      searchQuery
    );
  }, [pagination.pageIndex, pagination.pageSize, sorting, searchQuery]);

  // Search handlers
  const handleSearch = () => {
    toast.info(`Searching for: ${searchInput}`);
    setSearchQuery(searchInput);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    toast.info('Search cleared');
  };

  // Calculate stats
  const totalProducts = data.length;
  const activeProducts = data.filter(p => p.status === true).length;
  const inactiveProducts = data.filter(p => p.status === false).length;
  const avgWarranty = totalProducts > 0
    ? Math.round(data.reduce((acc, p) => acc + (p.warrantyPeriod || 0), 0) / totalProducts)
    : 0;

  // Table columns configuration
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Product ID',
        cell: info => (
          <span className="font-mono text-sm font-semibold text-blue-600">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('productName', {
        header: 'Product Name',
        cell: info => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">{info.row.original.productCode}</div>
          </div>
        ),
      }),
      columnHelper.accessor('vendor.name', {
        header: 'Vendor',
        cell: info => (
          <div>
            <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-xs text-gray-500">ID: {info.row.original.vendor.id}</div>
          </div>
        ),
      }),
      columnHelper.accessor('productCategory.categoryName', {
        header: 'Category',
        cell: info => <CategoryBadge categoryName={info.getValue()} />,
      }),
      columnHelper.accessor('model', {
        header: 'Model',
        cell: info => (
          <div>
            <div className="text-sm font-medium">{info.getValue()}</div>
            <div className="text-xs text-gray-500">{info.row.original.brand}</div>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.accessor('warrantyPeriod', {
        header: 'Warranty',
        cell: info => (
          <div>
            <div className="text-sm font-medium">{info.getValue()} months</div>
            <div className="text-xs text-gray-500 capitalize">
              {info.row.original.warrantyType?.toLowerCase().replace('_', ' ') || 'Unknown'}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <ActionButtons
            product={info.row.original}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      }),
    ],
    []
  );

  // Table configuration
  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  // Action handlers
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    const editData = {
      ...product,
      warrantyType: product.warrantyType?.toLowerCase() || 'manufacturer',
    };
    setEditingProduct(editData);
    setShowForm(true);
  };

  const handleView = (product) => {
    setViewingProduct(product);
  };

  const handleDelete = (productId, productName) => {
    const confirmDelete = () => {
      toast.dismiss();
      performDelete(productId, productName);
    };

    const cancelDelete = () => {
      toast.dismiss();
      toast.info('Delete operation cancelled');
    };

    toast.warn(
      <div className="flex flex-col space-y-2">
        <span>Delete "{productName}"?</span>
        <div className="flex space-x-2">
          <button
            onClick={confirmDelete}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={cancelDelete}
            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false
      }
    );
  };

  const performDelete = async (productId, productName) => {
    try {
      await deleteProduct(productId);
      fetchProducts();
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete product';
      toast.error(errorMessage);
    }
  };

  const handleFormSubmit = async (formData) => {
    const isEdit = !!editingProduct;
    try {
      if (isEdit) {
        await updateProduct(editingProduct.id, formData);
      } else {
        await createProduct(formData);
      }
      fetchProducts();
      handleCloseForm();
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pr-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                <p className="text-gray-600">Manage your all vendor products</p>
              </div>
            </div>
            {(userType === 'admin' || userType === "super_admin") && (
              <button
                onClick={handleAddProduct}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>+ Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Products</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveProducts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Warranty</p>
                <p className="text-2xl font-bold text-gray-900">{avgWarranty} months</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearch}
          onClear={clearSearch}
          loading={loading}
        />

        {searchQuery && (
          <p className="mt-2 mb-4 text-sm text-gray-600">
            Searching for: "<strong>{searchQuery}</strong>"
          </p>
        )}

        {loading && <LoadingSpinner />}

        {showForm && (
          <ProductMasterForm
            onSubmit={handleFormSubmit}
            initialData={editingProduct}
            isEdit={!!editingProduct}
            onCancel={handleCloseForm}
          />
        )}

        <ProductViewModal
          product={viewingProduct}
          onClose={() => setViewingProduct(null)}
        />

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product List</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
                              asc: '🔼',
                              desc: '🔽',
                            }[header.column.getIsSorted()] ?? null}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {table.getRowModel().rows.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                table={table}
                pagination={pagination}
                totalPages={totalPages}
                totalElements={totalElements}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;