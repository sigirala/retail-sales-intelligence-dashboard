import React, { useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Check,
  Calendar,
  Filter,
} from 'lucide-react';
import { MergedSalesRecord, DashboardKpis, BusinessInsights, FilterState } from '../types';
import { exportDataToFile } from '../utils/dataParser';
import { formatCurrency, formatNumber } from '../utils/kpiCalculator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredRecords: MergedSalesRecord[];
  kpis: DashboardKpis;
  insights: BusinessInsights;
  filters: FilterState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  filteredRecords,
  kpis,
  insights,
  filters,
}) => {
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `retail_sales_intelligence_${timestamp}`;
    exportDataToFile(filteredRecords, exportFormat, filename);
  };

  const generateReportText = (): string => {
    const activeFiltersList =
      [
        filters.weeks.length > 0
          ? `Weeks: ${filters.weeks.map((w) => `W${w}`).join(', ')}`
          : null,
        filters.regions.length > 0
          ? `Regions: ${filters.regions.join(', ')}`
          : null,
        filters.storeIds.length > 0
          ? `Stores: ${filters.storeIds.join(', ')}`
          : null,
        filters.cities.length > 0
          ? `Cities: ${filters.cities.join(', ')}`
          : null,
        filters.storeFormats.length > 0
          ? `Formats: ${filters.storeFormats.join(', ')}`
          : null,
        filters.categories.length > 0
          ? `Categories: ${filters.categories.join(', ')}`
          : null,
        filters.searchQuery?.trim()
          ? `Search: "${filters.searchQuery}"`
          : null,
      ]
        .filter(Boolean)
        .join(' | ') || 'All Data (Unfiltered)';

    return `=====================================================
RETAIL SALES INTELLIGENCE - EXECUTIVE SUMMARY REPORT
Generated on: ${new Date().toLocaleString()}
Scope: ${activeFiltersList}
Records Analyzed: ${filteredRecords.length.toLocaleString()}
=====================================================

1. CORE FINANCIAL & OPERATIONAL KPIS
-----------------------------------------------------
- Net Sales:                 ${formatCurrency(kpis.totalNetSales)}
- Target Sales Quota:        ${formatCurrency(kpis.totalTargetSales)}
- Target Achievement Rate:   ${kpis.targetAchievementRate.toFixed(1)}%
- Total Transactions:        ${formatNumber(kpis.totalTransactions)}
- Average Transaction Value: $${kpis.averageTransactionValue.toFixed(2)}
- Gross Sales:               ${formatCurrency(kpis.totalGrossSales)}
- Return Amount:             ${formatCurrency(kpis.totalReturnAmount)}
- Return Rate:               ${kpis.returnRate.toFixed(1)}% (of Net Sales)
- Total Discounts:           ${formatCurrency(kpis.totalDiscountAmount)}
- Discount Rate:             ${kpis.discountRate.toFixed(1)}% (of Gross Sales)
- Total Units Sold:          ${formatNumber(kpis.totalUnitsSold)}

2. REGIONAL PERFORMANCE HIGHLIGHTS
-----------------------------------------------------
- Top Performing Region:     ${insights.bestRegion.name} (${insights.bestRegion.achievement}% Target Met, ${formatCurrency(insights.bestRegion.netSales)} Net Sales)
- Lagging Region:            ${insights.worstRegion.name} (${insights.worstRegion.achievement}% Target Met, ${formatCurrency(insights.worstRegion.netSales)} Net Sales)

3. STORES MISSING TARGET (${insights.storesMissingTarget.length} Stores Identified)
-----------------------------------------------------
${
  insights.storesMissingTarget.length === 0
    ? 'All stores achieved or exceeded planned target.'
    : insights.storesMissingTarget
        .slice(0, 5)
        .map(
          (s) =>
            `- ${s.storeName} (${s.region}): Achieved ${s.achievement}% | Shortfall: -${formatCurrency(s.shortfall)}`
        )
        .join('\n')
}

4. HIGH RETURN RISK CATEGORIES
-----------------------------------------------------
${
  insights.highReturnCategories.length === 0
    ? 'All categories have normal return rates (<8%).'
    : insights.highReturnCategories
        .map(
          (c) =>
            `- ${c.category}: ${c.returnRate}% Return Rate (${formatCurrency(c.returnAmount)} returned on ${formatCurrency(c.netSales)} Net Sales)`
        )
        .join('\n')
}

5. INVENTORY & STOCKOUT RISK STATUS
-----------------------------------------------------
- Critical Stockout Risk (<1.0 WOS):  ${insights.stockoutRisksCount.critical} Store-Category Units
- Warning Stockout Risk (1.0-1.8 WOS): ${insights.stockoutRisksCount.warning} Store-Category Units
- Healthy Inventory (>=1.8 WOS):      ${insights.stockoutRisksCount.healthy} Store-Category Units

Action Items:
1. Expedite inventory transfers for high-velocity items with critical stockout warnings.
2. Review return drivers and customer feedback on high-return categories.
3. Conduct operational review with store managers missing targets by >10%.
=====================================================`;
  };

  const handleCopyReport = () => {
    const text = generateReportText();
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrintReport = () => {
    const text = generateReportText();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Retail Sales Intelligence Report</title>
            <style>
              body { font-family: monospace; padding: 24px; white-space: pre-wrap; font-size: 13px; line-height: 1.5; color: #0f172a; }
            </style>
          </head>
          <body>${text}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const reportPreview = generateReportText();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Export Sales Intelligence Report</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Export {filteredRecords.length.toLocaleString()} filtered records or download the synthesized executive briefing.
            </p>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: Data Table File Export */}
            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Export Raw Filtered Data
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Complete joined dataset with sales, returns, discounts, targets, and inventory metrics.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <label className="text-xs font-semibold text-slate-600">Format:</label>
                  <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setExportFormat('xlsx')}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        exportFormat === 'xlsx'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`px-3 py-1 rounded-md font-medium transition-all ${
                        exportFormat === 'csv'
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      CSV (.csv)
                    </button>
                  </div>
                </div>
              </div>

              <button
                id="download-data-file-btn"
                type="button"
                onClick={handleExportData}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
              >
                <Download className="w-4 h-4" />
                Download {exportFormat.toUpperCase()} ({filteredRecords.length.toLocaleString()} rows)
              </button>
            </div>

            {/* Option 2: Executive Summary Report */}
            <div className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Executive Briefing Report
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Synthesized text briefing with core KPIs, store shortfalls, return anomalies, and action items.
                </p>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      Copy Briefing
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
              </div>
            </div>
          </div>

          {/* Report Preview Box */}
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1.5">
              Live Executive Report Preview:
            </span>
            <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto max-h-56 overflow-y-auto border border-slate-800">
              {reportPreview}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
