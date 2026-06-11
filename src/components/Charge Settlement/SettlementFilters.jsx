import React from 'react';

/**
 * Settlement filters component for cycle and product selection
 * Used in both direct and franchise settlement flows
 */
const SettlementFilters = ({
    cycleKey,
    setCycleKey,
    productId,
    setProductId,
    products = [],
    isLoading = false,
    onFiltersChange,
}) => {

    const handleCycleChange = (e) => {
        const newCycleKey = e.target.value;
        setCycleKey(newCycleKey);
        onFiltersChange?.(newCycleKey, productId);
    };

    const handleProductChange = (e) => {
        const newProductId = Number(e.target.value);
       // console.log(newProductId);
        setProductId(newProductId);
        onFiltersChange?.(cycleKey, newProductId);
    };

    return (
        <div className="  ">
            <h3 className=" font-medium text-gray-900 mb-4">Settlement Parameters</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cycle Key Selection */}
                <div>
                    <label htmlFor="cycleKey" className="block text-sm font-medium text-gray-700 mb-2">
                        Settlement Cycle
                    </label>
                    <select
                        id="cycleKey"
                        value={cycleKey}
                        onChange={handleCycleChange}
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Select Settlement Cycle</option>
                        <option value="T0">T0</option>
                        <option value="T1">T1</option>
                        <option value="T2">T2</option>
                        
                    </select>
                </div>

                {/* Product Selection */}
                <div>
                    <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
                        Product
                    </label>
                    <select
                        id="productId"
                        value={productId.toString()}
                        onChange={handleProductChange}
                        disabled={isLoading || !products.length}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                            <option key={product.productId} value={product.productId.toString()}>
                                {product.name || product.productName || `Product ${product.productId}`}
                            </option>
                        ))}
                    </select>
                    {!products.length && !isLoading && (
                        <p className="mt-1 text-sm text-gray-500">No products available</p>
                    )}
                </div>
            </div>

            {/* Validation Messages */}
            {(!cycleKey || !productId) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                        Please select both settlement cycle and product to continue.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SettlementFilters;