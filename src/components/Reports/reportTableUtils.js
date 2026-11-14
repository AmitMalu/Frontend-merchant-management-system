import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const hasValue = (value) => value !== null && value !== undefined && value !== '';

/**
 * Which columns a paged report shows.
 *
 * The server leaves out fields that are empty, and the old code showed only the columns that had a
 * value on the CURRENT page. A page made only of payouts has no system fee / GST / card fields, so
 * those columns vanished on that page and came back on the next one.
 *
 * Here a column is shown when
 *   - it is in `alwaysShow` (the money columns that make up the report), or
 *   - the current page has a value for it, or
 *   - any page of this report had a value for it (it never goes away while paging).
 * Call `resetFields()` when a new report is generated or the filters change.
 */
export function useStableFields(transactions, alwaysShow = []) {
    const [seen, setSeen] = useState(() => new Set());

    useEffect(() => {
        if (!transactions || transactions.length === 0) {
            return;
        }
        setSeen((previous) => {
            const next = new Set(previous);
            transactions.forEach((txn) => {
                Object.keys(txn).forEach((key) => {
                    if (hasValue(txn[key])) {
                        next.add(key);
                    }
                });
            });
            return next.size === previous.size ? previous : next;
        });
    }, [transactions]);

    const resetFields = useCallback(() => setSeen(new Set()), []);

    const availableFields = useMemo(() => {
        const fields = new Set(seen);
        alwaysShow.forEach((key) => fields.add(key));
        (transactions || []).forEach((txn) => {
            Object.keys(txn).forEach((key) => {
                if (hasValue(txn[key])) {
                    fields.add(key);
                }
            });
        });
        return fields;
    }, [seen, transactions, alwaysShow]);

    return { availableFields, resetFields };
}

/**
 * Remembers which request is the latest, so a slow answer to an older click (for example a quick
 * double click on Next) can never overwrite the page the user asked for last.
 */
export function useLatestRequest() {
    const counter = useRef(0);
    return useMemo(() => ({
        begin: () => {
            counter.current += 1;
            return counter.current;
        },
        isLatest: (number) => number === counter.current,
    }), []);
}

/**
 * The message of a failed request. A failed Excel download comes back as a blob, so the server's
 * message is inside it: read it instead of showing a vague error.
 */
export async function exportErrorMessage(error, fallback) {
    try {
        const data = error?.response?.data;
        if (data instanceof Blob) {
            const text = await data.text();
            try {
                const json = JSON.parse(text);
                return json.message || json.error || fallback;
            } catch {
                return text && text.length < 300 ? text : fallback;
            }
        }
        return data?.message || fallback;
    } catch {
        return fallback;
    }
}
