import React from 'react';
import {
  BarChart3,
  UploadCloud,
  Download,
  RotateCcw,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  salesFileName: string;
  storesFileName: string;
  totalRecordsCount: number;
  storesCount: number;
  isUsingSampleData: boolean;
  onOpenUpload: () => void;
  onOpenExport: () => void;
  onResetSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  salesFileName,
  storesFileName,
  totalRecordsCount,
  storesCount,
  isUsingSampleData,
  onOpenUpload,
  onOpenExport,
  onResetSample,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Retail Sales Intelligence
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                Executive Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {isUsingSampleData ? 'Preloaded Dataset' : 'Custom Upload'}
              </span>
              <span>•</span>
              <span title={`${salesFileName} + ${storesFileName}`}>
                {totalRecordsCount.toLocaleString()} sales records across {storesCount} stores
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isUsingSampleData ? (
            <button
              id="sample-active-badge"
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-default"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              Demo Data Active
            </button>
          ) : (
            <button
              id="reset-sample-btn"
              type="button"
              onClick={onResetSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Switch back to demo dataset"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              Reset to Sample
            </button>
          )}

          <button
            id="open-upload-modal-btn"
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-xs"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Upload Data</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">2 files</span>
          </button>

          <button
            id="open-export-modal-btn"
            type="button"
            onClick={onOpenExport}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </header>
  );
};
