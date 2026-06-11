import React, { useState } from "react";
import api from "../../constants/API/axiosInstance";

const PrefundWalletForm = () => {
  const customerId = localStorage.getItem("customerId");
  const userType = localStorage.getItem("userType")?.toUpperCase();

  const [formData, setFormData] = useState({
    depositAmount: "",
    confirmAmount: "",
    depositeDate: "",
    paymentMode: "",
    tranxId: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankHolderName: "",
    narration: "",
    depositImage: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.depositAmount !== formData.confirmAmount) {
      setError("Amount and Confirm Amount must match.");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("requestedType", userType);
      data.append("requestedById", customerId);
      data.append("depositAmount", formData.depositAmount);
      data.append("depositeDate", formData.depositeDate);
      data.append("paymentMode", formData.paymentMode);
      data.append("tranxId", formData.tranxId);
      data.append("bankAccountName", formData.bankAccountName);
      data.append("bankAccountNumber", formData.bankAccountNumber);
      data.append("bankHolderName", formData.bankHolderName);
      data.append("narration", formData.narration);

      if (formData.depositImage) {
        data.append("depositImage", formData.depositImage);
      }

      await api.post("/prefund/request", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Show popup
      setShowPopup(true);

      // Clear form
      setFormData({
        depositAmount: "",
        confirmAmount: "",
        depositeDate: "",
        paymentMode: "",
        tranxId: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankHolderName: "",
        narration: "",
        depositImage: null,
      });

      // Reset file input manually
      const fileInput = document.querySelector('input[name="depositImage"]');
      if (fileInput) fileInput.value = "";

      // Auto close popup after 2 seconds
      setTimeout(() => {
        setShowPopup(false);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 relative">
      <h2 className="text-2xl font-semibold mb-6">Fund Request</h2>

      {error && <div className="text-red-600 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">

        <input
          type="text"
          name="tranxId"
          placeholder="Transaction ID"
          value={formData.tranxId}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="bankAccountName"
          placeholder="Bank Name"
          value={formData.bankAccountName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="bankAccountNumber"
          placeholder="Bank Account Number"
          value={formData.bankAccountNumber}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="bankHolderName"
          placeholder="Bank Holder Name"
          value={formData.bankHolderName}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          name="depositAmount"
          placeholder="Amount"
          value={formData.depositAmount}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="number"
          name="confirmAmount"
          placeholder="Confirm Amount"
          value={formData.confirmAmount}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          name="depositeDate"
          value={formData.depositeDate}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />

        <select
          name="paymentMode"
          value={formData.paymentMode}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Payment Mode</option>
          <option value="IMPS">IMPS</option>
          <option value="NEFT">NEFT</option>
          <option value="RTGS">RTGS</option>
          <option value="UPI">UPI</option>
        </select>

        <input
          type="file"
          name="depositImage"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <textarea
          name="narration"
          placeholder="Narration"
          value={formData.narration}
          onChange={handleChange}
          className="border p-2 rounded col-span-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="col-span-3 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              Fund request submitted successfully!
            </h3>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrefundWalletForm;
