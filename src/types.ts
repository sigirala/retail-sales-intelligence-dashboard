export interface StoreMasterRecord {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  state: string;
  storeFormat: string; // e.g., Flagship, Hypermarket, Outlet, Express, Boutique
  squareFeet?: number;
}

export interface WeeklySalesRecord {
  id?: string;
  storeId: string;
  week: string; // e.g., "W31", "W32", "2026-W35"
  category: string; // Apparel, Electronics, Groceries, Home & Living, Beauty & Health, Footwear
  grossSales: number;
  discountAmount: number;
  returnAmount: number;
  netSales: number; // Gross - Discount - Return (or provided)
  targetSales: number;
  transactionsCount: number;
  unitsSold: number;
  currentStockUnits: number;
  reorderPointUnits: number;
}

export interface MergedSalesRecord extends WeeklySalesRecord {
  storeName: string;
  region: string;
  city: string;
  state: string;
  storeFormat: string;
  weeksOfSupply: number;
  stockoutRisk: 'Critical' | 'Warning' | 'Healthy';
}

export interface FilterState {
  weeks: string[];
  regions: string[];
  storeIds: string[];
  cities: string[];
  storeFormats: string[];
  categories: string[];
  searchQuery?: string;
}

export interface DashboardKpis {
  totalNetSales: number;
  totalGrossSales: number;
  totalTargetSales: number;
  targetAchievementRate: number; // % = Net Sales / Target Sales * 100
  totalTransactions: number;
  averageTransactionValue: number; // $ = Net Sales / Total Transactions
  totalReturnAmount: number;
  returnRate: number; // % = Return Amount / Net Sales * 100
  totalDiscountAmount: number;
  discountRate: number; // % = Total Discount / Gross Sales * 100
  totalUnitsSold: number;
}

export interface StockoutItem {
  storeId: string;
  storeName: string;
  region: string;
  category: string;
  currentStock: number;
  weeklyUnitsSold: number;
  weeksOfSupply: number;
  riskLevel: 'Critical' | 'Warning' | 'Healthy';
  potentialLostSales: number;
}

export interface BusinessInsights {
  bestRegion: { name: string; netSales: number; achievement: number };
  worstRegion: { name: string; netSales: number; achievement: number };
  storesMissingTarget: Array<{
    storeId: string;
    storeName: string;
    region: string;
    netSales: number;
    targetSales: number;
    achievement: number;
    shortfall: number;
  }>;
  topPerformingStores: Array<{
    storeId: string;
    storeName: string;
    region: string;
    netSales: number;
    achievement: number;
  }>;
  highReturnCategories: Array<{
    category: string;
    returnAmount: number;
    netSales: number;
    returnRate: number;
  }>;
  stockoutRisksCount: {
    critical: number;
    warning: number;
    healthy: number;
  };
}
