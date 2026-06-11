import React from 'react'
import InwardForCustomer from './InwardForCustomer';
import MerchantDistributionHistory from './MerchantDistributionHistory';

const ProductOutward = () => {

    const franchiseId = localStorage.getItem("franchiseId");
  return franchiseId != null ? <MerchantDistributionHistory />:<InwardForCustomer />
}

export default ProductOutward