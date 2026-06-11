import React, { useState, useCallback } from "react";
import { Eye } from "lucide-react";
import TablePagination from "../../components/Reports/TablePagination";
import api from "../../constants/API/axiosInstance";

const PrefundAuthorization = () => {
    const [data, setData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        status: "ALL",
        requestedType: "ALL",
        depositDate: "",
    });

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    /* ================= FETCH DATA ================= */

    const fetchData = useCallback(async (customPage = page) => {
        try {
            setLoading(true);

            let params = {
                page: customPage,
                size,
            };

            if (filters.status !== "ALL")
                params.status = filters.status;

            if (filters.requestedType !== "ALL")
                params.requestedType = filters.requestedType;

            if (filters.depositDate)
                params.depositDate = filters.depositDate;

            const res = await api.get("/prefund", { params });

            setData(res.data?.content || []);
            setTotalRecords(res.data?.totalElements || 0);
            setPage(customPage);
        } catch (error) {
            console.error("Error fetching prefund requests:", error);
        } finally {
            setLoading(false);
        }
}, [filters, size]);

    const handleSearch = () => {
        fetchData(0);
    };

    /* ================= APPROVE / REJECT ================= */

    const handleAction = async (id, action) => {
        if (!window.confirm(`Do you want to ${action} this request?`))
            return;

        try {
            setLoading(true);

            await api.put(`/prefund/${id}/action`, null, {
                params: { action },
            });

            fetchData(page);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-500";
            case "APPROVED":
                return "bg-green-600";
            case "REJECTED":
                return "bg-red-600";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">
                Prefund Authorization
            </h2>

            {/* ================= FILTER SECTION ================= */}

            <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                        }
                        className="border p-2 rounded w-40"
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Requested Type</label>
                    <select
                        value={filters.requestedType}
                        onChange={(e) =>
                            setFilters({ ...filters, requestedType: e.target.value })
                        }
                        className="border p-2 rounded w-40"
                    >
                        <option value="ALL">All</option>
                        <option value="MERCHANT">Merchant</option>
                        <option value="FRANCHISE">Franchise</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1">Deposit Date</label>
                    <input
                        type="date"
                        value={filters.depositDate}
                        onChange={(e) =>
                            setFilters({ ...filters, depositDate: e.target.value })
                        }
                        className="border p-2 rounded"
                    />
                </div>

                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                >
                    Search
                </button>
            </div>

            {/* ================= TABLE ================= */}

            {loading ? (
                <div className="text-center py-4 font-medium">
                    Loading...
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2">ID</th>
                                <th className="p-2">TranxId</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Requested Id</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Status</th>
                                <th className="p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item) => (
                                    <tr key={item.id} className="text-center border-t">
                                        <td className="p-2">{item.id}</td>
                                        <td className="p-2">{item.tranxId}</td>
                                        <td className="p-2">{item.requestedType}</td>
                                        <td className="p-2">{item.requestedById}</td>
                                        <td className="p-2">₹{item.depositAmount}</td>
                                        <td className="p-2">
                                            <span
                                                className={`px-3 py-1 rounded text-white text-xs ${getStatusStyle(item.requestStatus)}`}
                                            >
                                                {item.requestStatus}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <Eye
                                                size={18}
                                                className="cursor-pointer text-blue-600"
                                                onClick={() => setSelectedRequest(item)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-6">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ================= PAGINATION ================= */}

            <TablePagination
                table={{
                    getState: () => ({
                        pagination: { pageIndex: page, pageSize: size },
                    }),
                    setPageIndex: (p) => fetchData(p),
                    previousPage: () => fetchData(Math.max(page - 1, 0)),
                    nextPage: () => fetchData(page + 1),
                    getCanPreviousPage: () => page > 0,
                    getCanNextPage: () => (page + 1) * size < totalRecords,
                    getPageCount: () => Math.ceil(totalRecords / size),
                    setPageSize: setSize,
                }}
                totalRecords={totalRecords}
            />

            {/* ================= DETAILS MODAL ================= */}

            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg w-96 p-6 relative">

                        <h3 className="text-lg font-semibold mb-4">
                            Prefund Request Details
                        </h3>

                        <div className="space-y-2 text-sm">
                            <p><strong>ID:</strong> {selectedRequest.id}</p>
                            <p><strong>Transaction ID:</strong> {selectedRequest.tranxId}</p>
                            <p><strong>Type:</strong> {selectedRequest.requestedType}</p>
                            <p><strong>Requested By:</strong> {selectedRequest.requestedById}</p>
                            <p><strong>Amount:</strong> ₹{selectedRequest.depositAmount}</p>
                            <p><strong>Status:</strong> {selectedRequest.requestStatus}</p>
                            <p><strong>Deposit Date:</strong> {selectedRequest.depositDate}</p>
                        </div>

                        {selectedRequest.requestStatus === "PENDING" && (
                            <div className="flex justify-between mt-6">
                                <button
                                    onClick={() =>
                                        handleAction(selectedRequest.id, "APPROVED")
                                    }
                                    className="bg-green-600 text-white px-4 py-2 rounded"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() =>
                                        handleAction(selectedRequest.id, "REJECTED")
                                    }
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setSelectedRequest(null)}
                            className="absolute top-2 right-3 text-gray-500 text-lg"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrefundAuthorization;
