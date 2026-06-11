import React, { lazy, Suspense, useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Eye, Trash2, Plus, KeyRound, Edit } from "lucide-react";
import PageHeader from "../UI/PageHeader";
import TableHeader from "../UI/TableHeader";
import Table from "../UI/Table";
import Pagination from "../UI/Pagination";
import StatsCard from "../UI/StatsCard";
import FormShimmer from "../Shimmer/FormShimmer";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

const PaymentVendorCredentialsForm = lazy(() => import("../Forms/PaymentVendorCredentialsForm"));
const PaymentVendorCredentialsView = lazy(() => import("../View/PaymentVendorCredentialsView"));

const PaymentVendorCredentialsTable = () => {

    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);

    const fetchData = async () => {
        try {
            const res = await api.get("/payment-vendor-credentials");
            setData(res.data);
        } catch (err) {
            toast.error("Failed to fetch vendor credentials");
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = () => {
        setEditing(null);
        setOpenForm(true);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editing) {
                await api.put(`/payment-vendor-credentials/${editing.id}`, payload);
                toast.success("Credentials updated");
            } else {
                await api.post("/payment-vendor-credentials", payload);
                toast.success("Credentials created");
            }
            setOpenForm(false);
            setEditing(null);
            fetchData();
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to save vendor credentials");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete credentials?")) return;
        try {
            await api.delete(`/payment-vendor-credentials/${id}`);
            toast.success("Deleted");
            fetchData();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const columns = [
        {
            accessorKey: "id",
            header: "ID",
            cell: i => <span className="font-medium">#{i.getValue()}</span>
        },
        {
            accessorKey: "vendorName",
            header: "Vendor",
            cell: i => (
                <span className="font-semibold text-gray-800">
                    {i.getValue()}
                </span>
            )
        },
        {
            accessorKey: "productName",
            header: "Product",
            cell: i => (
                <span className="text-gray-700">
                    {i.getValue() || "-"}
                </span>
            )
        },
        {
            accessorKey: "activeEnvironment",
            header: "Environment",
            cell: i => (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {i.getValue()}
                </span>
            )
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: i => (
                <span className={`px-2 py-1 rounded-full text-xs ${i.getValue() ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {i.getValue() ? "Active" : "Inactive"}
                </span>
            )
        },
        {
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setViewing(row.original); setOpenView(true); }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                        <Eye size={16} />
                    </button>

                    <button
                        onClick={() => { setEditing(row.original); setOpenForm(true); }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                        <Edit size={16} />
                    </button>

                    <button
                        onClick={() => handleDelete(row.original.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getFilteredRowModel: getFilteredRowModel(),
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="p-6">

            <PageHeader
                icon={KeyRound}
                iconColor="text-indigo-600"
                title="Vendor Credentials"
                description="Manage encryption & API credentials for payment vendors"
                buttonText="Add Credentials"
                buttonIcon={Plus}
                onButtonClick={handleCreate}
                buttonColor="bg-indigo-600 hover:bg-indigo-700"
            />

            <div className="bg-white rounded-lg shadow-sm">
                <TableHeader
                    title="Credentials List"
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Search..."
                />
                <Table table={table} columns={columns} />
                <Pagination table={table} />
            </div>

            {openForm && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentVendorCredentialsForm
                        isOpen={openForm}
                        onClose={() => { setOpenForm(false); setEditing(null); }}
                        defaultValues={editing}
                        onSubmit={handleSubmit}
                    />
                </Suspense>
            )}

            {openView && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentVendorCredentialsView
                        isOpen={openView}
                        onClose={() => { setOpenView(false); setViewing(null); }}
                        creds={viewing}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default PaymentVendorCredentialsTable;
