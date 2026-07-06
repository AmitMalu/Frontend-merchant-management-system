import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table";
import { Filter, ArrowUpDown } from "lucide-react";
import api from "../../constants/API/axiosInstance";
import UniversalExportButtons from "./UniversalExportButtons";
import TablePagination from "../../components/Reports/TablePagination";

/* ===================== MAIN COMPONENT ===================== */

const PayoutTransactionsReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [totalRecords, setTotalRecords] = useState(0);
  const [payoutCount, setPayoutCount] = useState(0);
  const [payoutRefundCount, setPayoutRefundCount] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  /* ===================== DEFAULT FILTER ===================== */

  const getLast7Days = () => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);

    return {
      startDate: past.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
      service: "BOTH"
    };
  };

  const [filters, setFilters] = useState(getLast7Days);

  /* ===================== FETCH DATA ===================== */

  const fetchPayoutTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.service && filters.service !== "BOTH") {
        params.append("service", filters.service);
      }

      params.append("page", page);
      params.append("size", size);

      const res = await api.get(
        `/payment-payout/transactions/report?${params.toString()}`
      );

      setData(res.data.transactions?.content || []);
      setTotalRecords(res.data.totalCount || 0);
      setPayoutCount(res.data.payoutCount || 0);
      setPayoutRefundCount(res.data.payoutRefundCount || 0);
    } catch (err) {
      console.error(err);
      alert("Failed to load payout transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutTransactions();
  }, [page, size]);

  /* ===================== COLUMNS ===================== */

  const columns = useMemo(() => [
    { accessorKey: "transactionId", header: "Transaction ID" },
    {
      accessorKey: "transactionDate",
      header: "Transaction Date",
      cell: ({ getValue }) =>
        getValue()
          ? new Date(getValue()).toLocaleString("en-IN")
          : "-"
    },
    { accessorKey: "balBeforeTran", header: "Balance Before" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "balAfterTran", header: "Balance After" },
    { accessorKey: "remarks", header: "Remarks" },
    { accessorKey: "transactionType", header: "Transaction Type" },
    { accessorKey: "tranStatus", header: "Transaction Status" },
    {
      accessorKey: "merchantId",
      header: "Merchant ID",
      cell: ({ getValue }) => getValue() ?? "-"
    },
    {
      accessorKey: "franchiseId",
      header: "Franchise ID",
      cell: ({ getValue }) => getValue() ?? "-"
    }
  ], []);

  /* ===================== TABLE ===================== */

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRecords / size),
    state: {
      pagination: { pageIndex: page, pageSize: size }
    },
    manualPagination: true,
    onPaginationChange: updater => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: page, pageSize: size })
          : updater;

      setPage(next.pageIndex);
      setSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel()
  });

  /* ===================== FILTER HANDLERS ===================== */

  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(0);
    fetchPayoutTransactions();
  };

  const clearFilters = () => {
    setFilters(getLast7Days());
    setPage(0);
    setSize(10);
    setTimeout(fetchPayoutTransactions, 0);
  };

  /* ===================== EXPORT — fetch ALL records ===================== */

  const fetchAllForExport = async () => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate)   params.append("endDate",   filters.endDate);
    if (filters.service && filters.service !== "BOTH") {
      params.append("service", filters.service);
    }
    // fetch every record in the current date range
    params.append("page", 0);
    params.append("size", totalRecords > 0 ? totalRecords : 10000);

    const res = await api.get(
      `/payment-payout/transactions/report?${params.toString()}`
    );
    return res.data.transactions?.content || [];
  };

  const excelTransform = data =>
    data.map(d => ({
      TransactionId:     d.transactionId,
      TransactionDate:   d.transactionDate,
      BalanceBefore:     d.balBeforeTran,
      Amount:            d.amount,
      BalanceAfter:      d.balAfterTran,
      Remarks:           d.remarks,
      TransactionType:   d.transactionType,
      TransactionStatus: d.tranStatus,
      MerchantId:        d.merchantId,
      FranchiseId:       d.franchiseId,
    }));

  /* ===================== UI ===================== */

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Payout Transactions</h1>

      {/* ===================== SUMMARY COUNTS (RESTORED) ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard title="Total Transactions" value={totalRecords} />
        <SummaryCard title="Payout" value={payoutCount} color="green" />
        <SummaryCard title="Payout Refund" value={payoutRefundCount} color="red" />
      </div>

      {/* ===================== FILTER CARD ===================== */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        {/* FILTER ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleChange}
            className="px-4 py-2 border rounded-lg w-full"
          />

          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleChange}
            className="px-4 py-2 border rounded-lg w-full"
          />

          <select
            name="service"
            value={filters.service}
            onChange={handleChange}
            className="px-4 py-2 border rounded-lg w-full"
          >
            <option value="BOTH">All</option>
            <option value="PAYOUT">Payout</option>
            <option value="PAYOUT_REFUND">Refund</option>
          </select>
        </div>

        {/* BUTTON ROW */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Apply
          </button>

          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-200 rounded-lg"
          >
            Clear
          </button>
        </div>

      </div>

      {/* ===================== TABLE ===================== */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex justify-end">
          <UniversalExportButtons
            data={data}
            fetchAllData={fetchAllForExport}
            filename="payout_transactions"
            excelTransform={excelTransform}
          />
        </div>

        <table className="w-full border-t">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="p-3 text-left">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination table={table} totalRecords={totalRecords} />
    </div>
  );
};

/* ===================== SUMMARY CARD ===================== */

const SummaryCard = ({ title, value, color = "blue" }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

export default PayoutTransactionsReport;
