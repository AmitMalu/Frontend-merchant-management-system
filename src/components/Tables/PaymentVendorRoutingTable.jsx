import React, { lazy, Suspense, useEffect, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
} from "@tanstack/react-table";

import {
    Edit,
    Trash2,
    Plus,
    Eye,
    RouterIcon,
    Users,
} from "lucide-react";

import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";
import FormShimmer from "../Shimmer/FormShimmer";
import PageHeader from "../UI/PageHeader";
import Pagination from "../UI/Pagination";
import Table from "../UI/Table";
import TableHeader from "../UI/TableHeader";

const PaymentVendorRoutingForm = lazy(() => import("../Forms/PaymentVendorRoutingForm"));
const PaymentVendorRoutingView = lazy(() => import("../View/PaymentVendorRoutingView"));

const PaymentVendorRoutingTable = () => {
    const [data, setData] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [selectedRouting, setSelectedRouting] = useState(null);
    const [openView, setOpenView] = useState(false);
    const [globalFilter, setGlobalFilter] = useState("");

    // -----------------------
    // Fetch routing list
    // -----------------------
    const fetchRoutes = async () => {
        try {
            const res = await api.get("/payment-vendor-routing");
            setData(res?.data?.data?.content || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch vendor routing");
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // -----------------------
    // Columns
    // -----------------------
    const columns = [
        {
            accessorKey: "id",
            header: "ID",
            cell: (info) => (
                <span className="font-medium text-gray-900">#{info.getValue()}</span>
            ),
            size: 60,
        },

        {
            accessorKey: "payoutProductName",
            header: "Product",
            cell: (info) => (
                <div>
                    <p className="font-semibold text-gray-800">
                        {info.getValue()}
                    </p>
                    <p className="text-xs text-gray-500">
                        {info.row.original.payoutProductId}
                    </p>
                </div>
            ),
        },

        {
            header: "Vendors",
            cell: (info) => {
                const row = info.row.original;

                const vendors = [
                    row.vendor1,
                    row.vendor2,
                    row.vendor3,
                ].filter(Boolean);

                const firstTwo = vendors.slice(0, 2);
                const more = vendors.length > 2 ? vendors.length - 2 : 0;

                return (
                    <div className="flex flex-wrap gap-1 items-center">
                        {firstTwo.map((v) => (
                            <span
                                key={v.id}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                                {v.name}
                            </span>
                        ))}
                        {more > 0 && (
                            <span className="text-xs text-gray-500 font-medium">
                                +{more} more
                            </span>
                        )}
                    </div>
                );
            },
        },

        {
            header: "Amount Range",
            cell: (info) => {
                const rules = info.row.original.vendorRules;

                if (!rules?.length) return "—";

                const min = Math.min(
                    ...rules.map((v) => Number(v.minAmount))
                );
                const max = Math.max(
                    ...rules.map((v) => Number(v.maxAmount))
                );

                return (
                    <span className="text-sm text-gray-700">
                        ₹{min.toLocaleString()} - ₹{max.toLocaleString()}
                    </span>
                );
            },
        },

        {
            accessorKey: "createdAt",
            header: "Created",
            cell: (info) => {
                const date = new Date(info.getValue());
                return (
                    <span className="text-sm text-gray-600">
                        {date.toLocaleString()}
                    </span>
                );
            },
        },

        {
            accessorKey: "status",
            header: "Status",
            cell: (info) => {
                const active = info.getValue();
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                    >
                        {active ? "Active" : "Inactive"}
                    </span>
                );
            },
        },

        {
            id: "actions",
            header: "Actions",
            cell: (info) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleView(info.row.original)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                        <Eye size={16} />
                    </button>

                    <button
                        onClick={() => handleEdit(info.row.original)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        onClick={() => handleDelete(info.row.original.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    // -----------------------
    // Table Hook
    // -----------------------
    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),

        initialState: {
            pagination: { pageSize: 10 },
        },
    });

    // -----------------------
    // Actions
    // -----------------------
    const handleAddVendorRouting = () => {
        setSelectedRouting(null);
        setOpenForm(true);
    };

    const handleEdit = (routing) => {
        setSelectedRouting(routing);
        setOpenForm(true);
    };

    const handleView = (routing) => {
        setSelectedRouting(routing);
        setOpenView(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this routing?")) return;

        try {
            await api.delete(`/payment-vendor-routing/${id}`);
            toast.success("Routing deleted successfully!");
            fetchRoutes();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Delete failed");
        }
    };

    const handleClose = () => {
        setOpenForm(false);
        setOpenView(false);
        setSelectedRouting(null);
    };

    const handleSubmit = async (formData) => {
        try {
            if (selectedRouting) {
                await api.put(`/payment-vendor-routing/${selectedRouting.id}`, formData);
                toast.success("Routing updated successfully!");
            } else {
                await api.post(`/payment-vendor-routing`, formData);
                toast.success("Routing created successfully!");
            }

            handleClose();
            fetchRoutes();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Something went wrong while saving routing"
            );
        }
    };

    // -----------------------
    // UI
    // -----------------------
    return (
        <div className="p-6">
            <PageHeader
                icon={RouterIcon}
                iconColor="text-blue-600"
                title="Payment Vendor Routing"
                description="Manage payment vendor routing rules & priority"
                buttonText="Add Routing"
                buttonIcon={Plus}
                onButtonClick={handleAddVendorRouting}
                buttonColor="bg-blue-600 hover:bg-blue-700"
            />

            <div className="bg-white rounded-lg shadow-sm">
                <TableHeader
                    title="Vendor Routing"
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Search routing..."
                />

                <Table
                    table={table}
                    columns={columns}
                    emptyState={{
                        icon: <Users size={50} />,
                        message: "No routing rules found",
                        action: (
                            <button
                                onClick={handleAddVendorRouting}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Add Routing
                            </button>
                        ),
                    }}
                />

                <Pagination table={table} />
            </div>

            {openForm && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentVendorRoutingForm
                        isOpen={openForm}
                        onClose={handleClose}
                        onSubmit={handleSubmit}
                        defaultValues={selectedRouting}
                    />
                </Suspense>
            )}

            {openView && (
                <PaymentVendorRoutingView
                    selectedRouting={selectedRouting}
                    onClose={handleClose}
                />
            )}
        </div>
    );
};

export default PaymentVendorRoutingTable;
