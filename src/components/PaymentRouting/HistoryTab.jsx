import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { errorMessage, getAudit } from "./routingApi";

const SIZE = 20;

/** Who changed which routing, and when. */
const HistoryTab = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData((await getAudit(null, page, SIZE)) || { content: [], totalPages: 0, totalElements: 0 });
    } catch (err) {
      toast.error(errorMessage(err, "Could not load the history"));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">What</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : data.content.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No changes recorded yet.</td>
              </tr>
            ) : (
              data.content.map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{new Date(a.at).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-gray-700">{a.actor}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">{a.action.replaceAll("_", " ")}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{a.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
        <span>
          Page {data.totalPages === 0 ? 0 : page + 1} of {data.totalPages} · {data.totalElements} change(s)
        </span>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-40">
            Previous
          </button>
          <button onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= data.totalPages || loading} className="rounded border px-3 py-1 hover:bg-gray-50 disabled:opacity-40">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;
