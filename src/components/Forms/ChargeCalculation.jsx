import React, { useState } from 'react'
import DirectSettlementPage from '../Charge Settlement/DirectSettlementPage';
import FranchiseSettlementPage from '../Charge Settlement/FranchiseSettlementPage';


const ChargeCalculation = () => {
  const [customerType, setCustomerType] = useState('');

  return (

    <div className=''>
      <div className='bg-white p-4 rounded-lg shadow-sm  mb-2'>
        <h1 className="text-xl font-bold text-gray-900 mb-">Select Customer Type</h1>
        <select
          value={customerType}
          onChange={(e) => setCustomerType(e.target.value)}
          className=" px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value='' disabled>Select customerType</option>
          <option value="franchise">Franchise</option>
          <option value="direct">Direct Merchant</option>
        </select>
      </div>
      <div className=''>
        {customerType === "direct" && <DirectSettlementPage />}
        {customerType === "franchise" && <FranchiseSettlementPage />}
        {!customerType && (
          <p>Please select a cutomer type</p>
        )}
      </div>
    </div>
  )
}


export default ChargeCalculation

