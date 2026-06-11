import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Eye, X, AlertCircle, Trash2, ChevronDown } from 'lucide-react';
import api from '../../constants/API/axiosInstance';
import { toast } from 'react-toastify';



// Priority columns for preview (from your original code)
const PRIORITY_HEADERS = [
  "Date", "Mode", "Amount", "Auth Code", "Card", "Card Type", "Brand Type",
  "Card Classification", "Merchant", "Category", "MID", "TID","EMI"
];

// Utility functions
function normalizeHeader(h) {
  return String(h).trim();
}

function deriveEmiFlag(row) {
  const labels = row["Labels"] || row["Txn Type"] || "";
  return /emi/i.test(labels) ? "Yes" : "No";
}

// File Upload Component
const FileUpload = ({ onFileSelect, selectedFile, error }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onFileSelect(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : error
              ? 'border-red-300 hover:border-red-400'
              : 'border-gray-300 hover:border-gray-400'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-600' : 'text-gray-600'}`} />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your Excel file here, or <span className="text-blue-600">browse</span>
              </p>
              <p className="text-sm text-gray-500">
                Supports .xlsx, .xls, and .csv files
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// File Preview Component
const FilePreview = ({ file }) => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePreview = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      // Normalize headers and add EMI data
      const normalized = jsonData.map((obj) => {
        const out = {};
        Object.keys(obj).forEach((k) => (out[normalizeHeader(k)] = obj[k]));
        // Add EMI flag to each row
        out["EMI"] = deriveEmiFlag(out);
        return out;
      });

      // Get only first 10 rows for preview
      const previewRows = normalized.slice(0, 10);

      if (previewRows.length === 0) {
        throw new Error('No data found in the file');
      }

      // Get all available headers from the first row
      const allHeaders = Object.keys(previewRows[0]);

      // Separate priority headers that exist in the data from other headers
      const availablePriorityHeaders = PRIORITY_HEADERS.filter(h => allHeaders.includes(h));
      const otherHeaders = allHeaders.filter(h => !PRIORITY_HEADERS.includes(h));

      // Combine priority headers first, then other headers
      const orderedHeaders = [...availablePriorityHeaders, ...otherHeaders];

      setPreviewData({
        headers: orderedHeaders,
        priorityHeaders: availablePriorityHeaders,
        rows: previewRows,
        totalRows: normalized.length
      });

    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to preview file. Please ensure it\'s a valid Excel file with data.');
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewData(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handlePreview}
          disabled={!file || loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span>{loading ? 'Loading...' : 'Preview File'}</span>
        </button>

        {previewData && (
          <button
            type="button"
            onClick={closePreview}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Close Preview</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Preview Error</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {previewData && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">File Preview</h3>
            <p className="text-sm text-gray-600">
              Showing first {previewData.rows.length} rows of {previewData.totalRows} total rows
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Priority columns shown first, followed by remaining columns
            </p>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {previewData.headers.map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${previewData.priorityHeaders.includes(header)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500'
                        }`}
                    >
                      {header}
                    </th>
                  ))}
                  
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {previewData.headers.map((header) => (
                      <td
                        key={header}
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                      >
                        {String(row[header] || '')}
                      </td>
                    ))}
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const TransactionUpload = () => {
  const [file, setFile] = useState(null);
  const [vendorId, setVendorId] = useState("");
  const [productId, setProductId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch vendors on component mount
  const fetchVendors = async () => {
    setLoadingVendors(true);
    try {
      const response = await api.get('/vendors/active');
      setVendors(response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      alert('Failed to load vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  // Fetch products when vendor is selected
  const fetchProducts = async (vendorId) => {
    setLoadingProducts(true);
    try {
      const response = await api.get(`/products/vendor/${vendorId}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load vendors on component mount
  React.useEffect(() => {
    fetchVendors();
  }, []);

  // Handle vendor selection
  const handleVendorChange = (e) => {
    const selectedVendorId = e.target.value;
    setVendorId(selectedVendorId);
    setProductId(""); // Reset product selection
    setProducts([]); // Clear products

    if (selectedVendorId) {
      fetchProducts(selectedVendorId);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!vendorId) {
      newErrors.vendor = "Please select a vendor";
    }

    if (!productId) {
      newErrors.product = "Please select a product";
    }

    if (!file) {
      newErrors.file = "Please select a file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploading(true);

    try {
      const formData = new FormData(); 
      
      formData.append("vendorId", vendorId);
      formData.append("productId", productId);
      formData.append("file", file);

      // Replace with your actual API endpoint
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.status === 200) {
        toast.success("File uploaded successfully!");
      }

      // Reset form
      setFile(null);
      setVendorId("");
      setProductId("");
      setProducts([]);
      setErrors({});

    } catch (error) {
      console.error("Upload error:", error);
      let backendMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error.message ||
      "Upload failed. Please try again.";

      // Simplify MySQL duplicate entry message
      if (backendMessage.includes("Duplicate entry")) {
      const match = backendMessage.match(/Duplicate entry '([^']+)'/);
      if (match) backendMessage = `Duplicate entry found: ${match[1]}`;
      else backendMessage = "Duplicate entry found.";
      }

      toast.error(backendMessage);
    } finally {
      setUploading(false);
    }
  };

  const selectedVendor = vendors.find(v => v.id === parseInt(vendorId));
  const selectedProduct = products.find(p => p.id === parseInt(productId));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Razorpay Transactions</h1>
          <p className="text-gray-600">Upload transaction data with vendor and product information</p>
        </div>

        <div className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vendor Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={vendorId}
                  onChange={handleVendorChange}
                  disabled={loadingVendors}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10 ${errors.vendor ? 'border-red-300' : 'border-gray-300'
                    } ${loadingVendors ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <option value="">
                    {loadingVendors ? 'Loading vendors...' : 'Select a vendor'}
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.vendor && (
                <p className="text-red-600 text-sm mt-1">{errors.vendor}</p>
              )}
            </div>

            {/* Product Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={!vendorId || loadingProducts}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none pr-10 ${errors.product ? 'border-red-300' : 'border-gray-300'
                    } ${(!vendorId || loadingProducts) ? 'bg-gray-100' : 'bg-white'}`}
                >
                  <option value="">
                    {!vendorId
                      ? 'Select vendor first'
                      : loadingProducts
                        ? 'Loading products...'
                        : 'Select a product'
                    }
                  </option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.productName}- {product.productCode}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.product && (
                <p className="text-red-600 text-sm mt-1">{errors.product}</p>
              )}
            </div>
          </div>

          {/* Selected Values Display */}
          {(selectedVendor || selectedProduct) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Selected Configuration</h3>
              <div className="text-sm text-blue-700">
                {selectedVendor && <p><strong>Vendor:</strong> {selectedVendor.name}</p>}
                {selectedProduct && <p><strong>Product:</strong> {selectedProduct.productName}-{selectedProduct.productCode}</p>}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction File <span className="text-red-500">*</span>
            </label>
            <FileUpload
              onFileSelect={setFile}
              selectedFile={file}
              error={errors.file}
            />
            {errors.file && (
              <p className="text-red-600 text-sm mt-1">{errors.file}</p>
            )}
          </div>

          {/* File Preview */}
          {file && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">File Preview</h3>
              <FilePreview file={file} />
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </span>
              ) : (
                'Upload File'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionUpload;