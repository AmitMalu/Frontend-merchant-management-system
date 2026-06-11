import React, { useEffect } from 'react';
import { Navigate } from 'react-router';
import { toast } from 'react-toastify';

const ErrorPage = () => {
    useEffect(() => {
        toast.error(`The page you're looking for doesn't exist or has been moved.`, {
            position: 'top-center',
            autoClose: 3000
        })
    }, [])

    return <Navigate to="/dashboard" replace />
};

export default ErrorPage;