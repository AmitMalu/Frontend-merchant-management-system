import React, { useRef, useEffect } from 'react';
import { formatCurrency, formatNumber } from './formatters';

/**
 * Excel-like bottom tabs for franchise settlement
 * Each merchant becomes a tab with summary info and selection state
 */
const MerchantTabs = ({
    merchants = [],
    activeTab,
    onTabChange,
    merchantSelections = {}, // { merchantId: { selectedCount: 0, totalCount: 0, amount: 0, fees: 0, net: 0 } }
    className = '',
}) => {
    const tabsRef = useRef(null);
    const activeTabRef = useRef(null);

    // Scroll active tab into view
    useEffect(() => {
        if (activeTabRef.current && tabsRef.current) {
            const tab = activeTabRef.current;
            const container = tabsRef.current;

            if (tab.offsetLeft < container.scrollLeft) {
                container.scrollLeft = tab.offsetLeft;
            } else if (tab.offsetLeft + tab.offsetWidth > container.scrollLeft + container.offsetWidth) {
                container.scrollLeft = tab.offsetLeft + tab.offsetWidth - container.offsetWidth;
            }
        }
    }, [activeTab]);

    if (!merchants.length) {
        return (
            <div className={`bg-gray-50 border-t ${className}`}>
                <div className="px-6 py-4 text-center text-gray-500">
                    <p>No merchants selected for settlement</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gray-50 border-t ${className}`}>
            {/* Scrollable tabs container */}
            <div
                ref={tabsRef}
                className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{ scrollbarHeight: '6px' }}
            >
                {merchants.map((merchant) => {
                    const isActive = activeTab === merchant.merchantId;
                    const selection = merchantSelections[merchant.merchantId] || {
                        selectedCount: 0,
                        totalCount: 0,
                        amount: 0,
                        fees: 0,
                        net: 0
                    };

                    const hasSelections = selection.selectedCount > 0;
                    const isComplete = selection.selectedCount === selection.totalCount && selection.totalCount > 0;

                    return (
                        <button
                            key={merchant.merchantId}
                            ref={isActive ? activeTabRef : null}
                            onClick={() => onTabChange(merchant.merchantId)}
                            onKeyDown={(e) => {
                                // Keyboard navigation
                                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                                    e.preventDefault();
                                    const currentIndex = merchants.findIndex(m => m.merchantId === merchant.merchantId);
                                    let nextIndex;

                                    if (e.key === 'ArrowLeft') {
                                        nextIndex = currentIndex > 0 ? currentIndex - 1 : merchants.length - 1;
                                    } else {
                                        nextIndex = currentIndex < merchants.length - 1 ? currentIndex + 1 : 0;
                                    }

                                    onTabChange(merchants[nextIndex].merchantId);
                                }
                            }}
                            className={`
                flex-shrink-0 min-w-60 max-w-80 px-4 py-3 text-left border-r border-gray-200 
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
                ${isActive
                                    ? 'bg-white border-b-2 border-b-blue-500 text-gray-900'
                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                }
              `}
                            aria-selected={isActive}
                            role="tab"
                            tabIndex={isActive ? 0 : -1}
                        >
                            <div className="space-y-1">
                                {/* Merchant name with status indicator */}
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium truncate pr-2">
                                        {merchant.businessName || `Merchant ${merchant.merchantId}`}
                                    </h4>
                                    <div className="flex items-center space-x-1">
                                        {hasSelections && (
                                            <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} />
                                        )}
                                        {selection.totalCount > 0 && !hasSelections && (
                                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                                        )}
                                    </div>
                                </div>

                                {/* Merchant stats */}
                                <div className="text-xs text-gray-500 space-y-0.5">
                                    <div className="flex justify-between">
                                        <span>Available:</span>
                                        <span>{formatNumber(merchant.availableTransactions || selection.totalCount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Selected:</span>
                                        <span className={hasSelections ? 'text-blue-600 font-medium' : ''}>
                                            {formatNumber(selection.selectedCount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className={hasSelections ? 'text-green-600 font-medium' : ''}>
                                            {formatCurrency(selection.amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress bar */}
                                {selection.totalCount > 0 && (
                                    <div className="w-full bg-gray-200 rounded-full h-1">
                                        <div
                                            className={`h-1 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : hasSelections ? 'bg-blue-500' : 'bg-gray-300'
                                                }`}
                                            style={{
                                                width: `${Math.max(0, Math.min(100, (selection.selectedCount / selection.totalCount) * 100))}%`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Tab panel indicator */}
            <div className="px-4 py-2 bg-white border-b text-sm text-gray-600">
                <div className="flex items-center justify-between">
                    <span>
                        Viewing: <strong>{merchants.find(m => m.merchantId === activeTab)?.businessName || 'Unknown Merchant'}</strong>
                    </span>
                    <span className="text-xs">
                        Tab {merchants.findIndex(m => m.merchantId === activeTab) + 1} of {merchants.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MerchantTabs;