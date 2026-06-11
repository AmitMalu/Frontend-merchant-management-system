import React from 'react';
import { formatCurrency, formatDate, formatPercentage, truncateText } from './formatters';

/**
 * Reusable candidates table component
 * Displays settlement candidates with selection capabilities
 */
const CandidatesTable = ({
    candidates = [],
    selectedTxIds = [],
    onSelectionChange,
    onSelectAll,
    isSelectAllChecked = false,
    isSelectAllIndeterminate = false,
    isLoading = false,
}) => {

    const handleRowSelection = (txId, checked) => {
        if (checked) {
            onSelectionChange([...selectedTxIds, txId]);
        } else {
            onSelectionChange(selectedTxIds.filter(id => id !== txId));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            // Select all valid transaction IDs
            const validTxIds = candidates
                .filter(candidate => !candidate.error)
                .map(candidate => candidate.transactionReferenceId);
            onSelectionChange(validTxIds);
        } else {
            onSelectionChange([]);
        }
        onSelectAll?.(checked);
    };

    const validCandidates = candidates.filter(candidate => !candidate.error);
    const invalidCandidates = candidates.filter(candidate => candidate.error);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow border">
                <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading candidates...</p>
                </div>
            </div>
        );
    }

    if (!candidates.length) {
        return (
            <div className="bg-white rounded-lg shadow ">
                <div className="p-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No settlement candidates found</p>
                    <p className="text-sm mt-1">Try selecting different filters or check back later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
            {/* Header with totals */}
            <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                        Settlement Candidates ({candidates.length})
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="text-green-600 font-medium">
                            Valid: {validCandidates.length}
                        </span>
                        {invalidCandidates.length > 0 && (
                            <span className="text-red-600 font-medium">
                                Invalid: {invalidCandidates.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isSelectAllChecked}
                                        ref={(el) => {
                                            if (el) el.indeterminate = isSelectAllIndeterminate;
                                        }}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        disabled={validCandidates.length === 0}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Select</span>
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Transaction ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Card Details
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rate
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fee
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate) => {
                            const isSelected = selectedTxIds.includes(candidate.transactionReferenceId);
                            const hasError = Boolean(candidate.error);

                            return (
                                <tr
                                    key={candidate.internalId || candidate.transactionReferenceId}
                                    className={`hover:bg-gray-50 ${hasError ? 'bg-red-50' : ''}`}
                                >
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => handleRowSelection(candidate.transactionReferenceId, e.target.checked)}
                                            disabled={hasError}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                                        />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {truncateText(candidate.transactionReferenceId, 25)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(candidate.date)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {formatCurrency(candidate.amount)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{candidate.cardType || '—'}</div>
                                        <div className="text-xs text-gray-400">
                                            {candidate.brandType || '—'} • {candidate.cardName || '—'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                        {formatPercentage(candidate.appliedRate)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                        {formatCurrency(candidate.fee)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                        {formatCurrency(candidate.netAmount)}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {hasError ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {candidate.error}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Ready
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CandidatesTable;