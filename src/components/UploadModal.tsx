import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Info,
} from 'lucide-react';
import {
  parseStoreMasterFile,
  parseWeeklySalesFile,
  downloadTemplate,
} from '../utils/dataParser';
import { StoreMasterRecord, WeeklySalesRecord } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataApplied: (sales: WeeklySalesRecord[], stores: StoreMasterRecord[], salesName: string, storesName: string) => void;
  currentStoresCount: number;
  currentSalesCount: number;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataApplied,
  currentStoresCount,
  currentSalesCount,
}) => {
  const [salesFile, setSalesFile] = useState<{ file: File; records: WeeklySalesRecord[] } | null>(null);
  const [storesFile, setStoresFile] = useState<{ file: File; records: StoreMasterRecord[] } | null>(null);
  const [salesError, setSalesError] = useState<string | null>(null);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const salesInputRef = useRef<HTMLInputElement>(null);
  const storesInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSalesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSalesError(null);
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const res = parseWeeklySalesFile(buffer, file.name);
      if (res.error) {
        setSalesError(res.error);
        setSalesFile(null);
      } else {
        setSalesFile({ file, records: res.records });
      }
    } catch (err: any) {
      setSalesError(err.message || 'Error parsing weekly sales file.');
      setSalesFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStoresUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoresError(null);
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const res = parseStoreMasterFile(buffer, file.name);
      if (res.error) {
        setStoresError(res.error);
        setStoresFile(null);
      } else {
        setStoresFile({ file, records: res.records });
      }
    } catch (err: any) {
      setStoresError(err.message || 'Error parsing store master file.');
      setStoresFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!salesFile && !storesFile) {
      return;
    }
    // If only one file uploaded, we can keep the other existing records or apply both
    onDataApplied(
      salesFile ? salesFile.records : [],
      storesFile ? storesFile.records : [],
      salesFile ? salesFile.file.name : 'Current Sales Dataset',
      storesFile ? storesFile.file.name : 'Current Store Master'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Upload Retail Intelligence Files</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload two Excel (.xlsx, .xls) or CSV files: weekly sales facts and store master dimensions.
            </p>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Instructions & Template Downloads */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-950">Expected File Names & Format:</span>
                <p className="text-indigo-800/90 mt-0.5">
                  1. <code className="font-mono bg-indigo-100/80 px-1 py-0.5 rounded">retail_weekly_sales.xlsx</code> (Sales, Target, Returns, Stock)
                  <br />
                  2. <code className="font-mono bg-indigo-100/80 px-1 py-0.5 rounded">store_master.xlsx</code> (Store ID, Region, City, Format)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => downloadTemplate('sales')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Sales Template
              </button>
              <button
                type="button"
                onClick={() => downloadTemplate('stores')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-indigo-200 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Stores Template
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Uploader 1: retail_weekly_sales.xlsx */}
            <div
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                salesFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : salesError
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input
                id="sales-file-input"
                ref={salesInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleSalesUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mb-3">
                {salesFile ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                1. Weekly Sales File
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                retail_weekly_sales.xlsx
              </p>

              {salesFile ? (
                <div className="mt-3 p-2 bg-white rounded-lg border border-emerald-200 w-full text-left">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {salesFile.file.name}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center justify-between">
                    <span>Parsed successfully</span>
                    <span className="font-semibold">{salesFile.records.length} records</span>
                  </div>
                </div>
              ) : (
                <button
                  id="browse-sales-btn"
                  type="button"
                  onClick={() => salesInputRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  Select File
                </button>
              )}

              {salesError && (
                <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1 text-left">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{salesError}</span>
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-2">
                Currently loaded: {currentSalesCount} records
              </span>
            </div>

            {/* Uploader 2: store_master.xlsx */}
            <div
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all ${
                storesFile
                  ? 'border-emerald-300 bg-emerald-50/30'
                  : storesError
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input
                id="stores-file-input"
                ref={storesInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleStoresUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center mb-3">
                {storesFile ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                2. Store Master File
              </h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                store_master.xlsx
              </p>

              {storesFile ? (
                <div className="mt-3 p-2 bg-white rounded-lg border border-emerald-200 w-full text-left">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {storesFile.file.name}
                  </div>
                  <div className="text-[11px] text-emerald-700 mt-0.5 flex items-center justify-between">
                    <span>Parsed successfully</span>
                    <span className="font-semibold">{storesFile.records.length} stores</span>
                  </div>
                </div>
              ) : (
                <button
                  id="browse-stores-btn"
                  type="button"
                  onClick={() => storesInputRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  Select File
                </button>
              )}

              {storesError && (
                <div className="mt-2 text-[11px] text-rose-600 flex items-center gap-1 text-left">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{storesError}</span>
                </div>
              )}

              <span className="text-[10px] text-slate-400 mt-2">
                Currently loaded: {currentStoresCount} stores
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {salesFile || storesFile ? (
              <span className="text-emerald-700 font-medium">Ready to update dashboard metrics</span>
            ) : (
              <span>Select files to upload or use preloaded dataset</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
            >
              Cancel
            </button>
            <button
              id="apply-uploaded-files-btn"
              type="button"
              disabled={(!salesFile && !storesFile) || isProcessing}
              onClick={handleApply}
              className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              Apply & Update Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
