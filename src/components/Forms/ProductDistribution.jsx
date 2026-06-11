import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Search, Download } from 'lucide-react';
import distributionApi from "../../constants/API/distributionsAPI";
import { toast } from 'react-toastify';

const ProductDistribution = ({ onSuccess }) => {
  const userType = localStorage.getItem("userType")?.toLowerCase();
  const customerId = localStorage.getItem("customerId");

  const [loading, setLoading] = useState({
    franchises: false,
    products: false,
    merchants: false,
    devices: false,
    submitting: false
  });

  const [data, setData] = useState({
    franchises: [],
    products: [],
    merchants: [],
    devices: []
  });

  const [formData, setFormData] = useState({
    franchise: userType === 'franchise' ? customerId || '' : '',
    product: '',
    quantity: '',
    merchant: ''
  });

  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [errors, setErrors] = useState({});
  const [devicesFetched, setDevicesFetched] = useState(false);

  useEffect(() => {
    if (userType === 'admin' || userType === 'super_admin') {
      loadFranchises();
    } else if (userType === 'franchise' && customerId) {
      loadFranchiseData(customerId);
    }
  }, [userType, customerId]);

  useEffect(() => {
    if (formData.franchise && formData.franchise !== customerId) {
      loadFranchiseData(formData.franchise);
    }
  }, [formData.franchise]);

  useEffect(() => {
    setData(prev => ({ ...prev, devices: [] }));
    setSelectedDevices([]);
    setDevicesFetched(false);
  }, [formData.product, formData.quantity]);

  const loadFranchises = async () => {
    setLoading(prev => ({ ...prev, franchises: true }));
    try {
      const franchises = await distributionApi.getAllFranchises();
      setData(prev => ({ ...prev, franchises: franchises || [] }));
    } catch (error) {
      console.error('Load franchises error:', error);
      toast.error('Failed to load franchises');
    } finally {
      setLoading(prev => ({ ...prev, franchises: false }));
    }
  };

  const loadFranchiseData = async (franchiseId) => {
    setLoading(prev => ({ ...prev, products: true, merchants: true }));
    try {
      const [products, merchants] = await Promise.all([
        distributionApi.getFranchiseProducts(franchiseId),
        distributionApi.getMerchantsByFranchise(franchiseId)
      ]);
      setData(prev => ({
        ...prev,
        products: products || [],
        merchants: merchants || []
      }));

      setFormData(prev => ({ ...prev, product: '', quantity: '', merchant: '' }));
      setSelectedDevices([]);
      setDevicesFetched(false);
    } catch (error) {
      console.error('Load franchise data error:', error);
      toast.error('Failed to load franchise data');
    } finally {
      setLoading(prev => ({ ...prev, products: false, merchants: false }));
    }
  };

  const loadDevices = async () => {
    if (!formData.product) return;

    const franchiseId = userType === 'franchise' ? customerId : formData.franchise;
    if (!franchiseId) return;

    setLoading(prev => ({ ...prev, devices: true }));
    try {
      const selectedProduct = data.products.find(p => p.productId.toString() === formData.product);
      if (selectedProduct) {
        const devices = await distributionApi.getSerialNumbersToDispatch(selectedProduct.productId, franchiseId);
        setData(prev => ({ ...prev, devices: devices || [] }));
        setSelectedDevices([]);
        setDevicesFetched(true);
      }
    } catch (error) {
      console.error('Load devices error:', error);
      toast.error('Failed to load devices');
    } finally {
      setLoading(prev => ({ ...prev, devices: false }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'quantity') {
      const selectedProduct = data.products.find(p => p.productId.toString() === formData.product);
      if (selectedProduct && parseInt(value) > selectedProduct.valid) {
        setErrors(prev => ({
          ...prev,
          quantity: `Quantity cannot exceed available stock (${selectedProduct.valid})`
        }));
      }
    }
  };

  const handleDeviceToggle = (deviceId) => {
    const quantity = parseInt(formData.quantity);
    setSelectedDevices(prev => {
      const isSelected = prev.includes(deviceId);
      if (isSelected) {
        return prev.filter(id => id !== deviceId);
      } else if (prev.length < quantity) {
        return [...prev, deviceId];
      }
      return prev;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if ((userType === 'admin' || userType === 'super_admin') && !formData.franchise) {
      newErrors.franchise = 'Please select a franchise';
    }
    if (!formData.product) {
      newErrors.product = 'Please select a product';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    } else {
      const selectedProduct = data.products.find(p => p.productId.toString() === formData.product);
      if (selectedProduct && parseInt(formData.quantity) > selectedProduct.valid) {
        newErrors.quantity = `Quantity cannot exceed available stock (${selectedProduct.valid})`;
      }
    }
    if (!formData.merchant) {
      newErrors.merchant = 'Please select a merchant';
    }
    if (devicesFetched && selectedDevices.length !== parseInt(formData.quantity)) {
      newErrors.devices = `Please select exactly ${formData.quantity} devices`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(prev => ({ ...prev, submitting: true }));
    try {
      const franchiseId = userType === 'franchise' ? customerId : formData.franchise;
      const distributionData = {
        franchiseId: franchiseId,
        merchantId: formData.merchant,
        selectedDeviceIds: selectedDevices,
        quantity: parseInt(formData.quantity)
      };

      await distributionApi.submitDistribution(distributionData);
      toast.success('Products distributed successfully!');

      setFormData({
        franchise: userType === 'franchise' ? customerId || '' : '',
        product: '',
        quantity: '',
        merchant: ''
      });
      setSelectedDevices([]);
      setData(prev => ({ ...prev, devices: [] }));
      setDevicesFetched(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Distribution error:', error);
      toast.error(error?.message || 'Failed to distribute products');
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const canFetchDevices = () => {
    const franchiseId = userType === 'franchise' ? customerId : formData.franchise;
    return formData.product &&
      formData.quantity &&
      parseInt(formData.quantity) > 0 &&
      !errors.quantity &&
      franchiseId;
  };

  const isFormValid = () => {
    const franchiseId = userType === 'franchise' ? customerId : formData.franchise;
    return franchiseId &&
      formData.product &&
      formData.quantity &&
      parseInt(formData.quantity) > 0 &&
      formData.merchant &&
      devicesFetched &&
      selectedDevices.length === parseInt(formData.quantity) &&
      !Object.values(errors).some(error => error);
  };

  const filteredDevices = data.devices.filter(device =>
    !deviceSearch ||
    (device.sid && device.sid.toLowerCase().includes(deviceSearch.toLowerCase())) ||
    (device.mid && device.mid.toLowerCase().includes(deviceSearch.toLowerCase())) ||
    (device.tid && device.tid.toLowerCase().includes(deviceSearch.toLowerCase()))
  );

  const selectedProduct = data.products.find(p => p?.productId?.toString() === formData.product);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Distribution</h1>
            <p className="text-gray-600">
              {userType === 'admin' || userType === 'super_admin'
                ? 'Distribute products to franchise merchants'
                : 'Distribute products to merchants'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(userType === 'admin' || userType === 'super_admin') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Franchise <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.franchise}
                onChange={(e) => handleInputChange('franchise', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading.franchises}
              >
                <option value="">{loading.franchises ? 'Loading...' : 'Select Franchise'}</option>
                {data.franchises.map(franchise => (
                  <option key={franchise.id} value={franchise.id}>
                    {franchise.franchiseName}
                  </option>
                ))}
              </select>
              {errors.franchise && <p className="text-red-600 text-sm mt-1">{errors.franchise}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.product}
              onChange={(e) => handleInputChange('product', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading.products || ((userType === 'admin' || userType === 'super_admin') && !formData.franchise)}
            >
              <option value="">{loading.products ? 'Loading...' : 'Select Product'}</option>
              {data.products.map(product => (
                <option key={product.productId} value={product.productId}>
                  {product.productName} (Available: {product.valid})
                </option>
              ))}
            </select>
            {errors.product && <p className="text-red-600 text-sm mt-1">{errors.product}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct?.valid || 999}
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quantity"
              disabled={!formData.product}
            />
            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            {selectedProduct && (
              <p className="text-sm text-gray-500 mt-1">Available: {selectedProduct.valid}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.merchant}
              onChange={(e) => handleInputChange('merchant', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={loading.merchants || ((userType === 'admin' || userType === 'super_admin') && !formData.franchise)}
            >
              <option value="">{loading.merchants ? 'Loading...' : 'Select Merchant'}</option>
              {data.merchants.map(merchant => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.businessName} - {merchant.contactPersonEmail}
                </option>
              ))}
            </select>
            {errors.merchant && <p className="text-red-600 text-sm mt-1">{errors.merchant}</p>}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={loadDevices}
            disabled={!canFetchDevices() || loading.devices}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.devices ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{loading.devices ? 'Fetching...' : 'Fetch Available Devices'}</span>
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Select product and enter valid quantity first to fetch devices
          </p>
        </div>
      </div>

      {devicesFetched && data.devices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Select Devices ({selectedDevices.length}/{formData.quantity})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search devices..."
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredDevices.map(device => (
              <div
                key={device.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedDevices.includes(device.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  } ${!selectedDevices.includes(device.id) && selectedDevices.length >= parseInt(formData.quantity)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }`}
                onClick={() => handleDeviceToggle(device.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {device.sid && <div className="text-sm font-medium text-gray-900">SID: {device.sid}</div>}
                    {device.mid && <div className="text-sm text-gray-600">MID: {device.mid}</div>}
                    {device.tid && <div className="text-sm text-gray-600">TID: {device.tid}</div>}
                    {device.vpaid && <div className="text-sm text-gray-600">VPA: {device.vpaid}</div>}
                  </div>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${selectedDevices.includes(device.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                    }`}>
                    {selectedDevices.includes(device.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {errors.devices && <p className="text-red-600 text-sm mt-4">{errors.devices}</p>}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid() || loading.submitting}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          <span>{loading.submitting ? 'Distributing...' : 'Distribute Products'}</span>
        </button>
        {!isFormValid() && !loading.submitting && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Complete all fields and select devices to distribute products
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDistribution;