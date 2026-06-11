
import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import {
  Building2, Phone, Mail, Calendar,
  Plus, Search, Edit, Eye, Trash2, ChevronLeft,
  ChevronRight, Users, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

import VendorForm from '../Forms/Vendor';
import VendorViewModal from '../View/VendorView';
import vendorApi from '../../constants/API/vendorApi';

const VendorListPage = () => {
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const columnHelper = createColumnHelper();

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoading(true);
    try {
      const vendorData = await vendorApi.getAllVendors();
      setVendors(vendorData);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to load vendors';
      toast.error(errorMessage);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: info => `#${info.getValue()}`,
        size: 80,
      }),
      columnHelper.accessor('name', {
        header: 'Vendor Name',
        cell: info => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">{info.row.original.bankType}</div>
          </div>
        ),
      }),
      // columnHelper.accessor('contactPerson.name', {
      //   header: 'Contact Person',
      //   cell: info => (
      //     <div>
      //       <div className="font-medium text-gray-900">{info.getValue()}</div>
      //       <div className="text-sm text-gray-500 flex items-center">
      //         <Phone className="h-3 w-3 mr-1" />
      //         {info.row.original.contactPerson?.phoneNumber}
      //       </div>
      //     </div>
      //   ),
      // }),
      columnHelper.accessor('contactPerson.email', {
        header: 'Email',
        cell: info => (
          <div className="text-sm text-gray-900 flex items-center">
            <Mail className="h-3 w-3 mr-1 text-gray-400" />
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('city', {
        header: 'Location',
        cell: info => (
          <div>
            <div className="font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">{info.row.original.state}</div>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${info.getValue()
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
              }`}
          >
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        ),
      }),
      columnHelper.accessor('creditPeriodDays', {
        header: 'Credit Period',
        cell: info => `${info.getValue()} days`,
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleView(info.row.original)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEdit(info.row.original)}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
              title="Edit Vendor"
            >
              <Edit className="h-4 w-4" />
            </button>
            {/* <button
              onClick={() => handleDelete(info.row.original.id, info.row.original.name)}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Delete Vendor"
            >
              <Trash2 className="h-4 w-4" />
            </button> */}
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: vendors,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowForm(true);
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleView = (vendor) => {
    setViewingVendor(vendor);
  };

  const handleDelete = (vendorId, vendorName) => {
    const confirmDelete = () => {
      toast.dismiss();
      performDelete(vendorId, vendorName);
    };

    const cancelDelete = () => {
      toast.dismiss();
      toast.info('Delete operation cancelled'); // ✅ Same behavior as alert version
    };

    toast.warn(
      <div className="flex flex-col space-y-2">
        <span>Delete "{vendorName}"?</span>
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

  const performDelete = async (vendorId, vendorName) => {
    try {
      await vendorApi.deleteVendor(vendorId);
      loadVendors();
      toast.success(`${vendorName} deleted successfully!`);
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to delete vendor';
      toast.error(errorMessage);
    }
  };

  const handleFormSubmit = async (data) => {
    const isEditing = !!editingVendor;
    const vendorName = data.name;

    try {
      if (isEditing) {
        const updatedVendor = await vendorApi.updateVendor(editingVendor.id, data);
        setVendors(vendors.map(vendor =>
          vendor.id === editingVendor.id ? updatedVendor : vendor
        ));
        toast.success(`${vendorName} updated successfully!`);
      } else {
        const newVendor = await vendorApi.createVendor(data);
        setVendors([...vendors, newVendor]);
        toast.success(`${vendorName} created successfully!`);
      }
      setShowForm(false);
      setEditingVendor(null);
    } catch (error) {
      console.log(error);
      
        toast.error(
        error.response?.data?.message ||       // backend message (like 409)
        (error.request ? "No response from server" : error.message) || // network or other errors
        "An unexpected error occurred"
    );    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  const handleViewModalClose = () => {
    setViewingVendor(null);
  };

  // Calculate stats
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(v => v.status === true).length;
  const inactiveVendors = vendors.filter(v => v.status === false).length;
  const avgCreditPeriod = totalVendors > 0
    ? Math.round(vendors.reduce((acc, v) => acc + (v.creditPeriodDays || 0), 0) / totalVendors)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Loading vendors...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pr-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className=" text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
                <p className="text-gray-600">Manage all your vendor information and relationships</p>
              </div>
            </div>
            <button
              onClick={handleAddVendor}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Vendor</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{totalVendors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{activeVendors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Building2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveVendors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Credit Period</p>
                <p className="text-2xl font-bold text-gray-900">{avgCreditPeriod} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vendor List</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  value={globalFilter ?? ''}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search vendors..."
                />
              </div>
            </div>
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
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted()] ?? null}
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
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500">No vendors found</p>
                        <button
                          onClick={handleAddVendor}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add First Vendor
                        </button>
                      </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                      table.getFilteredRowModel().rows.length
                    )}{' '}
                    of {table.getFilteredRowModel().rows.length} results
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <VendorForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={editingVendor}
          isEdit={!!editingVendor}
        />
      )}

      {/* View Modal */}
      <VendorViewModal
        vendor={viewingVendor}
        isOpen={!!viewingVendor}
        onClose={handleViewModalClose}
      />
    </div>
  );
};

export default VendorListPage;