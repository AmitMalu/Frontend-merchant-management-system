// SearchableTableHeader.jsx
import React from 'react';
import { Search } from 'lucide-react';

const TableHeader = ({
    title,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    className = "",
    children
}) => {
    return (
        <div className={`${className} p-6 border-b border-gray-200 `}>
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <div className="flex items-center gap-4">
                    {children}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            value={searchValue ?? ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={searchPlaceholder}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TableHeader;