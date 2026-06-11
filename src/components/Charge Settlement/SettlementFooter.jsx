import React from 'react';
import { formatCurrency, formatNumber } from './formatters';

/**
 * Settlement footer component with totals and action buttons
 * Used in both direct and franchise settlement flows
 */
const SettlementFooter = ({
    selectedCount = 0,
    totalCount = 0,
    selectedAmount = 0,
    selectedFees = 0,
    selectedNet = 0,
    onStartSettlement,
    onCancel,
    isProcessing = false,
    disabled = false,
    showGlobalTotals = false,
    globalTotals = null, // For franchise: { merchants: 0, transactions: 0, amount: 0, fees: 0, net: 0 }
}) => {

    const hasSelections = selectedCount > 0;

        const settlementLabelCount =
        showGlobalTotals && globalTotals
            ? globalTotals.transactions
            : selectedCount;

    return (
        <div className="bg-white border-t border-gray-200 px-6 py-4 sticky bottom-0 z-10 shadow-lg scale-80">
            <div className="flex flex-col space-y-4">

                {/* Global totals for franchise */}
                {showGlobalTotals && globalTotals && (
                    <div className="border-b border-gray-200 pb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Global Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Merchants:</span>
                                <div className="font-semibold text-gray-900">{formatNumber(globalTotals.merchants)}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Transactions:</span>
                                <div className="font-semibold text-gray-900">{formatNumber(globalTotals.transactions)}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Amount:</span>
                                <div className="font-semibold text-gray-900">{formatCurrency(globalTotals.amount)}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Fees:</span>
                                <div className="font-semibold text-gray-900">{formatCurrency(globalTotals.fees)}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Net:</span>
                                <div className="font-semibold text-green-600">{formatCurrency(globalTotals.net)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current selection totals */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">

                    {/* Selection Summary */}
                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 ">
                            {showGlobalTotals ? 'Current Selection' : 'Selection Summary'}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Selected:</span>
                                <div className="font-semibold text-gray-900">
                                    {formatNumber(selectedCount)} / {formatNumber(totalCount)}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-500">Amount:</span>
                                <div className="font-semibold text-gray-900">{formatCurrency(selectedAmount)}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Fees:</span>
                                <div className="font-semibold text-gray-900">{formatCurrency(selectedFees)}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Net:</span>
                                <div className="font-semibold text-green-600">{formatCurrency(selectedNet)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onCancel}
                            disabled={isProcessing}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel Batch
                        </button>

                        <button
                            onClick={onStartSettlement}
                            disabled={disabled || !hasSelections || isProcessing}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
                        >
                            {isProcessing ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </div>
                            ) : (
                                    `Start Settlement (${formatNumber(settlementLabelCount)})`
                            )}
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                {!hasSelections && totalCount > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                            Please select at least one transaction to start settlement.
                        </p>
                    </div>
                )}

                {totalCount === 0 && (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-600">
                            No valid candidates available for settlement.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettlementFooter;