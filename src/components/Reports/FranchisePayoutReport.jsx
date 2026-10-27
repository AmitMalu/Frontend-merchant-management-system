import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../constants/API/axiosInstance";
import UniversalExportButtons from "./UniversalExportButtons";
import TablePagination from "./TablePagination";

/* ===================== HELPERS ===================== */

const toDateInput = (d) => {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const getDefaultFilters = () => {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 7);

  return {
    startDate: toDateInput(past),
    endDate: toDateInput(today),
    status: "ALL",
    paymentMode: "ALL",
    search: "",
    // OWN (first load) | ALL (me + my merchants) | <merchantId>
    view: "OWN"
  };
};

const formatMoney = (v) =>
  `₹${Number(v ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (v) => (v ? new Date(v).toLocaleString("en-IN") : "-");

const STATUS_STYLE = {
  SUCCESS: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700"
};

const SUMMARY_CONFIG = [
  { key: "totalCount", label: "Total Payouts" },
  { key: "successCount", label: "Successful" },
  { key: "pendingCount", label: "Pending" },
  { key: "failedCount", label: "Failed" },
  { key: "successAmount", label: "Payout Amount (Successful)", formatter: formatMoney },
  { key: "successCharges", label: "Service Charges (Successful)", formatter: formatMoney },
  { key: "successTotalDeducted", label: "Total Deducted (Successful)", formatter: formatMoney }
];

/* ===================== MAIN COMPONENT ===================== */

const FranchisePayoutReport = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // `filters` is what the user is editing; `applied` is what the report was loaded with
  const [filters, setFilters] = useState(getDefaultFilters);
  const [applied, setApplied] = useState(getDefaultFilters);

  const [merchants, setMerchants] = useState([]);

  /* ===================== MERCHANT SELECTOR ===================== */

  useEffect(() => {
    const franchiseId = localStorage.getItem("customerId");
    if (!franchiseId) return;

    const load = async () => {
      try {
        const res = await api.get(`/merchants/franchise/${franchiseId}`);
        setMerchants(res.data || []);
      } catch (err) {
        console.error("Could not load the franchise's merchants", err);
      }
    };
    load();
  }, []);

  /* ===================== FETCH DATA ===================== */

  const buildParams = (f, pageNo, pageSize) => {
    const params = new URLSearchParams();

    if (f.startDate) params.append("startDate", f.startDate);
    if (f.endDate) params.append("endDate", f.endDate);
    if (f.status && f.status !== "ALL") params.append("status", f.status);
    if (f.paymentMode && f.paymentMode !== "ALL") params.append("paymentMode", f.paymentMode);
    if (f.search && f.search.trim()) params.append("search", f.search.trim());

    // Whose payouts: the server already limits this to the franchise and its merchants,
    // this only narrows it down further.
    if (f.view === "OWN") {
      params.append("customerType", "FRANCHISE");
    } else if (f.view !== "ALL") {
      params.append("customerType", "MERCHANT");
      params.append("customerId", f.view);
    }

    params.append("page", pageNo);
    params.append("size", pageSize);
    return params.toString();
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/reports/payout/franchise?${buildParams(applied, page, size)}`);
        const data = res.data?.data;
        if (cancelled) return;
        setRows(data?.rows || []);
        setTotalRecords(data?.totalCount || 0);
        setSummary(data?.summary || null);
      } catch (err) {
        if (cancelled) return;
        setRows([]);
        setTotalRecords(0);
        setSummary(null);
        setError(err?.response?.data?.message || "Could not load the report. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [applied, page, size]);

  /* ===================== COLUMNS ===================== */

  const columns = useMemo(() => [
    { accessorKey: "createdAt", header: "Date", cell: ({ getValue }) => formatDate(getValue()) },
    {
      accessorKey: "referenceId",
      header: "Reference ID",
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-indigo-700">{getValue() ?? "-"}</span>
      )
    },
    {
      id: "account",
      header: "Account",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div>
            <div className="font-medium">{r.accountName || `#${r.accountId}`}</div>
            <div className="text-xs text-gray-500">
              {r.accountType === "FRANCHISE" ? "Franchise (me)" : "Merchant"} #{r.accountId}
            </div>
          </div>
        );
      }
    },
    { accessorKey: "beneficiaryName", header: "Beneficiary", cell: ({ getValue }) => getValue() ?? "-" },
    {
      accessorKey: "beneficiaryAccount",
      header: "Account No.",
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() ?? "-"}</span>
    },
    { accessorKey: "beneficiaryIfsc", header: "IFSC", cell: ({ getValue }) => getValue() ?? "-" },
    { accessorKey: "beneficiaryBank", header: "Bank", cell: ({ getValue }) => getValue() ?? "-" },
    { accessorKey: "paymentMode", header: "Mode", cell: ({ getValue }) => getValue() ?? "-" },
    { accessorKey: "purpose", header: "Purpose", cell: ({ getValue }) => getValue() ?? "-" },
    { accessorKey: "amount", header: "Amount", cell: ({ getValue }) => formatMoney(getValue()) },
    { accessorKey: "charges", header: "Service Charge", cell: ({ getValue }) => formatMoney(getValue()) },
    { accessorKey: "totalDeducted", header: "Total Deducted", cell: ({ getValue }) => formatMoney(getValue()) },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[getValue()] || "bg-gray-100 text-gray-700"}`}>
          {getValue() ?? "-"}
        </span>
      )
    },
    {
      accessorKey: "bankRefNo",
      header: "Bank Ref No. (UTR)",
      cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() ?? "-"}</span>
    },
    {
      accessorKey: "message",
      header: "Remarks",
      cell: ({ getValue }) => (
        <span className="block max-w-xs whitespace-normal text-xs text-gray-600">{getValue() ?? "-"}</span>
      )
    }
  ], []);

  /* ===================== TABLE ===================== */

  const table = useReactTable({
    data: rows,
    columns,
    pageCount: Math.ceil(totalRecords / size),
    state: {
      pagination: { pageIndex: page, pageSize: size }
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      toast.error("Start date cannot be after end date.");
      return;
    }
    setPage(0);
    setApplied({ ...filters });
  };

  const clearFilters = () => {
    const fresh = getDefaultFilters();
    setFilters(fresh);
    setPage(0);
    setSize(10);
    setApplied(fresh);
  };

  /* ===================== EXPORT: all records for the applied filters ===================== */

  const fetchAllForExport = async () => {
    const res = await api.get(
      `/reports/payout/franchise?${buildParams(applied, 0, totalRecords > 0 ? totalRecords : 10000)}`
    );
    return res.data?.data?.rows || [];
  };

  const excelTransform = (data) =>
    data.map((d) => ({
      Date: d.createdAt ? new Date(d.createdAt).toLocaleString("en-IN") : "",
      ReferenceId: d.referenceId,
      AccountType: d.accountType,
      AccountId: d.accountId,
      AccountName: d.accountName,
      Beneficiary: d.beneficiaryName,
      BeneficiaryAccount: d.beneficiaryAccount,
      IFSC: d.beneficiaryIfsc,
      Bank: d.beneficiaryBank,
      Mode: d.paymentMode,
      Purpose: d.purpose,
      Amount: d.amount,
      ServiceCharge: d.charges,
      TotalDeducted: d.totalDeducted,
      Status: d.status,
      BankRefNo: d.bankRefNo ?? "",
      Remarks: d.message ?? ""
    }));

  const pdfTransform = (data) =>
    data.map((d) => ({
      date: d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-IN") : "",
      ref: d.referenceId,
      account: d.accountName ?? "",
      beneficiary: d.beneficiaryName,
      mode: d.paymentMode,
      amount: d.amount,
      charge: d.charges,
      total: d.totalDeducted,
      status: d.status
    }));

  const pdfColumns = {
    headers: ["Date", "Reference ID", "Account", "Beneficiary", "Mode", "Amount", "Charge", "Total", "Status"],
    keys: ["date", "ref", "account", "beneficiary", "mode", "amount", "charge", "total", "status"]
  };

  /* ===================== UI ===================== */

  const inputClass = "px-4 py-2 border rounded-lg w-full";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-1">Payout Transaction Report</h1>
      <p className="text-sm text-gray-500 mb-6">
        Your own payouts, and those of the merchants under you. It opens on your own payouts; use
        &quot;Show payouts of&quot; to see your merchants.
      </p>

      {/* ===================== SUMMARY ===================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        <SummaryCard title="Total Payouts" value={summary?.totalCount ?? 0} />
        <SummaryCard title="Successful" value={summary?.successCount ?? 0} color="green" />
        <SummaryCard title="Pending" value={summary?.pendingCount ?? 0} color="amber" />
        <SummaryCard title="Failed" value={summary?.failedCount ?? 0} color="red" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        <SummaryCard title="Payout Amount (Successful)" value={formatMoney(summary?.successAmount)} />
        <SummaryCard title="Service Charges (Successful)" value={formatMoney(summary?.successCharges)} />
        <SummaryCard title="Total Deducted (Successful)" value={formatMoney(summary?.successTotalDeducted)} />
      </div>
      <p className="text-xs text-gray-500 mb-6">
        Amounts include successful payouts only. Pending payouts are still being confirmed; failed payouts were refunded.
      </p>

      {/* ===================== FILTER CARD ===================== */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Start Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>End Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select name="status" value={filters.status} onChange={handleChange} className={inputClass}>
              <option value="ALL">All</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Show payouts of</label>
            <select name="view" value={filters.view} onChange={handleChange} className={inputClass}>
              <option value="OWN">My own payouts</option>
              <option value="ALL">All (me + my merchants)</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  Merchant: {m.businessName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Payment Mode</label>
            <select name="paymentMode" value={filters.paymentMode} onChange={handleChange} className={inputClass}>
              <option value="ALL">All</option>
              <option value="IMPS">IMPS</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className={labelClass}>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Reference ID, beneficiary name, bank ref no. (UTR), account last 4 digits"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={applyFilters} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
            Apply
          </button>
          <button onClick={clearFilters} className="px-6 py-2 bg-gray-200 rounded-lg">
            Clear
          </button>
        </div>
      </div>

      {/* ===================== TABLE ===================== */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 flex justify-end">
          <UniversalExportButtons
            data={rows}
            fetchAllData={fetchAllForExport}
            filename="franchise_payout_report"
            title="Payout Transaction Report"
            columns={pdfColumns}
            excelTransform={excelTransform}
            pdfTransform={pdfTransform}
            summary={summary}
            summaryConfig={SUMMARY_CONFIG}
          />
        </div>

        {error && (
          <div className="mx-4 mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded p-3">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-t">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="p-3 text-left whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="p-10 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Loading report...
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-10 text-center text-gray-500">
                    No payouts found for these filters.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TablePagination table={table} totalRecords={totalRecords} />
    </div>
  );
};

/* ===================== SUMMARY CARD ===================== */

const COLOR_CLASS = {
  blue: "text-blue-600",
  green: "text-green-600",
  amber: "text-amber-600",
  red: "text-red-600"
};

const SummaryCard = ({ title, value, color = "blue" }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className={`text-2xl font-bold ${COLOR_CLASS[color]}`}>{value}</p>
  </div>
);

export default FranchisePayoutReport;
