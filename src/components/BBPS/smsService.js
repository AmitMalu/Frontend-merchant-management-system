import axios from "axios";
import { toast } from "react-toastify";

/**
 * TEMPORARY frontend-only SMS notifications for BBPS.
 *
 * No SMS provider is wired up on the backend yet, so this calls Fast2SMS's
 * "Quick SMS" route (no DLT template approval needed) directly from the
 * browser. Every SMS is sent to a fixed test number rather than the actual
 * customer's mobile, per client instruction, until a real provider is
 * purchased and the integration moves server-side.
 *
 * VITE_FAST2SMS_API_KEY must be set (see .env.development / .env.production).
 * Note: any key placed here ships inside the public JS bundle — do not use a
 * paid/production Fast2SMS key for this temporary wiring.
 */

const FAST2SMS_API_KEY = import.meta.env.VITE_FAST2SMS_API_KEY;
const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";
const TEST_SMS_NUMBER = "9822090369";

const sendSms = async (message) => {
  if (!FAST2SMS_API_KEY) {
    console.warn("VITE_FAST2SMS_API_KEY is not set — skipping SMS send:", message);
    return;
  }
  try {
    const res = await axios.get(FAST2SMS_URL, {
      params: {
        authorization: FAST2SMS_API_KEY,
        message,
        language: "english",
        route: "q",
        numbers: TEST_SMS_NUMBER,
      },
    });

    // Fast2SMS returns HTTP 200 even on failure — the real result is in the body.
    console.log("Fast2SMS response:", res.data);
    if (res.data?.return !== true) {
      const reason = Array.isArray(res.data?.message) ? res.data.message.join(", ") : res.data?.message || "Unknown error";
      console.error("Fast2SMS rejected the SMS:", reason);
      toast.error(`SMS not sent: ${reason}`);
    }
  } catch (err) {
    console.error("Failed to send SMS:", err?.response?.data || err.message);
    toast.error("SMS request failed — see console for details");
  }
};

export const sendTransactionSuccessSms = ({
  amount,
  billerName,
  consumerNo,
  txnRefId,
  dateTime,
  paymentChannel,
}) => {
  const message =
    `Thank you for payment of Rs.${amount} against ${billerName}, ` +
    `Consumer no ${consumerNo}, B-connect Txn ID ${txnRefId} on ${dateTime} ` +
    `vide ${paymentChannel}.`;
  return sendSms(message);
};

export const sendComplaintRegisteredSms = ({ txnRefId, complaintId }) => {
  const message =
    `Your Complaint has been registered successfully for B-connect Txn ID ${txnRefId}. ` +
    `Your Complaint ID is ${complaintId}. You can track status of your complaint using your Complaint ID.`;
  return sendSms(message);
};
