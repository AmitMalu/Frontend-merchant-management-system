// Configuration for log tables and filters
export const tableOptions = [
    { value: 'requests', label: 'Request Logs' },
    { value: 'razorpay', label: 'Razorpay Notification Logs' },
    { value: 'vendor-responses', label: 'Vendor Response Logs' },
    { value: 'vendor-daily', label: 'Vendor Daily Logs' },
    { value: 'vendor-monthly', label: 'Vendor Monthly Logs' },
    { value: 'franchise-or-merchant-notification', label: 'Franchise Or Merchant Notification Logs'},
    { value: 'digilocker', label: 'Digilocker Logs' },
    { value: 'mosambee', label: 'Mosambee Notification Logs' },
];

export const filterOptions = {
    requests: [
        { value: 'all', label: 'All Requests', endpoint: '/admin-logs/requests' },
        { value: 'errors', label: 'Error Logs', endpoint: '/admin-logs/requests/errors' },
        { value: 'slow', label: 'Slow Requests (>2s)', endpoint: '/admin-logs/requests/slow' },
        { value: 'status-200', label: 'Success (200)', endpoint: '/admin-logs/requests/status/200' },
        { value: 'status-400', label: 'Bad Request (400)', endpoint: '/admin-logs/requests/status/400' },
        { value: 'status-401', label: 'Unauthorized (401)', endpoint: '/admin-logs/requests/status/401' },
        { value: 'status-403', label: 'Forbidden (403)', endpoint: '/admin-logs/requests/status/403' },
        { value: 'status-404', label: 'Not Found (404)', endpoint: '/admin-logs/requests/status/404' },
        { value: 'status-500', label: 'Server Error (500)', endpoint: '/admin-logs/requests/status/500' },
    ],
    razorpay: [
        { value: 'all', label: 'All Notifications', endpoint: '/admin-logs/razorpay' },
        { value: 'failed', label: 'Failed Notifications', endpoint: '/admin-logs/razorpay/failed' },
        { value: 'success', label: 'Success Status', endpoint: '/admin-logs/razorpay/status/SUCCESS' },
        { value: 'received', label: 'Received Status', endpoint: '/admin-logs/razorpay/status/RECEIVED' },
    ],
    'vendor-responses': [
        { value: 'all', label: 'All Responses', endpoint: '/admin-logs/vendor-responses' },
        { value: 'status-200', label: 'Success (200)', endpoint: '/admin-logs/vendor-responses/status/200' },
        { value: 'status-400', label: 'Bad Request (400)', endpoint: '/admin-logs/vendor-responses/status/400' },
        { value: 'status-500', label: 'Server Error (500)', endpoint: '/admin-logs/vendor-responses/status/500' },
    ],
    'vendor-daily': [
        { value: 'all', label: 'All Daily Logs', endpoint: '/admin-logs/vendor-daily' },
    ],
    'vendor-monthly': [
        { value: 'all', label: 'All Monthly Logs', endpoint: '/admin-logs/vendor-monthly' },
    ],
    'franchise-or-merchant-notification' : [
        { value: 'all', label: 'All Notification Logs', endpoint: '/admin-logs/franchise-or-merchant-notification', status: 'all'},
        { value: 'false', label: 'Failed Notifications Logs', endpoint: '/admin-logs/franchise-or-merchant-notification', status: 'false'},
        { value: 'true', label: 'Success Notification Logs', endpoint: '/admin-logs/franchise-or-merchant-notification', status: 'true'},
    ],
    digilocker: [
        { value: 'all', label: 'All Digilocker Logs', endpoint: '/admin-logs/digilocker', status: 'all' },
        { value: 'success', label: 'Success Logs', endpoint: '/admin-logs/digilocker', status: 'SUCCESS' },
        { value: 'failed', label: 'Failed Logs', endpoint: '/admin-logs/digilocker', status: 'FAILED' },
    ],
    mosambee: [
        { value: 'all', label: 'All Notifications', endpoint: '/admin-logs/mosambee', status: 'all' },
        { value: 'success', label: 'Success Status', endpoint: '/admin-logs/mosambee', status: 'SUCCESS' },
        { value: 'failed', label: 'Failed Status', endpoint: '/admin-logs/mosambee', status: 'FAILED' },
        { value: 'received', label: 'Received Status', endpoint: '/admin-logs/mosambee', status: 'RECEIVED' },
    ],
};