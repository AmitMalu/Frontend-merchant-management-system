// import React from 'react';
// import { FileText, FileSpreadsheet } from 'lucide-react';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const UniversalExportButtons = ({
//     data,
//     filename = 'report',
//     title = 'Report',
//     columns,
//     excelTransform,
//     pdfTransform
// }) => {
//     const exportToExcel = () => {
//         // Use custom transform if provided, otherwise use data as-is
//         const transformedData = excelTransform ? excelTransform(data) : data;

//         const worksheet = XLSX.utils.json_to_sheet(transformedData);

//         // Style the header row
//         const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
//         for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
//             const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
//             if (worksheet[cellAddress]) {
//                 worksheet[cellAddress].s = {
//                     font: { bold: true, color: { rgb: "FFFFFF" } },
//                     fill: { fgColor: { rgb: "4F46E5" } },
//                     alignment: { horizontal: "center" }
//                 };
//             }
//         }

//         // Set column widths based on columns config or default
//         if (columns && columns.widths) {
//             worksheet['!cols'] = columns.widths.map(width => ({ width }));
//         }

//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, title);
//         XLSX.writeFile(workbook, `${filename}.xlsx`);
//     };

//     const exportToPDF = () => {
//         const doc = new jsPDF();
    

//         // Add title
//         doc.setFontSize(20);
//         doc.setTextColor(79, 70, 229);
//         doc.text(title, 20, 20);

//         // Add timestamp
//         doc.setFontSize(10);
//         doc.setTextColor(100);
//         doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

//         // Use custom transform if provided, otherwise use data as-is
//         const transformedData = pdfTransform ? pdfTransform(data) : data;

//         // Convert data to table format
//         const tableData = transformedData.map(item =>
//             columns.headers.map(header => {
//                 const key = columns.keys[columns.headers.indexOf(header)];
//                 return String(item[key] || '');
//             })
//         );

//         // Add table
//         autoTable(doc, {
//             head: [columns.headers],
//             body: tableData,
//             startY: 40,
//             theme: 'striped',
//             headStyles: {
//                 fillColor: [79, 70, 229],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 12
//             },
//             bodyStyles: {
//                 fontSize: 10
//             },
//             alternateRowStyles: {
//                 fillColor: [248, 250, 252]
//             },
//             columnStyles: columns.styles || {},
//             margin: { top: 40, left: 20, right: 20 }
//         });

//         doc.save(`${filename}.pdf`);
//     };

//     return (
//         <div className="flex gap-3">
//             <button
//                 onClick={exportToExcel}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
//             >
//                 <FileSpreadsheet className="w-4 h-4" />
//                 Export Excel
//             </button>
//             <button
//                 onClick={exportToPDF}
//                 className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
//             >
//                 <FileText className="w-4 h-4" />
//                 Export PDF
//             </button>
//         </div>
//     );
// };

// export default UniversalExportButtons;


import React from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


