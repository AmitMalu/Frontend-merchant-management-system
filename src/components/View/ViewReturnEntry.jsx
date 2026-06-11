import { CreditCard, X } from "lucide-react";

const DetailRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2">
      <span className="font-medium text-gray-600">{label}:</span>
      <span className="text-gray-900">{String(value)}</span>
    </div>
  );
};

const ViewReturnEntry = ({ returnData, onClose, isOpen }) => {
  if (!isOpen || !returnData) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Return Entry – #{returnData.returnNumber}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
{/* Franchise / Merchant Details */}
{(returnData.franchiseName || returnData.merchantName) && (
  <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      {returnData.franchiseName
        ? "Franchise Details"
        : "Merchant Details"}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
      {returnData.franchiseName ? (
        <>
          <DetailRow label="Franchise Name" value={returnData.franchiseName} />
         
        </>
      ) : (
        <>
          <DetailRow label="Merchant Name" value={returnData.merchantName} />
         
        </>
      )}
    </div>
  </div>
)}

          {/* Product Details */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Product Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
              <div>
                <DetailRow label="Product Code" value={returnData.productCode} />
                <DetailRow label="Product Name" value={returnData.productName} />
                <DetailRow label="Original Delivery #" value={returnData.originalDeliveryNumber} />
              </div>
              <div>
                <DetailRow label="Original Quantity" value={returnData.originalQuantity} />
                <DetailRow label="Returned Quantity" value={returnData.returnedQuantity} />
                <DetailRow label="Return Condition" value={returnData.returnCondition} />
              </div>
            </div>
          </div>

          {/* Return Information */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Return Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-20">
              <div>
                <DetailRow label="Return Date" value={returnData.returnDate} />
                <DetailRow label="Return Reason" value={returnData.returnReason} />
                <DetailRow label="Action Taken" value={returnData.actionTaken} />
              </div>
              <div>
                <DetailRow
                  label="Replacement Required"
                  value={returnData.isReplacementRequired ? "Yes" : "No"}
                />
                <DetailRow
                  label="Warranty Return"
                  value={returnData.isWarrantyReturn ? "Yes" : "No"}
                />
                <DetailRow label="Refund Amount" value={`₹${returnData.refundAmount || 0}`} />
              </div>
            </div>
          </div>

          {/* Serial Numbers */}
          {returnData.serialNumbers?.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Serial Numbers</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-100 text-left">
                    <tr>
                      <th className="p-2 border">TID</th>
                      <th className="p-2 border">SID</th>
                      <th className="p-2 border">MID</th>
                      <th className="p-2 border">VPAID</th>
                      <th className="p-2 border">Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnData.serialNumbers.map((s, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-2 border">{s.tid || "-"}</td>
                        <td className="p-2 border">{s.sid || "-"}</td>
                        <td className="p-2 border">{s.mid || "-"}</td>
                        <td className="p-2 border">{s.vpaid || "-"}</td>
                        <td className="p-2 border">{s.mobNumber || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Additional Information
            </h3>
            <DetailRow label="Received By" value={returnData.receivedBy} />
            <DetailRow label="Approved By" value={returnData.approvedBy} />
            <DetailRow label="Inspection Notes" value={returnData.inspectionNotes} />
            <DetailRow label="Remarks" value={returnData.remarks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReturnEntry;
