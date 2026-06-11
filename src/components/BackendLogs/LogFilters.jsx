import React from 'react';
import Select from 'react-select';

const LogFilters = ({
    selectedTable,
    selectedFilter,
    dateRange,
    onTableChange,
    onFilterChange,
    onDateRangeChange,
    onFetch,
    loading,
    tableOptions,
    filterOptions
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Log Table
                    </label>
                    <Select
                        value={selectedTable}
                        onChange={onTableChange}
                        options={tableOptions}
                        placeholder="Choose a log table..."
                        className="text-sm"
                        isClearable
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Filter
                    </label>
                    <Select
                        value={selectedFilter}
                        onChange={onFilterChange}
                        options={selectedTable ? filterOptions[selectedTable.value] : []}
                        placeholder={selectedTable ? "Choose a filter..." : "Select a table first"}
                        className="text-sm"
                        isDisabled={!selectedTable}
                        isClearable
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onFetch}
                    disabled={!selectedFilter || loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {loading ? 'Loading...' : 'Fetch Logs'}
                </button>

                {(dateRange.start || dateRange.end) && (
                    <button
                        onClick={() => onDateRangeChange({ start: '', end: '' })}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Clear Dates
                    </button>
                )}
            </div>
        </div>
    );
};

export default LogFilters;