import React from 'react';

const shimmerBlock = 'bg-gray-200 animate-pulse rounded-md';

const FormShimmer = () => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-gray-600 to-gray-800 px-6 py-4 flex items-center justify-between rounded-t-xl">
                    <div className="space-y-2">
                        <div className={`${shimmerBlock} h-6 w-48`}></div>
                        <div className={`${shimmerBlock} h-4 w-64`}></div>
                    </div>
                    <div className={`${shimmerBlock} h-6 w-6 rounded-full`}></div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Section 1 */}
                    {[...Array(5)].map((_, sectionIndex) => (
                        <div
                            key={sectionIndex}
                            className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
                        >
                            <div className={`${shimmerBlock} h-5 w-1/5 mb-3`}></div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className={`${shimmerBlock} h-4 w-1/3`}></div>
                                        <div className={`${shimmerBlock} h-9 w-full`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Remarks Section */}
                    <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className={`${shimmerBlock} h-5 w-1/5 mb-3`}></div>
                        <div className={`${shimmerBlock} h-20 w-full`}></div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div className={`${shimmerBlock} h-9 w-24`}></div>
                    <div className={`${shimmerBlock} h-9 w-32`}></div>
                </div>
            </div>
        </div>
    );
};

export default FormShimmer;
