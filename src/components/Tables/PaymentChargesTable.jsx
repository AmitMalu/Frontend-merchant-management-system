// src/components/Tables/PaymentChargesTable.jsx
import React, { lazy, Suspense, useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Eye, Trash2, Plus, Files, Percent, Banknote, Edit } from "lucide-react";
import PageHeader from "../UI/PageHeader";
import TableHeader from "../UI/TableHeader";
import Table from "../UI/Table";
import Pagination from "../UI/Pagination";
import StatsCard from "../UI/StatsCard";
import FormShimmer from "../Shimmer/FormShimmer";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

const PaymentChargesForm = lazy(() => import("../Forms/PaymentChargesForm"));
const PaymentChargesView = lazy(() => import("../View/PaymentChargesView"));

const PaymentChargesTable = () => {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);

    const [stats, setStats] = useState({
        totalModes: 0,
        activeModes: 0
    });

    const fetchData = async () => {
        try {
            const res = await api.get("/payment-charges", { params: { page: 0, size: 100 } });
            const result = res.data.data.content;
            setData(result);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch payment charges");
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get("/payment-charges/stats");
            setStats(res.data.data);
        } catch (err) {
            toast.error("Failed to fetch stats");
        }
    };

    useEffect(() => {
        fetchData();
        fetchStats();
    }, []);

    const handleCreate = () => {
        setEditing(null);
        setOpenForm(true);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editing) {
                await api.put(`/payment-charges/${editing.id}`, payload);
                toast.success("Payment charge updated");
            } else {
                await api.post("/payment-charges", payload);
                toast.success("Payment charge created");
            }

            setOpenForm(false);
            setEditing(null);
            fetchData();
            fetchStats();

        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save payment charge");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this payment mode?")) return;

        try {
            await api.delete(`/payment-charges/${id}`);
            toast.success("Deleted successfully");
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const columns = [
        { accessorKey: "id", header: "ID", cell: i => <span className="font-medium">#{i.getValue()}</span> },

        {
            id: "mode",
            header: "Mode",
            cell: ({ row }) => (
                <div className="font-semibold text-gray-800">{row.original.mode?.code}</div>
            )
        },

        {
            id: "slabCount",
            header: "Slabs",
            cell: ({ row }) => <span>{row.original.slabs?.length || 0}</span>
        },

        {
            id: "range",
            header: "Range",
            cell: ({ row }) => {
                const slabs = row.original.slabs || [];
                if (!slabs.length) return "-";

                const min = Math.min(...slabs.map(s => s.minAmount));
                const max = Math.max(...slabs.map(s => s.maxAmount));

                return <span>₹{min} - ₹{max}</span>;
            }
        },

        {
            accessorKey: "status",
            header: "Status",
            cell: i => (
                <span className={`px-2 py-1 rounded-full text-xs ${i.getValue() ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {i.getValue() ? "Active" : "Inactive"}
                </span>
            )
        },

        {
            accessorKey: "createdAt",
            header: "Created",
            cell: i => <span>{new Date(i.getValue()).toLocaleString()}</span>
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
                icon={Files}
                iconColor="text-blue-600"
                title="Payment Charges"
                description="Global payment charges"
                buttonText="Add Mode"
                buttonIcon={Plus}
                onButtonClick={handleCreate}
                buttonColor="bg-blue-600 hover:bg-blue-700"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-6">
                <StatsCard icon={Banknote} label="Modes" value={stats.totalModes} bgColor="bg-green-100" iconColor="text-green-600" />
                <StatsCard icon={Files} label="Active" value={stats.activeModes} bgColor="bg-yellow-100" iconColor="text-yellow-600" />
                <StatsCard icon={Percent} label="Slabs" value={data.reduce((s, d) => s + d.slabs?.length, 0)} bgColor="bg-purple-100" iconColor="text-purple-600" />
                <StatsCard icon={Files} label="Total Records" value={data.length} bgColor="bg-blue-100" iconColor="text-blue-600" />
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <TableHeader
                    title="Global Payment Charges"
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Search mode..."
                />
                <Table
                    table={table}
                    columns={columns}
                    emptyState={{
                        icon: <Files size={50} />,
                        message: "No payment charges found",
                        action: (
                            <button
                                onClick={handleCreate}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Add Charge
                            </button>
                        )
                    }}
                />
                <Pagination table={table} />
            </div>

            {openForm && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentChargesForm
                        isOpen={openForm}
                        onClose={() => { setOpenForm(false); setEditing(null); }}
                        defaultValues={editing}
                        onSubmit={handleSubmit}
                    />
                </Suspense>
            )}

            {openView && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentChargesView
                        isOpen={openView}
                        onClose={() => { setOpenView(false); setViewing(null); }}
                        charge={viewing}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default PaymentChargesTable;
