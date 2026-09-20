import React, { useState, useMemo } from 'react';
import {
  SAMPLE_STORE_MASTER,
  INITIAL_SAMPLE_WEEKLY_SALES,
} from './data/sampleData';
import {
  StoreMasterRecord,
  WeeklySalesRecord,
  MergedSalesRecord,
  FilterState,
} from './types';
import { mergeSalesWithStoreMaster } from './utils/dataParser';
import {
  filterMergedRecords,
  computeDashboardKpis,
  computeWeeklyTrend,
  computeRegionSales,
  computeCategoryPerformance,
  computeStoreLeaderboard,
  computeStockoutRisks,
  computeBusinessInsights,
} from './utils/kpiCalculator';

import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KpiGrid } from './components/KpiGrid';
import { WeeklySalesTrend } from './components/WeeklySalesTrend';
import { RegionSalesChart } from './components/RegionSalesChart';
import { CategoryPerformance } from './components/CategoryPerformance';
import { StoreLeaderboard } from './components/StoreLeaderboard';
import { StockoutRiskIndicator } from './components/StockoutRiskIndicator';
import { BusinessInsightSummary } from './components/BusinessInsightSummary';
import { UploadModal } from './components/UploadModal';
import { ExportModal } from './components/ExportModal';

const DEFAULT_FILTERS: FilterState = {
  weeks: [],
  regions: [],
  storeIds: [],
  cities: [],
  storeFormats: [],
  categories: [],
  searchQuery: '',
};

export default function App() {
  const [storesData, setStoresData] = useState<StoreMasterRecord[]>(SAMPLE_STORE_MASTER);
  const [salesData, setSalesData] = useState<WeeklySalesRecord[]>(INITIAL_SAMPLE_WEEKLY_SALES);
  const [salesFileName, setSalesFileName] = useState<string>('retail_weekly_sales.xlsx');
  const [storesFileName, setStoresFileName] = useState<string>('store_master.xlsx');
  const [isUsingSampleData, setIsUsingSampleData] = useState<boolean>(true);

  // Filters State
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Modal Dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Merge sales with store master
  const mergedAllRecords: MergedSalesRecord[] = useMemo(() => {
    return mergeSalesWithStoreMaster(salesData, storesData);
  }, [salesData, storesData]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    count += filters.weeks.length;
    count += filters.regions.length;
    count += filters.storeIds.length;
    count += filters.cities.length;
    count += filters.storeFormats.length;
    count += filters.categories.length;
    if (filters.searchQuery?.trim()) count += 1;
    return count;
  }, [filters]);

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return filterMergedRecords(mergedAllRecords, filters);
  }, [mergedAllRecords, filters]);

  // Dashboard KPIs
  const kpis = useMemo(() => {
    return computeDashboardKpis(filteredRecords);
  }, [filteredRecords]);

  // Analytics points
  const weeklyTrend = useMemo(() => {
    return computeWeeklyTrend(filteredRecords);
  }, [filteredRecords]);

  const regionSales = useMemo(() => {
    return computeRegionSales(filteredRecords);
  }, [filteredRecords]);

  const categoryPerformance = useMemo(() => {
    return computeCategoryPerformance(filteredRecords);
  }, [filteredRecords]);

  const storeLeaderboard = useMemo(() => {
    return computeStoreLeaderboard(filteredRecords);
  }, [filteredRecords]);

  const stockoutRisks = useMemo(() => {
    return computeStockoutRisks(filteredRecords);
  }, [filteredRecords]);

  const businessInsights = useMemo(() => {
    return computeBusinessInsights(filteredRecords, kpis);
  }, [filteredRecords, kpis]);

  // Handlers
  const handleDataApplied = (
    newSales: WeeklySalesRecord[],
    newStores: StoreMasterRecord[],
    salesName: string,
    storesName: string
  ) => {
    if (newSales.length > 0) {
      setSalesData(newSales);
      setSalesFileName(salesName);
    }
    if (newStores.length > 0) {
      setStoresData(newStores);
      setStoresFileName(storesName);
    }
    setIsUsingSampleData(false);
    setFilters(DEFAULT_FILTERS);
  };

  const handleResetSample = () => {
    setStoresData(SAMPLE_STORE_MASTER);
    setSalesData(INITIAL_SAMPLE_WEEKLY_SALES);
    setSalesFileName('retail_weekly_sales.xlsx');
    setStoresFileName('store_master.xlsx');
    setIsUsingSampleData(true);
    setFilters(DEFAULT_FILTERS);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return (
    <div className="min-h-screen bg-slate-50/75 text-slate-900 flex flex-col font-sans antialiased">
      {/* App Header with Status and Actions */}
      <Header
        salesFileName={salesFileName}
        storesFileName={storesFileName}
        totalRecordsCount={mergedAllRecords.length}
        storesCount={storesData.length}
        isUsingSampleData={isUsingSampleData}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onResetSample={handleResetSample}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Interactive Filters Bar (Feature 2) */}
        <FilterBar
          data={mergedAllRecords}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={handleResetFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {/* KPI Cards (Feature 3) */}
        <KpiGrid kpis={kpis} />

        {/* Business Insight Summary (Feature 5) */}
        <BusinessInsightSummary insights={businessInsights} />

        {/* Visual Analytics Grid (Feature 4) */}
        <div className="space-y-6">
          {/* Row 1: Weekly Sales Trend & Regional Sales */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <WeeklySalesTrend data={weeklyTrend} />
            </div>
            <div className="lg:col-span-5">
              <RegionSalesChart data={regionSales} />
            </div>
          </div>

          {/* Row 2: Category Performance & Store Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <CategoryPerformance data={categoryPerformance} />
            </div>
            <div className="lg:col-span-7">
              <StoreLeaderboard data={storeLeaderboard} />
            </div>
          </div>

          {/* Row 3: Stockout Risk Indicator (Feature 4.5) */}
          <div>
            <StockoutRiskIndicator items={stockoutRisks} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Retail Sales Intelligence Dashboard • Operational Analytics Engine</span>
          <span>Dual Source Integration: <code className="font-mono text-slate-600">retail_weekly_sales.xlsx</code> + <code className="font-mono text-slate-600">store_master.xlsx</code></span>
        </div>
      </footer>

      {/* Dual File Upload Modal (Feature 1) */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDataApplied={handleDataApplied}
        currentSalesCount={salesData.length}
        currentStoresCount={storesData.length}
      />

      {/* Export Report Modal (Feature 6) */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        filteredRecords={filteredRecords}
        kpis={kpis}
        insights={businessInsights}
        filters={filters}
      />
    </div>
  );
}