const UniversalExportButtons = ({
    data,
    filename = 'report',
    title = 'Report',
    columns,
    excelTransform,
    pdfTransform,
    summary,
    summaryConfig
}) => {
    // In UniversalExportButtons.jsx - Update the Excel export function
const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Create main data worksheet
    const transformedData = excelTransform ? excelTransform(data) : data;
    const worksheet = XLSX.utils.json_to_sheet(transformedData);

    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "6366F1" } },
                alignment: { horizontal: "center" }
            };
        }
    }

    // Set column widths
    if (columns && columns.widths) {
        worksheet['!cols'] = columns.widths.map(width => ({ width }));
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transaction Data');

    // Add summary sheet if summary exists
    if (summary && summaryConfig) {
        console.log('Summary data for Excel:', summary);
        console.log('Summary config:', summaryConfig);
        
        const summaryData = [];

        // Use summaryConfig to build the summary data
        summaryConfig.forEach(config => {
            const value = summary[config.key];
            console.log(`Processing ${config.key}: ${value}`);
            
            if (value !== undefined && value !== null) {
                const formattedValue = config.formatter ? config.formatter(value) : value;
                summaryData.push({
                    'Metric': config.label,
                    'Value': formattedValue
                });
            }
        });

        console.log('Final summary data:', summaryData);

        if (summaryData.length > 0) {
            const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);

            // Style summary sheet headers
            summaryWorksheet['A1'].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "059669" } },
                alignment: { horizontal: "center" }
            };
            summaryWorksheet['B1'].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "059669" } },
                alignment: { horizontal: "center" }
            };

            summaryWorksheet['!cols'] = [{ width: 30 }, { width: 20 }];
            XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        } else {
            console.log('No summary data to export');
        }
    } else if (summary) {
        // Fallback - auto-detect summary fields
        console.log('Using fallback summary detection');
        const summaryData = [];
        
        Object.entries(summary).forEach(([key, value]) => {
            if (typeof value === 'number' || typeof value === 'string') {
                // Skip the conditionBreakdown object
                if (key !== 'conditionBreakdown') {
                    summaryData.push({
                        'Metric': key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                        'Value': typeof value === 'number' ? value.toLocaleString() : value
                    });
                }
            }
        });

        if (summaryData.length > 0) {
            const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
            summaryWorksheet['!cols'] = [{ width: 30 }, { width: 20 }];
            XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
        }
    }

    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

    const exportToPDF = () => {
        // Use landscape orientation for better column handling
        const doc = new jsPDF('landscape', 'mm', 'a4');

        // Modern color scheme - using indigo/slate tones
        const primaryColor = [99, 102, 241]; // Indigo-500
        const secondaryColor = [71, 85, 105]; // Slate-600
        const lightGray = [248, 250, 252]; // Slate-50
        const mediumGray = [156, 163, 175]; // Gray-400

        // Add title with modern styling
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(title, 20, 25);

        // Add subtitle line
        doc.setLineWidth(0.5);
        doc.setDrawColor(...primaryColor);
        doc.line(20, 30, 270, 30);

        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(...mediumGray);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 38);

        // Add summary section if provided
        let startY = 50;
        if (summary && summaryConfig) {
            doc.setFontSize(14);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Summary', 20, startY);

            const summaryData = [];

            // Use summaryConfig to dynamically build summary data
            summaryConfig.forEach(config => {
                if (summary[config.key] !== undefined && summary[config.key] !== null) {
                    const value = config.formatter
                        ? config.formatter(summary[config.key])
                        : summary[config.key].toLocaleString();
                    summaryData.push([config.label, value]);
                }
            });

            if (summaryData.length > 0) {
                autoTable(doc, {
                    body: summaryData,
                    startY: startY + 5,
                    theme: 'plain',
                    styles: {
                        fontSize: 9,
                        cellPadding: { top: 2, right: 8, bottom: 2, left: 0 },
                    },
                    columnStyles: {
                        0: {
                            fontStyle: 'bold',
                            textColor: secondaryColor,
                            cellWidth: 40
                        },
                        1: {
                            textColor: [17, 24, 39], // Gray-900
                            cellWidth: 40
                        }
                    },
                    margin: { left: 20 },
                    tableWidth: 'wrap'
                });
                startY = doc.lastAutoTable.finalY + 15;
            } else {
                startY += 10;
            }
        } else if (summary) {
            // Fallback for backward compatibility - auto-detect common summary fields
            doc.setFontSize(14);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('Summary', 20, startY);

            const summaryData = [];
            const commonFields = [
                { key: 'total', label: 'Total', formatter: (val) => val.toLocaleString() },
                { key: 'totalCount', label: 'Total Count', formatter: (val) => val.toLocaleString() },
                { key: 'totalTransactions', label: 'Total Transactions', formatter: (val) => val.toLocaleString() },
                { key: 'totalAmount', label: 'Total Amount', formatter: (val) => `₹${val.toLocaleString()}` },
                { key: 'totalNetAmount', label: 'Net Amount', formatter: (val) => `₹${val.toLocaleString()}` },
                { key: 'totalCommission', label: 'Total Commission', formatter: (val) => `₹${val.toLocaleString()}` },
                { key: 'totalCharges', label: 'Total Charges', formatter: (val) => `₹${val.toLocaleString()}` },
                { key: 'successRate', label: 'Success Rate', formatter: (val) => `${val}%` },
                { key: 'averageAmount', label: 'Average Amount', formatter: (val) => `₹${val.toLocaleString()}` }
            ];

            commonFields.forEach(field => {
                if (summary[field.key] !== undefined && summary[field.key] !== null) {
                    summaryData.push([field.label, field.formatter(summary[field.key])]);
                }
            });

            if (summaryData.length > 0) {
                autoTable(doc, {
                    body: summaryData,
                    startY: startY + 5,
                    theme: 'plain',
                    styles: {
                        fontSize: 9,
                        cellPadding: { top: 2, right: 8, bottom: 2, left: 0 },
                    },
                    columnStyles: {
                        0: {
                            fontStyle: 'bold',
                            textColor: secondaryColor,
                            cellWidth: 40
                        },
                        1: {
                            textColor: [17, 24, 39],
                            cellWidth: 40
                        }
                    },
                    margin: { left: 20 },
                    tableWidth: 'wrap'
                });
                startY = doc.lastAutoTable.finalY + 15;
            } else {
                startY += 10;
            }
        }

        // Use custom transform if provided, otherwise use data as-is
        const transformedData = pdfTransform ? pdfTransform(data) : data;

        // Convert data to table format
        const tableData = transformedData.map(item =>
            columns.headers.map(header => {
                const key = columns.keys[columns.headers.indexOf(header)];
                const value = item[key] || '';
                // Truncate long text to prevent column overflow
                return String(value).length > 25 ? String(value).substring(0, 25) + '...' : String(value);
            })
        );

        // Calculate dynamic column widths based on content
        const pageWidth = 297 - 40; // A4 landscape minus margins
        const totalCols = columns.headers.length;
        const baseWidth = pageWidth / totalCols;

        // Create balanced column styles
        const dynamicColumnStyles = {};
        columns.headers.forEach((header, index) => {
            dynamicColumnStyles[index] = {
                cellWidth: baseWidth,
                fontSize: 8,
                cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                overflow: 'linebreak',
                // Apply custom styles if provided
                ...(columns.styles && columns.styles[index] ? {
                    halign: columns.styles[index].halign || 'left'
                } : {})
            };
        });

        // Add main data table
        autoTable(doc, {
            head: [columns.headers],
            body: tableData,
            startY: startY,
            theme: 'grid',

            // Header styling
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10,
                cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
                halign: 'center',
                valign: 'middle'
            },

            // Body styling
            bodyStyles: {
                fontSize: 8,
                textColor: [17, 24, 39], // Gray-900
                cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
                lineColor: [229, 231, 235], // Gray-200
                lineWidth: 0.1
            },

            // Alternating row colors
            alternateRowStyles: {
                fillColor: lightGray
            },

            // Column-specific styling
            columnStyles: dynamicColumnStyles,

            // Table layout
            margin: { top: 40, left: 20, right: 20, bottom: 20 },
            tableWidth: 'auto',

            // Grid styling
            styles: {
                lineColor: [229, 231, 235], // Gray-200
                lineWidth: 0.1,
                overflow: 'linebreak'
            },

            // Handle page breaks
            showHead: 'everyPage',
            pageBreak: 'auto'
        });

        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...mediumGray);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 10);

            // Add company/report info in footer
            doc.text(filename.replace(/_/g, ' '), 20, doc.internal.pageSize.getHeight() - 10);
        }

        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={exportToExcel}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
            </button>
            <button
                onClick={exportToPDF}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
                <FileText className="w-4 h-4" />
                Export PDF
            </button>
        </div>
    );
};

export default UniversalExportButtons;