import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';

// Static constants outside component for performance
const SERIAL_FIELDS = ['MID', 'SID', 'TID', 'VpID'];
const ITEM_HEIGHT = 120;

// Memoized GridRow component to prevent unnecessary re-renders
const GridRow = memo(({
    row,
    serialFields,
    onFieldChange,
    onSelectionChange,
    isEvenRow
}) => {
    // Memoize individual handlers to prevent child re-renders
    const handleFieldChange = useCallback((field, value) => {
        onFieldChange(row.id, field, value);
    }, [row.id, onFieldChange]);

    const handleSelectionChange = useCallback((field, checked) => {
        onSelectionChange(row.id, field, checked);
    }, [row.id, onSelectionChange]);

    return (
        <tr className={isEvenRow ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-3 py-3 text-sm font-medium text-gray-900 border-b">
                {row.id}
            </td>
            {serialFields.map(field => (
                <GridCell
                    key={field}
                    field={field}
                    value={row[field]}
                    isSelected={row.selectedFields[field]}
                    onFieldChange={handleFieldChange}
                    onSelectionChange={handleSelectionChange}
                />
            ))}
        </tr>
    );
});

// Memoized GridCell component for even more granular optimization
const GridCell = memo(({
    field,
    value,
    isSelected,
    onFieldChange,
    onSelectionChange
}) => {
    const handleInputChange = useCallback((e) => {
        onFieldChange(field, e.target.value);
    }, [field, onFieldChange]);

    const handleCheckboxChange = useCallback((e) => {
        onSelectionChange(field, e.target.checked);
    }, [field, onSelectionChange]);

    return (
        <td className="px-3 py-3 border-b">
            <div className="space-y-2">
                <label className="flex items-center justify-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        className="rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-xs text-gray-600">Include</span>
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    disabled={!isSelected}
                    className={`w-full px-2 py-2 border rounded text-sm ${!isSelected
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-white text-gray-900 border-gray-300'
                        }`}
                    placeholder={isSelected ? `Enter ${field}` : 'Disabled'}
                />
            </div>
        </td>
    );
});

// Main SerialNumberGrid component with all optimizations applied
const SerialNumberGrid = ({ quantity, onGridChange, initialData = [] }) => {
    const [serialGrid, setSerialGrid] = useState([]);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Memoized serialFields to prevent array recreation on every render
    const serialFields = useMemo(() => SERIAL_FIELDS, []);

    // Debounced parent notification to reduce excessive updates
    const notifyParent = useMemo(
        () => debounce((gridData) => {
            onGridChange?.(gridData);
        }, 300),
        [onGridChange]
    );

    // Initialize grid helper creation with memoization
    const initializeGrid = useCallback((qty, initial = []) => {
        const quantity = parseInt(qty) || 0;
        if (quantity <= 0) return [];

        const gridData = [];

        for (let i = 0; i < quantity; i++) {
            const initialRow = initial[i] || {};
            gridData.push({
                id: i + 1,
                MID: initialRow.mid || initialRow.MID || '',
                SID: initialRow.sid || initialRow.SID || '',
                TID: initialRow.tid || initialRow.TID || '',
                VpID: initialRow.vpaid || initialRow.VpID || '',
                selectedFields: {
                    MID: !!(initialRow.mid || initialRow.MID),
                    SID: !!(initialRow.sid || initialRow.SID),
                    TID: !!(initialRow.tid || initialRow.TID),
                    VpID: !!(initialRow.vpaid || initialRow.VpID),
                },
            });
        }

        return gridData;
    }, []);

    // Initialize grid and notify parent with immediate effect
    useEffect(() => {
        const initialGrid = initializeGrid(quantity, initialData);
        setSerialGrid(initialGrid);

        // Immediate notification for initial state (no debounce)
        onGridChange?.(initialGrid);
    }, [quantity]);

    // Optimized update grid function with debounced parent notification
    const updateGrid = useCallback((updater) => {
        setSerialGrid(prevGrid => {
            const newGrid = typeof updater === 'function' ? updater(prevGrid) : updater;

            // Use debounced notification to prevent excessive parent updates
            notifyParent(newGrid);

            return newGrid;
        });
    }, [notifyParent]);

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            notifyParent.cancel();
        };
    }, [notifyParent]);

    // Optimized handlers with debounced updates
    const handleSerialNumberChange = useCallback((rowId, field, value) => {
        updateGrid(prevGrid =>
            prevGrid.map(row =>
                row.id === rowId ? { ...row, [field]: value } : row
            )
        );
    }, [updateGrid]);

    const handleFieldSelection = useCallback((rowId, field, checked) => {
        updateGrid(prevGrid =>
            prevGrid.map(row =>
                row.id === rowId
                    ? { ...row, selectedFields: { ...row.selectedFields, [field]: checked } }
                    : row
            )
        );
    }, [updateGrid]);

    const handleSelectAllForField = useCallback((field) => {
        updateGrid(prevGrid =>
            prevGrid.map(row => ({
                ...row,
                selectedFields: { ...row.selectedFields, [field]: true }
            }))
        );
    }, [updateGrid]);

    const handleDeselectAllForField = useCallback((field) => {
        updateGrid(prevGrid =>
            prevGrid.map(row => ({
                ...row,
                selectedFields: { ...row.selectedFields, [field]: false }
            }))
        );
    }, [updateGrid]);

    const handleClearAllForField = useCallback((field) => {
        updateGrid(prevGrid =>
            prevGrid.map(row => ({
                ...row,
                selectedFields: { ...row.selectedFields, [field]: false },
                [field]: ''
            }))
        );
    }, [updateGrid]);

    // Excel upload with error handling and processing state
    const handleExcelUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            console.error('File too large. Max 5MB.');
            return;
        }

        setIsProcessing(true);

        try {
            const data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(new Uint8Array(e.target.result));
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });

            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) {
                console.info('Excel file needs header and data rows');
                return;
            }

            const dataRows = jsonData.slice(1);

            // Update grid with Excel data using optimized approach
            updateGrid(currentGrid => {
                return currentGrid.map((row, index) => {
                    if (index < dataRows.length && dataRows[index]) {
                        const [mid = '', sid = '', tid = '', vpid = ''] = dataRows[index];
                        return {
                            ...row,
                            MID: String(mid).trim(),
                            SID: String(sid).trim(),
                            TID: String(tid).trim(),
                            VpID: String(vpid).trim(),
                            selectedFields: {
                                MID: !!String(mid).trim(),
                                SID: !!String(sid).trim(),
                                TID: !!String(tid).trim(),
                                VpID: !!String(vpid).trim()
                            }
                        };
                    }
                    return row;
                });
            });

            setUploadModalOpen(false);
            console.log('Successfully uploaded data!');

        } catch (error) {
            console.error('Upload error:', error);
            console.error('Error reading Excel file');
        } finally {
            setIsProcessing(false);
            event.target.value = '';
        }
    }, [updateGrid]);

    // Generate sample Excel with memoization
    const generateSampleExcel = useCallback(() => {
        try {
            const sampleData = [
                ['MID', 'SID', 'TID', 'VpID'],
                ['MID000001', 'SID000001', 'TID000001', 'VPA000001'],
                ['MID000002', 'SID000002', 'TID000002', 'VPA000002'],
                ['MID000003', 'SID000003', 'TID000003', 'VPA000003'],
                ['MID000004', 'SID000004', 'TID000004', 'VPA000004'],
                ['MID000005', 'SID000005', 'TID000005', 'VPA000005'],
                ['MID000006', 'SID000006', 'TID000006', 'VPA000006'],
                ['MID000007', 'SID000007', 'TID000007', 'VPA000007'],
                ['MID000008', 'SID000008', 'TID000008', 'VPA000008']
            ];

            const ws = XLSX.utils.aoa_to_sheet(sampleData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Sample');
            XLSX.writeFile(wb, 'serial_template_sample.xlsx');

            console.info('Sample template downloaded!');
        } catch (error) {
            console.error('Error generating template');
        }
    }, []);

    // Early return for empty grid
    if (serialGrid.length === 0) {
        return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Enter a quantity to configure serial numbers</p>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Serial Numbers Configuration ({serialGrid.length} items)
            </label>

            {/* Action Buttons */}
            <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-2">
                    {serialFields.map(field => (
                        <div key={field} className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => handleSelectAllForField(field)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                                ✓ All {field}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeselectAllForField(field)}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                ✗ All {field}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleClearAllForField(field)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                                Clear {field}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 items-center flex-wrap">
                    <button
                        type="button"
                        onClick={() => setUploadModalOpen(true)}
                        className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center gap-2"
                        disabled={isProcessing}
                    >
                        {isProcessing ? '⏳ Processing...' : '📤 Upload Excel'}
                    </button>

                    <button
                        type="button"
                        onClick={generateSampleExcel}
                        className="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 flex items-center gap-2"
                    >
                        📥 Download Sample
                    </button>

                    <div className="text-sm text-gray-600">
                        Format: MID | SID | TID | VpID
                    </div>
                </div>
            </div>

            {/* Optimized Serial Number Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase border-b">
                                    Item #
                                </th>
                                {serialFields.map(field => (
                                    <th key={field} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase border-b">
                                        {field}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {serialGrid.map((row, index) => (
                                <GridRow
                                    key={row.id}
                                    row={row}
                                    serialFields={serialFields}
                                    onFieldChange={handleSerialNumberChange}
                                    onSelectionChange={handleFieldSelection}
                                    isEvenRow={index % 2 === 0}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Upload Serial Numbers</h3>
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isProcessing}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Excel File (.xlsx, .xls)
                                </label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleExcelUpload}
                                    disabled={isProcessing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {isProcessing && (
                                    <div className="mt-2 text-sm text-blue-600">
                                        ⏳ Processing Excel file...
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 p-3 rounded">
                                <h4 className="font-medium text-blue-900 mb-1">Format:</h4>
                                <p className="text-sm text-blue-800">
                                    First row: <strong>MID | SID | TID | VpID</strong><br />
                                    Each row = one item. Leave cells empty to skip that field.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setUploadModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Set display names for debugging
GridRow.displayName = 'GridRow';
GridCell.displayName = 'GridCell';
SerialNumberGrid.displayName = 'SerialNumberGrid';

export default SerialNumberGrid;