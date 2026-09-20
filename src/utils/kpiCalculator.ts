import { MergedSalesRecord, FilterState, DashboardKpis, BusinessInsights, StockoutItem } from '../types';

export function filterMergedRecords(data: MergedSalesRecord[], filters: FilterState): MergedSalesRecord[] {
  return data.filter((row) => {
    if (filters.weeks && filters.weeks.length > 0 && !filters.weeks.includes(row.week)) {
      return false;
    }
    if (
      filters.regions &&
      filters.regions.length > 0 &&
      !filters.regions.some((r) => r.toLowerCase() === row.region.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.storeIds &&
      filters.storeIds.length > 0 &&
      !filters.storeIds.some((s) => s.toLowerCase() === row.storeId.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.cities &&
      filters.cities.length > 0 &&
      !filters.cities.some((c) => c.toLowerCase() === row.city.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.storeFormats &&
      filters.storeFormats.length > 0 &&
      !filters.storeFormats.some((f) => f.toLowerCase() === row.storeFormat.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.categories &&
      filters.categories.length > 0 &&
      !filters.categories.some((cat) => cat.toLowerCase() === row.category.toLowerCase())
    ) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const match =
        row.storeName.toLowerCase().includes(q) ||
        row.storeId.toLowerCase().includes(q) ||
        row.city.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.region.toLowerCase().includes(q) ||
        row.storeFormat.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}

export function computeDashboardKpis(records: MergedSalesRecord[]): DashboardKpis {
  let totalNetSales = 0;
  let totalGrossSales = 0;
  let totalTargetSales = 0;
  let totalTransactions = 0;
  let totalReturnAmount = 0;
  let totalDiscountAmount = 0;
  let totalUnitsSold = 0;

  for (const r of records) {
    totalNetSales += r.netSales;
    totalGrossSales += r.grossSales;
    totalTargetSales += r.targetSales;
    totalTransactions += r.transactionsCount;
    totalReturnAmount += r.returnAmount;
    totalDiscountAmount += r.discountAmount;
    totalUnitsSold += r.unitsSold;
  }

  const targetAchievementRate = totalTargetSales > 0 ? (totalNetSales / totalTargetSales) * 100 : 0;
  const averageTransactionValue = totalTransactions > 0 ? totalNetSales / totalTransactions : 0;
  const returnRate = totalNetSales > 0 ? (totalReturnAmount / totalNetSales) * 100 : 0;
  const discountRate = totalGrossSales > 0 ? (totalDiscountAmount / totalGrossSales) * 100 : 0;

  return {
    totalNetSales,
    totalGrossSales,
    totalTargetSales,
    targetAchievementRate,
    totalTransactions,
    averageTransactionValue,
    totalReturnAmount,
    returnRate,
    totalDiscountAmount,
    discountRate,
    totalUnitsSold,
  };
}

export interface WeeklyTrendPoint {
  week: string;
  netSales: number;
  targetSales: number;
  grossSales: number;
  achievement: number;
  unitsSold: number;
  returns: number;
}

export function computeWeeklyTrend(records: MergedSalesRecord[]): WeeklyTrendPoint[] {
  const map = new Map<string, { net: number; target: number; gross: number; units: number; returns: number }>();

  records.forEach((r) => {
    const existing = map.get(r.week) || { net: 0, target: 0, gross: 0, units: 0, returns: 0 };
    existing.net += r.netSales;
    existing.target += r.targetSales;
    existing.gross += r.grossSales;
    existing.units += r.unitsSold;
    existing.returns += r.returnAmount;
    map.set(r.week, existing);
  });

  const sortedWeeks = Array.from(map.keys()).sort((a, b) => {
    // Natural week sorting (e.g. W30 vs W31)
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

  return sortedWeeks.map((week) => {
    const val = map.get(week)!;
    const achievement = val.target > 0 ? (val.net / val.target) * 100 : 0;
    return {
      week,
      netSales: Math.round(val.net),
      targetSales: Math.round(val.target),
      grossSales: Math.round(val.gross),
      achievement: Number(achievement.toFixed(1)),
      unitsSold: val.units,
      returns: Math.round(val.returns),
    };
  });
}

export interface RegionSalesPoint {
  region: string;
  netSales: number;
  targetSales: number;
  achievement: number;
  returnRate: number;
  storeCount: number;
}

export function computeRegionSales(records: MergedSalesRecord[]): RegionSalesPoint[] {
  const map = new Map<string, { net: number; target: number; returns: number; stores: Set<string> }>();

  records.forEach((r) => {
    const reg = r.region || 'Unassigned';
    const existing = map.get(reg) || { net: 0, target: 0, returns: 0, stores: new Set<string>() };
    existing.net += r.netSales;
    existing.target += r.targetSales;
    existing.returns += r.returnAmount;
    existing.stores.add(r.storeId);
    map.set(reg, existing);
  });

  return Array.from(map.entries())
    .map(([region, val]) => {
      const achievement = val.target > 0 ? (val.net / val.target) * 100 : 0;
      const returnRate = val.net > 0 ? (val.returns / val.net) * 100 : 0;
      return {
        region,
        netSales: Math.round(val.net),
        targetSales: Math.round(val.target),
        achievement: Number(achievement.toFixed(1)),
        returnRate: Number(returnRate.toFixed(1)),
        storeCount: val.stores.size,
      };
    })
    .sort((a, b) => b.netSales - a.netSales);
}

export interface CategoryPerformancePoint {
  category: string;
  netSales: number;
  grossSales: number;
  returnAmount: number;
  returnRate: number;
  sharePercent: number;
  unitsSold: number;
}

export function computeCategoryPerformance(records: MergedSalesRecord[]): CategoryPerformancePoint[] {
  const map = new Map<string, { net: number; gross: number; returns: number; units: number }>();
  let totalNet = 0;

  records.forEach((r) => {
    const cat = r.category || 'Other';
    const existing = map.get(cat) || { net: 0, gross: 0, returns: 0, units: 0 };
    existing.net += r.netSales;
    existing.gross += r.grossSales;
    existing.returns += r.returnAmount;
    existing.units += r.unitsSold;
    map.set(cat, existing);
    totalNet += r.netSales;
  });

  return Array.from(map.entries())
    .map(([category, val]) => {
      const returnRate = val.net > 0 ? (val.returns / val.net) * 100 : 0;
      const sharePercent = totalNet > 0 ? (val.net / totalNet) * 100 : 0;
      return {
        category,
        netSales: Math.round(val.net),
        grossSales: Math.round(val.gross),
        returnAmount: Math.round(val.returns),
        returnRate: Number(returnRate.toFixed(1)),
        sharePercent: Number(sharePercent.toFixed(1)),
        unitsSold: val.units,
      };
    })
    .sort((a, b) => b.netSales - a.netSales);
}

export interface StoreLeaderboardItem {
  storeId: string;
  storeName: string;
  region: string;
  city: string;
  storeFormat: string;
  netSales: number;
  targetSales: number;
  achievement: number;
  shortfall: number;
  transactions: number;
  atv: number;
}

export function computeStoreLeaderboard(records: MergedSalesRecord[]): StoreLeaderboardItem[] {
  const map = new Map<string, {
    storeName: string;
    region: string;
    city: string;
    storeFormat: string;
    net: number;
    target: number;
    trans: number;
  }>();

  records.forEach((r) => {
    const existing = map.get(r.storeId) || {
      storeName: r.storeName,
      region: r.region,
      city: r.city,
      storeFormat: r.storeFormat,
      net: 0,
      target: 0,
      trans: 0,
    };
    existing.net += r.netSales;
    existing.target += r.targetSales;
    existing.trans += r.transactionsCount;
    map.set(r.storeId, existing);
  });

  return Array.from(map.entries())
    .map(([storeId, val]) => {
      const achievement = val.target > 0 ? (val.net / val.target) * 100 : 0;
      const shortfall = Math.max(0, val.target - val.net);
      const atv = val.trans > 0 ? val.net / val.trans : 0;
      return {
        storeId,
        storeName: val.storeName,
        region: val.region,
        city: val.city,
        storeFormat: val.storeFormat,
        netSales: Math.round(val.net),
        targetSales: Math.round(val.target),
        achievement: Number(achievement.toFixed(1)),
        shortfall: Math.round(shortfall),
        transactions: val.trans,
        atv: Number(atv.toFixed(2)),
      };
    })
    .sort((a, b) => b.netSales - a.netSales);
}

export function computeStockoutRisks(records: MergedSalesRecord[]): StockoutItem[] {
  // Aggregate stockout risk by store & category
  const map = new Map<string, {
    storeId: string;
    storeName: string;
    region: string;
    category: string;
    currentStock: number;
    weeklyUnits: number;
    netSales: number;
    count: number;
  }>();

  records.forEach((r) => {
    const key = `${r.storeId}__${r.category}`;
    const existing = map.get(key) || {
      storeId: r.storeId,
      storeName: r.storeName,
      region: r.region,
      category: r.category,
      currentStock: 0,
      weeklyUnits: 0,
      netSales: 0,
      count: 0,
    };
    // Take latest stock or average
    existing.currentStock = r.currentStockUnits;
    existing.weeklyUnits += r.unitsSold;
    existing.netSales += r.netSales;
    existing.count += 1;
    map.set(key, existing);
  });

  const results: StockoutItem[] = [];

  map.forEach((val) => {
    const avgWeeklyUnits = val.count > 0 ? val.weeklyUnits / val.count : 1;
    const weeksOfSupply = Number((val.currentStock / Math.max(1, avgWeeklyUnits)).toFixed(1));
    let riskLevel: 'Critical' | 'Warning' | 'Healthy' = 'Healthy';

    if (weeksOfSupply < 1.0) {
      riskLevel = 'Critical';
    } else if (weeksOfSupply < 1.8) {
      riskLevel = 'Warning';
    }

    const avgPrice = val.weeklyUnits > 0 ? val.netSales / val.weeklyUnits : 50;
    // Estimate potential lost sales for next 2 weeks if critical/warning
    const deficitUnits = riskLevel === 'Critical' ? Math.max(0, avgWeeklyUnits * 1.5 - val.currentStock) : 0;
    const potentialLostSales = Math.round(deficitUnits * avgPrice);

    results.push({
      storeId: val.storeId,
      storeName: val.storeName,
      region: val.region,
      category: val.category,
      currentStock: val.currentStock,
      weeklyUnitsSold: Math.round(avgWeeklyUnits),
      weeksOfSupply,
      riskLevel,
      potentialLostSales,
    });
  });

  // Sort critical first, then lowest weeks of supply
  return results.sort((a, b) => {
    const rankOrder = { Critical: 0, Warning: 1, Healthy: 2 };
    if (rankOrder[a.riskLevel] !== rankOrder[b.riskLevel]) {
      return rankOrder[a.riskLevel] - rankOrder[b.riskLevel];
    }
    return a.weeksOfSupply - b.weeksOfSupply;
  });
}

export function computeBusinessInsights(
  records: MergedSalesRecord[],
  kpis: DashboardKpis
): BusinessInsights {
  const regions = computeRegionSales(records);
  const bestRegion = regions.length > 0
    ? { name: regions[0].region, netSales: regions[0].netSales, achievement: regions[0].achievement }
    : { name: 'None', netSales: 0, achievement: 0 };
  const worstRegion = regions.length > 0
    ? { name: regions[regions.length - 1].region, netSales: regions[regions.length - 1].netSales, achievement: regions[regions.length - 1].achievement }
    : { name: 'None', netSales: 0, achievement: 0 };

  const stores = computeStoreLeaderboard(records);
  const storesMissingTarget = stores
    .filter((s) => s.achievement < 100)
    .sort((a, b) => b.shortfall - a.shortfall);

  const topPerformingStores = stores
    .filter((s) => s.achievement >= 100)
    .sort((a, b) => b.achievement - a.achievement)
    .slice(0, 5);

  const categories = computeCategoryPerformance(records);
  // Benchmark return rate: national avg or categories > 10%
  const avgReturnRate = kpis.returnRate;
  const highReturnCategories = categories
    .filter((c) => c.returnRate > Math.max(8.0, avgReturnRate))
    .sort((a, b) => b.returnRate - a.returnRate);

  const stockoutItems = computeStockoutRisks(records);
  const stockoutRisksCount = {
    critical: stockoutItems.filter((i) => i.riskLevel === 'Critical').length,
    warning: stockoutItems.filter((i) => i.riskLevel === 'Warning').length,
    healthy: stockoutItems.filter((i) => i.riskLevel === 'Healthy').length,
  };

  return {
    bestRegion,
    worstRegion,
    storesMissingTarget,
    topPerformingStores,
    highReturnCategories,
    stockoutRisksCount,
  };
}

export function formatCurrency(val: number): string {
  if (Math.abs(val) >= 1_000_000) {
    return `$${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `$${(val / 1_000).toFixed(1)}K`;
  }
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatNumber(val: number): string {
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(1)}K`;
  }
  return val.toLocaleString('en-US');
}
