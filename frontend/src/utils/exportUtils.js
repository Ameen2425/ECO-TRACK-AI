/**
 * EcoTrack AI – Export Utilities
 * Handles CSV and PDF downloads.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── CSV ────────────────────────────────────────────────────────────────────
export const downloadCSV = (data, filename) => {
    if (!data || !data.length) {
        alert("No data available to export.");
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(h => `"${('' + (row[h] ?? '')).replace(/"/g, '\\"')}"`);
        csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    _triggerDownload(blob, filename);
};

// ─── PDF ────────────────────────────────────────────────────────────────────
/**
 * downloadPDF
 * @param {object} opts
 *   - username {string}
 *   - dateRange {string}   e.g. "Apr 1 – Apr 7, 2026"
 *   - totalEmissions {number}
 *   - breakdown {object}   { transport, electricity, gas, waste, diet } in kg
 *   - score {number}       0-100
 *   - suggestions {string[]}
 *   - treesNeeded {number}
 *   - reportType {string}  "Daily" | "Weekly" | "Monthly"
 */
export const downloadPDF = ({
    username       = 'EcoTrack User',
    dateRange      = '',
    totalEmissions = 0,
    breakdown      = {},
    score          = 0,
    suggestions    = [],
    treesNeeded    = 0,
    reportType     = 'Report',
} = {}) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const GREEN = [22, 163, 74];
    const BLUE  = [37, 99, 235];
    const DARK  = [30, 41, 59];
    const MUTED = [100, 116, 139];
    const W = doc.internal.pageSize.getWidth();

    // -- Header bar --
    doc.setFillColor(...GREEN);
    doc.rect(0, 0, W, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('EcoTrack AI', 14, 13);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${reportType} Carbon Report`, 14, 21);
    doc.text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), W - 14, 21, { align: 'right' });

    let y = 40;

    // -- Meta --
    doc.setTextColor(...DARK);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`User: ${username}`, 14, y);
    if (dateRange) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...MUTED);
        doc.text(`Period: ${dateRange}`, 14, y + 7);
        y += 7;
    }
    y += 12;

    // -- Total Emissions box --
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(14, y, W - 28, 22, 3, 3, 'F');
    doc.setTextColor(...GREEN);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${Number(totalEmissions).toFixed(2)} kg CO₂e`, 14 + (W - 28) / 2, y + 14, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('Total Carbon Footprint', 14 + (W - 28) / 2, y + 20, { align: 'center' });
    y += 30;

    // -- Category Breakdown table --
    doc.setTextColor(...DARK);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Emission Breakdown by Category', 14, y);
    y += 4;

    const bkd = [
        ['🚗 Transport',    `${Number(breakdown.transport  || 0).toFixed(2)} kg`],
        ['⚡ Electricity',  `${Number(breakdown.electricity|| 0).toFixed(2)} kg`],
        ['🔥 Gas / Heating',`${Number(breakdown.gas       || 0).toFixed(2)} kg`],
        ['🗑️ Waste',        `${Number(breakdown.waste      || 0).toFixed(2)} kg`],
        ['🥗 Food / Diet',  `${Number(breakdown.diet       || 0).toFixed(2)} kg`],
    ];

    autoTable(doc, {
        startY: y,
        head: [['Category', 'Emission (kg CO₂e)']],
        body: bkd,
        theme: 'striped',
        headStyles: { fillColor: GREEN, textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 10, textColor: DARK },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // -- Score & Offset row --
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Sustainability Summary', 14, y);
    y += 4;

    autoTable(doc, {
        startY: y,
        body: [
            ['Sustainability Score', `${score} / 100`],
            ['Trees Needed to Offset', `${treesNeeded} trees`],
        ],
        theme: 'plain',
        bodyStyles: { fontSize: 10, textColor: DARK },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold', textColor: GREEN } },
        margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 12;

    // -- AI Suggestions --
    if (suggestions.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        doc.text('AI Recommendations', 14, y);
        y += 6;

        suggestions.slice(0, 5).forEach((s, i) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(...MUTED);
            const lines = doc.splitTextToSize(`${i + 1}. ${s}`, W - 30);
            doc.text(lines, 14, y);
            y += lines.length * 5 + 2;
        });
    }

    // -- Footer --
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text('EcoTrack AI – Carbon Footprint Tracker', 14, doc.internal.pageSize.getHeight() - 8);
        doc.text(`Page ${i} of ${pageCount}`, W - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }

    const safeType = reportType.replace(/\s+/g, '_');
    doc.save(`EcoTrack_${safeType}_Report_${new Date().toISOString().slice(0,10)}.pdf`);
};

// ─── Internal helper ─────────────────────────────────────────────────────────
function _triggerDownload(blob, filename) {
    const link = document.createElement('a');
    const url  = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
