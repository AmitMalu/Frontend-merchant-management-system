// StatsCard.jsx
import React from 'react';

const StatsCard = ({ icon: Icon, iconColor, bgColor, label, value, prefix = '', suffix = '' }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className={`p-2 ${bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {prefix}{value}{suffix}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;