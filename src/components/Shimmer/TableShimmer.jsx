import React from 'react'

const TableShimmer = ({ rows = 10, columns = 5 }) => {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            {/* 🔹 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 m-8">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="p-4 bg-gray-100 rounded-lg shadow-sm  animate-pulse"
                    >
                        <div className="h-4 w-24 bg-gray-200 rounded mb-3"></div>
                        <div className="h-6 w-32 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
            <div className="overflow-x-auto  rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {Array.from({ length: columns }).map((_, index) => (
                                <th key={index} className="px-6 py-3">
                                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-8 w-10 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
        </div>
    )
}

export default TableShimmer