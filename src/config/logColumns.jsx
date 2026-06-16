import { Eye } from 'lucide-react';

export const getLogColumns = (tableType, openModal) => {
    switch (tableType) {
        case 'requests':
            return [
                {
                    accessorKey: 'createdAt',
                    header: 'Timestamp',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('createdAt')).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'userId',
                    header: 'User',
                    cell: ({ row }) => (
                        <div className="text-sm">
                            <div className="font-medium text-gray-900 truncate max-w-[150px]">
                                {row.getValue('userId')}
                            </div>
                        </div>
                    ),
                },
                {
                    accessorKey: 'requestMethod',
                    header: 'Method',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${row.getValue('requestMethod') === 'GET' ? 'bg-blue-100 text-blue-800' :
                            row.getValue('requestMethod') === 'POST' ? 'bg-green-100 text-green-800' :
                                row.getValue('requestMethod') === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                    row.getValue('requestMethod') === 'DELETE' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                            }`}>
                            {row.getValue('requestMethod')}
                        </span>
                    ),
                },
                {
                    accessorKey: 'requestUrl',
                    header: 'URL',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900 truncate max-w-[200px]" title={row.getValue('requestUrl')}>
                            {row.getValue('requestUrl')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'responseStatus',
                    header: 'Status',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${row.getValue('responseStatus') >= 200 && row.getValue('responseStatus') < 300
                            ? 'bg-green-100 text-green-800'
                            : row.getValue('responseStatus') >= 400
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {row.getValue('responseStatus')}
                        </span>
                    ),
                },
                {
                    accessorKey: 'executionTimeMs',
                    header: 'Time (ms)',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('executionTimeMs')}
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'razorpay':
            return [
                {
                    accessorKey: 'createdAt',
                    header: 'Timestamp',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('createdAt')).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'txnId',
                    header: 'Transaction ID',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900 font-mono truncate max-w-[150px]">
                            {row.getValue('txnId')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'processStatus',
                    header: 'Status',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${row.getValue('processStatus') === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            row.getValue('processStatus') === 'FAILED' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                            {row.getValue('processStatus')}
                        </span>
                    ),
                },
                {
                    accessorKey: 'retryCount',
                    header: 'Retries',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('retryCount') || 0}
                        </div>
                    ),
                },
                {
                    accessorKey: 'processingTimeMs',
                    header: 'Time (ms)',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('processingTimeMs') || 'N/A'}
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'vendor-responses':
            return [
                {
                    accessorKey: 'createdOn',
                    header: 'Timestamp',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('createdOn')).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'vendorId',
                    header: 'Vendor ID',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('vendorId')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'apiName',
                    header: 'API Name',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900 truncate max-w-[150px]">
                            {row.getValue('apiName')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'statusCode',
                    header: 'Status',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${row.getValue('statusCode') >= 200 && row.getValue('statusCode') < 300
                            ? 'bg-green-100 text-green-800'
                            : row.getValue('statusCode') >= 400
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {row.getValue('statusCode')}
                        </span>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'vendor-daily':
            return [
                {
                    accessorKey: 'logDate',
                    header: 'Date',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('logDate')).toLocaleDateString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'totalAmountProcessed',
                    header: 'Amount Processed',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900 font-medium">
                            ₹{parseFloat(row.getValue('totalAmountProcessed')).toLocaleString('en-IN')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'transactionCount',
                    header: 'Transactions',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('transactionCount')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'failureCount',
                    header: 'Failures',
                    cell: ({ row }) => (
                        <div className="text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${row.getValue('failureCount') === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {row.getValue('failureCount')}
                            </span>
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'vendor-monthly':
            return [
                {
                    id: 'period',
                    header: 'Period',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900 font-medium">
                            {new Date(row.original.year, row.original.month - 1).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'totalAmountProcessed',
                    header: 'Amount Processed',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900 font-medium">
                            ₹{parseFloat(row.getValue('totalAmountProcessed')).toLocaleString('en-IN')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'totalTransactions',
                    header: 'Total Transactions',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('totalTransactions')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'totalSuccess',
                    header: 'Success',
                    cell: ({ row }) => (
                        <div className="text-sm text-green-600 font-medium">
                            {row.getValue('totalSuccess')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'totalFailures',
                    header: 'Failures',
                    cell: ({ row }) => (
                        <div className="text-sm text-red-600 font-medium">
                            {row.getValue('totalFailures')}
                        </div>
                    ),
                },
                {
                    accessorKey: 'averageTransactionAmount',
                    header: 'Avg Amount',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            ₹{parseFloat(row.getValue('averageTransactionAmount') || 0).toLocaleString('en-IN')}
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'franchise-or-merchant-notification':
            return [
                {
                    accessorKey: 'createdAt',
                    header: 'Timestamp',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('createdAt')).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'txnId',
                    header: 'Transaction ID',
                    cell: ({ row }) => (
                        <div className="text-sm font-mono text-gray-900 truncate max-w-[180px]">
                            {row.getValue('txnId') || '—'}
                        </div>
                    ),
                },
                {
                    accessorKey: 'send',
                    header: 'Status',
                    cell: ({ row }) => {
                        const isSend = row.getValue('send');
                        return (
                            <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${isSend
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                            >
                                {isSend ? 'SUCCESS' : 'FAILED'}
                            </span>
                        );
                    },
                },
                {
                    accessorKey: 'errorMessage',
                    header: 'Error Message',
                    cell: ({ row }) => (
                        <div
                            className="text-sm text-gray-900 truncate max-w-[250px]"
                            title={row.getValue('errorMessage')}
                        >
                            {row.getValue('errorMessage') || '—'}
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'digilocker':
            return [
                {
                    accessorKey: 'createdAt',
                    header: 'Timestamp',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('createdAt')).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'clientId',
                    header: 'Client ID',
                    cell: ({ row }) => (
                        <div className="text-sm font-mono text-gray-900 truncate max-w-[120px]" title={row.getValue('clientId')}>
                            {row.getValue('clientId') || '—'}
                        </div>
                    ),
                },
                {
                    accessorKey: 'merchantId',
                    header: 'Merchant ID',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('merchantId') || '—'}
                        </div>
                    ),
                },
                {
                    accessorKey: 'franchiseId',
                    header: 'Franchise ID',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('franchiseId') || '—'}
                        </div>
                    ),
                },
                {
                    accessorKey: 'apiName',
                    header: 'API Name',
                    cell: ({ row }) => (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-purple-100 text-purple-800">
                            {row.getValue('apiName') || '—'}
                        </span>
                    ),
                },
                {
                    accessorKey: 'processStatus',
                    header: 'Status',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            row.getValue('processStatus') === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            row.getValue('processStatus') === 'FAILED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {row.getValue('processStatus') || '—'}
                        </span>
                    ),
                },
                {
                    accessorKey: 'httpStatus',
                    header: 'HTTP Status',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            row.getValue('httpStatus') >= 200 && row.getValue('httpStatus') < 300 ? 'bg-green-100 text-green-800' :
                            row.getValue('httpStatus') >= 400 ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {row.getValue('httpStatus') || '—'}
                        </span>
                    ),
                },
                {
                    accessorKey: 'processingTimeMs',
                    header: 'Time (ms)',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('processingTimeMs') !== null && row.getValue('processingTimeMs') !== undefined
                                ? `${row.getValue('processingTimeMs')} ms`
                                : '—'}
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        case 'mosambee':
            return [
                {
                    accessorKey: 'createdAt',
                    header: 'Timestamp',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {new Date(row.getValue('createdAt')).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </div>
                    ),
                },
                {
                    accessorKey: 'txnId',
                    header: 'Transaction ID',
                    cell: ({ row }) => (
                        <div className="text-sm font-mono text-gray-900 truncate max-w-[150px]">
                            {row.getValue('txnId') || '—'}
                        </div>
                    ),
                },
                {
                    accessorKey: 'processStatus',
                    header: 'Status',
                    cell: ({ row }) => (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            row.getValue('processStatus') === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                            row.getValue('processStatus') === 'FAILED' ? 'bg-red-100 text-red-800' :
                            row.getValue('processStatus') === 'RECEIVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {row.getValue('processStatus') || '—'}
                        </span>
                    ),
                },
                {
                    accessorKey: 'retryCount',
                    header: 'Retries',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('retryCount') !== null && row.getValue('retryCount') !== undefined
                                ? row.getValue('retryCount')
                                : 0}
                        </div>
                    ),
                },
                {
                    accessorKey: 'processingTimeMs',
                    header: 'Time (ms)',
                    cell: ({ row }) => (
                        <div className="text-sm text-gray-900">
                            {row.getValue('processingTimeMs') !== null && row.getValue('processingTimeMs') !== undefined
                                ? `${row.getValue('processingTimeMs')} ms`
                                : '—'}
                        </div>
                    ),
                },
                {
                    id: 'actions',
                    header: 'Actions',
                    cell: ({ row }) => (
                        <button
                            onClick={() => openModal(row.original)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                        >
                            <Eye size={18} />
                        </button>
                    ),
                },
            ];

        default:
            return [];
    }
};