import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender
} from "@tanstack/react-table";

import { Filter, ArrowUpDown } from "lucide-react";
import api from "../../constants/API/axiosInstance";
import UniversalExportButtons from "./UniversalExportButtons";
import TablePagination from "../../components/Reports/TablePagination";

const SettledUnsettledTransactionsReports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  /*
   * Logged-in user information
   */
  const userType = localStorage.getItem("userType")?.toLowerCase();
  const isMerchant = userType === "merchant";

  /*
   * customerId is treated as merchantId for merchant login.
   */
  const merchantId = localStorage.getItem("customerId");

  /*
   * Convert Date object to yyyy-MM-dd using local date.
   *
   * Do not use toISOString() here because it can change the date
   * depending on the browser timezone.
   */
  const formatDateForInput = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  /*
   * Merchant can see only:
   *
   * today
   * through
   * previous 7 days
   */
  const getMerchantMinimumDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - 7);

    return formatDateForInput(date);
  };

  const getTodayDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    return formatDateForInput(date);
  };

  /*
   * Default report filters
   */
  const getDefaultFilters = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 7);

    return {
      fromDate: formatDateForInput(pastDate),
      toDate: formatDateForInput(today),
      settlementStatus: "",
      dateType: "TRANSACTION_DATE"
    };
  };

  const [filters, setFilters] = useState(getDefaultFilters);

  /*
   * Generate an ISO date-time string while preserving the selected
   * calendar date.
   *
   * Example:
   * 2026-07-24T00:00:00+05:30
   */
  const createOffsetDateTime = (dateValue, endOfDay = false) => {
    if (!dateValue) {
      return null;
    }

    const time = endOfDay ? "23:59:59" : "00:00:00";

    const localDate = new Date(`${dateValue}T${time}`);

    const offsetMinutes = -localDate.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";

    const absoluteOffset = Math.abs(offsetMinutes);
    const offsetHours = String(
      Math.floor(absoluteOffset / 60)
    ).padStart(2, "0");

    const offsetRemainingMinutes = String(
      absoluteOffset % 60
    ).padStart(2, "0");

    return (
      `${dateValue}T${time}` +
      `${sign}${offsetHours}:${offsetRemainingMinutes}`
    );
  };

  /*
   * Validate merchant date range.
   */
  const validateMerchantDateRange = selectedFilters => {
    if (!isMerchant) {
      return true;
    }

    if (!selectedFilters.fromDate || !selectedFilters.toDate) {
      alert("From Date and To Date are required.");

      return false;
    }

    const today = new Date(`${getTodayDate()}T00:00:00`);
    const minimumDate = new Date(
      `${getMerchantMinimumDate()}T00:00:00`
    );

    const fromDate = new Date(
      `${selectedFilters.fromDate}T00:00:00`
    );

    const toDate = new Date(
      `${selectedFilters.toDate}T00:00:00`
    );

    if (fromDate > toDate) {
      alert("From Date cannot be greater than To Date.");

      return false;
    }

    if (fromDate < minimumDate || toDate < minimumDate) {
      alert(
        `Merchant can view records only from ` +
        `${getMerchantMinimumDate()} to ${getTodayDate()}.`
      );

      return false;
    }

    if (fromDate > today || toDate > today) {
      alert("Merchant cannot select a future date.");

      return false;
    }

    const differenceInMilliseconds =
      toDate.getTime() - fromDate.getTime();

    const differenceInDays =
      differenceInMilliseconds / (1000 * 60 * 60 * 24);

    if (differenceInDays > 7) {
      alert("Merchant can select a maximum date range of 7 days.");

      return false;
    }

    return true;
  };

  /*
   * Fetch report
   *
   * selectedFilters is optional so Reset can immediately call the API
   * with the newly generated default filters.
   */
  const fetchReports = async (selectedFilters = filters) => {
    if (!validateMerchantDateRange(selectedFilters)) {
      return;
    }

    if (isMerchant && !merchantId) {
      alert("Merchant ID was not found. Please login again.");

      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams();

      /*
       * Settlement status
       */
      if (selectedFilters.settlementStatus !== "") {
        params.append(
          "settled",
          selectedFilters.settlementStatus
        );
      }

      /*
       * Merchant must always search using TRANSACTION_DATE.
       *
       * Admin can select TRANSACTION_DATE or SETTLEMENT_DATE.
       */
      params.append(
        "dateType",
        isMerchant
          ? "TRANSACTION_DATE"
          : selectedFilters.dateType
      );

      /*
       * From date
       */
      if (selectedFilters.fromDate) {
        params.append(
          "fromDate",
          createOffsetDateTime(
            selectedFilters.fromDate,
            false
          )
        );
      }

      /*
       * To date
       */
      if (selectedFilters.toDate) {
        params.append(
          "toDate",
          createOffsetDateTime(
            selectedFilters.toDate,
            true
          )
        );
      }

      /*
       * Send merchantId only for merchant login.
       *
       * For admin login, merchantId will not be sent, so the existing
       * admin report will continue to return all records.
       */
      if (isMerchant) {
        params.append("merchantId", merchantId);
      }

      const response = await api.get(
        `/stats/settled-unsettled-reports?${params.toString()}`
      );

      setData(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load settled/unsettled transactions:",
        error
      );

      const errorMessage =
        error?.response?.data?.message ||
        "Failed to load transactions";

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Summary cards
   */
  const summary = useMemo(() => {
    const total = data.length;

    const settled = data.filter(
      transaction => transaction.settled === true
    ).length;

    const unsettled = data.filter(
      transaction => transaction.settled === false
    ).length;

    return {
      total,
      settled,
      unsettled
    };
  }, [data]);

  /*
   * Table columns
   */
  const columns = useMemo(
    () => [
      {
        accessorKey: "transactionReferenceId",
        header: "Txn Ref ID",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => {
          const value = getValue();

          return value !== null && value !== undefined
            ? value
            : "-";
        }
      },
      {
        accessorKey: "brandType",
        header: "Brand",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "cardType",
        header: "Card Type",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "cardTxnType",
        header: "Txn Type",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "merchant",
        header: "Merchant",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "mid",
        header: "MID",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "tid",
        header: "TID",
        cell: ({ getValue }) => getValue() || "-"
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
        cell: ({ getValue }) => getValue() || "-"
      },
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
            ? new Date(getValue()).toLocaleString("en-IN")
            : "-"
      },
      {
        accessorKey: "settledAt",
        header: "Settled At",
        cell: ({ getValue }) =>
          getValue()
            ? new Date(getValue()).toLocaleString("en-IN")
            : "-"
      }
    ],
    []
  );

  /*
   * React Table
   */
  const table = useReactTable({
    data,
    columns,

    state: {
      globalFilter,
      sorting
    },

    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  /*
   * Return to first table page whenever report data changes.
   */
  useEffect(() => {
    table.setPageIndex(0);
  }, [data]);

  /*
   * Load default report when page opens.
   */
  useEffect(() => {
    const initialFilters = getDefaultFilters();

    setFilters(initialFilters);
    fetchReports(initialFilters);
  }, []);

  /*
   * Filter handlers
   */
  const handleChange = event => {
    const { name, value } = event.target;

    setFilters(previousFilters => ({
      ...previousFilters,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchReports(filters);
  };

  const clearFilters = () => {
    const defaultFilters = getDefaultFilters();

    setFilters(defaultFilters);
    setGlobalFilter("");
    setSorting([]);

    fetchReports(defaultFilters);
  };

  /*
   * Export mapping
   */
  const excelTransform = reportData =>
    reportData.map(transaction => ({
      TransactionReferenceId:
        transaction.transactionReferenceId,

      Amount: transaction.amount,
      Brand: transaction.brandType,
      CardType: transaction.cardType,
      TransactionType: transaction.cardTxnType,
      Merchant: transaction.merchant,
      MID: transaction.mid,
      TID: transaction.tid,
      Mobile: transaction.mobile,

      SettlementStatus: transaction.settled
        ? "SETTLED"
        : "UNSETTLED",

      TransactionDate: transaction.date,
      SettledAt: transaction.settledAt
    }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Settled Unsettled Transactions
      </h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <SummaryCard
          title="Total Transactions"
          value={summary.total}
          color="blue"
        />

        <SummaryCard
          title="Settled Transactions"
          value={summary.settled}
          color="green"
        />

        <SummaryCard
          title="Unsettled Transactions"
          value={summary.unsettled}
          color="red"
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />

          <h2 className="text-lg font-semibold text-gray-900">
            Filters
          </h2>
        </div>

        {isMerchant && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            You can view transactions only from{" "}
            <strong>{getMerchantMinimumDate()}</strong> to{" "}
            <strong>{getTodayDate()}</strong>.
          </div>
        )}

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
              <option value="">
                All Transactions
              </option>

              <option value="true">
                Settled
              </option>

              <option value="false">
                Unsettled
              </option>
            </select>
          </div>

          {/*
           * Only admin/non-merchant users can see Date Type.
           */}
          {!isMerchant && (
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
                <option value="TRANSACTION_DATE">
                  By Transaction Date
                </option>

                <option value="SETTLEMENT_DATE">
                  By Settlement Date
                </option>
              </select>
            </div>
          )}

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
              min={
                isMerchant
                  ? getMerchantMinimumDate()
                  : undefined
              }
              max={
                isMerchant
                  ? filters.toDate || getTodayDate()
                  : undefined
              }
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
              min={
                isMerchant
                  ? filters.fromDate ||
                    getMerchantMinimumDate()
                  : undefined
              }
              max={
                isMerchant
                  ? getTodayDate()
                  : undefined
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Apply Filters"}
          </button>

          <button
            type="button"
            onClick={clearFilters}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <input
            type="text"
            placeholder="Search across all columns..."
            value={globalFilter}
            onChange={event =>
              setGlobalFilter(event.target.value)
            }
            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />

          <UniversalExportButtons
            data={data}
            filename="settled_unsettled_transactions"
            excelTransform={excelTransform}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-t">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      onClick={
                        header.column.getToggleSortingHandler()
                      }
                      className="p-3 text-left whitespace-nowrap cursor-pointer"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                      {header.column.getCanSort() && (
                        <ArrowUpDown className="inline w-4 h-4 ml-1" />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-10 text-center text-gray-500"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-10 text-center text-gray-500"
                  >
                    No transactions found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-t hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className="p-3 whitespace-nowrap"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <TablePagination
        table={table}
        totalRecords={data.length}
      />
    </div>
  );
};

/*
 * Tailwind requires complete class names.
 *
 * Using text-${color}-600 dynamically can cause the color classes
 * to be missing from the production build.
 */
const SummaryCard = ({
  title,
  value,
  color = "blue"
}) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    red: "text-red-600"
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p
        className={`text-3xl font-bold ${
          colorClasses[color] || colorClasses.blue
        }`}
      >
        {value}
      </p>
    </div>
  );
};

export default SettledUnsettledTransactionsReports;