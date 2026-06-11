import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from "@tanstack/react-table";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import api from "../../constants/API/axiosInstance";
import UniversalExportButtons from "./UniversalExportButtons";
import TablePagination from "../../components/Reports/TablePagination";


const SettledUnsettledTransactionsReports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);


  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const getLast7Days = () => {
    const today = new Date();
    const past = new Date();
    past.setDate(today.getDate() - 7);

    return {
      fromDate: past.toISOString().split("T")[0],
      toDate: today.toISOString().split("T")[0],
      settlementStatus: "",
      dateType: "TRANSACTION_DATE"
    };
  };

  const [filters, setFilters] = useState(getLast7Days);



  /* ===================== FETCH DATA ===================== */
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.settlementStatus !== "") {
        params.append(
          "settled",
          filters.settlementStatus === "true" ? true : false
        );
      }

      if (filters.dateType) params.append("dateType", filters.dateType);

      if (filters.fromDate) {
        params.append(
          "fromDate",
          new Date(filters.fromDate + "T00:00:00").toISOString()
        );
      }

      if (filters.toDate) {
        params.append(
          "toDate",
          new Date(filters.toDate + "T23:59:59").toISOString()
        );
      }

      const res = await api.get(
        `/stats/settled-unsettled-reports?${params.toString()}`
      );

      setData(res.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    table.setPageIndex(0);
  }, [data]);


  useEffect(() => {
    fetchReports();
  }, []);

  /* ===================== SUMMARY ===================== */
  const summary = useMemo(() => {
    const total = data.length;
    const settled = data.filter(d => d.settled === true).length;
    const unsettled = data.filter(d => d.settled === false).length;
    return { total, settled, unsettled };
  }, [data]);

  /* ===================== COLUMNS ===================== */
  const columns = useMemo(() => [
    {
      accessorKey: "transactionReferenceId",
      header: "Txn Ref ID",
      cell: ({ getValue }) => getValue() || "-"
    },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "brandType", header: "Brand" },
    { accessorKey: "cardType", header: "Card Type" },
    { accessorKey: "cardTxnType", header: "Txn Type" },
    { accessorKey: "merchant", header: "Merchant" },
    { accessorKey: "mid", header: "MID" },
    { accessorKey: "tid", header: "TID" },
    { accessorKey: "mobile", header: "Mobile" },

    {
      accessorKey: "settled",
      header: "Settlement",
      cell: ({ getValue }) =>
        getValue() ? (
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
            SETTLED
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            UNSETTLED
          </span>
        )
    },

    {
      accessorKey: "date",
      header: "Txn Date",
      cell: ({ getValue }) =>
        getValue()
          ? new Date(getValue()).toLocaleDateString("en-IN")
          : "-"
    },

    {
      accessorKey: "settledAt",
      header: "Settled At",
      cell: ({ getValue }) =>
        getValue()
          ? new Date(getValue()).toLocaleDateString("en-IN")
          : "-"
    }
  ], []);

  /* ===================== TABLE ===================== */
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  /* ===================== FILTER HANDLERS ===================== */
  const handleChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => fetchReports();

  const clearFilters = () => {
    const defaults = getLast7Days();
    setFilters(defaults);

    setTimeout(() => {
      fetchReports();
    }, 100);
  };


  /* ===================== EXPORT ===================== */
  const excelTransform = data => data.map(d => ({
    Amount: d.amount,
    Brand: d.brandType,
    CardType: d.cardType,
    TxnType: d.cardTxnType,
    Merchant: d.merchant,
    MID: d.mid,
    TID: d.tid,
    Status: d.settled ? "SETTLED" : "UNSETTLED",
    Date: d.date
  }));

  /* ===================== UI ===================== */
  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Settled Unsettled Transactions</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard title="Total Transactions" value={summary.total} />
        <SummaryCard title="Settled Transactions" value={summary.settled} color="green" />
        <SummaryCard title="Unsettled Transactions" value={summary.unsettled} color="red" />
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>

        {/* Filter Inputs in one line on desktop */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Settlement Status */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="settlementStatus"
              value={filters.settlementStatus}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">All Transactions</option>
              <option value="true">Settled</option>
              <option value="false">Unsettled</option>
            </select>
          </div>

          {/* Date Type */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Type
            </label>
            <select
              name="dateType"
              value={filters.dateType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="TRANSACTION_DATE">By Transaction Date</option>
              <option value="SETTLEMENT_DATE">By Settlement Date</option>
            </select>
          </div>

          {/* From Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* To Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Buttons below the filters */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={applyFilters}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md"
          >
            Apply Filters
          </button>
          <button
            onClick={clearFilters}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </div>



      {/* TABLE */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex justify-between">
          <input
            placeholder="Search across all columns..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="input w-1/3"
          />
          <UniversalExportButtons
            data={data}
            filename="settled_unsettled_transactions"
            excelTransform={excelTransform}
          />
        </div>

        <table className="w-full border-t">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="p-3 text-left cursor-pointer">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <ArrowUpDown className="inline w-4 h-4 ml-1" />
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="border-t hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="p-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <TablePagination
        table={table}
        totalRecords={data.length}
      />

    </div>
  );
};

/* ===================== SMALL COMPONENT ===================== */
const SummaryCard = ({ title, value, color = "blue" }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

export default SettledUnsettledTransactionsReports;
