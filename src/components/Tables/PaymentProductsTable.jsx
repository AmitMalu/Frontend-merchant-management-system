import React, { lazy, Suspense, useEffect, useState } from "react";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Eye, Trash2, Plus, Package, Edit } from "lucide-react";
import PageHeader from "../UI/PageHeader";
import TableHeader from "../UI/TableHeader";
import Table from "../UI/Table";
import Pagination from "../UI/Pagination";
import StatsCard from "../UI/StatsCard";
import FormShimmer from "../Shimmer/FormShimmer";
import api from "../../constants/API/axiosInstance";
import { toast } from "react-toastify";

// Updated imports
const PaymentProductsForm = lazy(() => import("../Forms/PaymentProductsForm"));
const PaymentProductsView = lazy(() => import("../View/PaymentProductsView"));

const PaymentProductsTable = () => {
    const [data, setData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [openForm, setOpenForm] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [editing, setEditing] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [totalElements, setTotalElements] = useState(0);

    const fetchData = async () => {
        try {
            const res = await api.get("/payment-products", {
                params: { page: 0, size: 100 }
            });

            const result = res.data.data.content;
            setData(result);
            setTotalElements(res.data.data.totalElements || result.length);

        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch payment products");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = () => {
        setEditing(null);
        setOpenForm(true);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editing) {
                await api.put(`/payment-products/${editing.id}`, payload);
                toast.success("Payment product updated");
            } else {
                await api.post("/payment-products", payload);
                toast.success("Payment product created");
            }

            setOpenForm(false);
            setEditing(null);
            fetchData();

        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to save payment product");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this payment product?")) return;

        try {
            await api.delete(`/payment-products/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    const activeCount = data.filter(p => p.status).length;

    const columns = [
        {
            accessorKey: "id",
            header: "ID",
            cell: i => <span className="font-medium">#{i.getValue()}</span>
        },
        {
            accessorKey: "productName",
            header: "Product Name",
            cell: i => <div className="font-semibold text-gray-800">{i.getValue()}</div>
        },
        {
            accessorKey: "productCode",
            header: "Product Code",
            cell: i => <div className="font-mono text-sm px-2 py-1 rounded">{i.getValue()}</div>
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
            cell: i => <span className="text-sm">{new Date(i.getValue()).toLocaleString()}</span>
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
                icon={Package}
                iconColor="text-blue-600"
                title="Payment Products"
                description="Manage payment product configurations"
                buttonText="Add Product"
                buttonIcon={Plus}
                onButtonClick={handleCreate}
                buttonColor="bg-blue-600 hover:bg-blue-700"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 mb-6">
                <StatsCard
                    icon={Package}
                    label="Total Products"
                    value={totalElements}
                    bgColor="bg-purple-100"
                    iconColor="text-blue-600"
                />
                <StatsCard
                    icon={Package}
                    label="Active Products"
                    value={activeCount}
                    bgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <StatsCard
                    icon={Package}
                    label="Inactive Products"
                    value={totalElements - activeCount}
                    bgColor="bg-gray-100"
                    iconColor="text-gray-600"
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <TableHeader
                    title="Payment Products List"
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    searchPlaceholder="Search products..."
                />
                <Table
                    table={table}
                    columns={columns}
                    emptyState={{
                        icon: <Package size={50} />,
                        message: "No payment products found",
                        action: (
                            <button onClick={handleCreate} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                                Add Product
                            </button>
                        )
                    }}
                />
                <Pagination table={table} />
            </div>

            {openForm && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentProductsForm
                        isOpen={openForm}
                        onClose={() => { setOpenForm(false); setEditing(null); }}
                        defaultValues={editing}
                        onSubmit={handleSubmit}
                    />
                </Suspense>
            )}

            {openView && (
                <Suspense fallback={<FormShimmer />}>
                    <PaymentProductsView
                        isOpen={openView}
                        onClose={() => { setOpenView(false); setViewing(null); }}
                        product={viewing}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default PaymentProductsTable;
