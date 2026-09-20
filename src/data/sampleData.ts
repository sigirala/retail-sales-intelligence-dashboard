import { StoreMasterRecord, WeeklySalesRecord } from '../types';

export const SAMPLE_STORE_MASTER: StoreMasterRecord[] = [
  { storeId: 'STR-101', storeName: 'Manhattan 5th Ave Flagship', region: 'East', city: 'New York', state: 'NY', storeFormat: 'Flagship', squareFeet: 42000 },
  { storeId: 'STR-102', storeName: 'Boston Back Bay Galleria', region: 'East', city: 'Boston', state: 'MA', storeFormat: 'Boutique', squareFeet: 18500 },
  { storeId: 'STR-103', storeName: 'Philadelphia King of Prussia', region: 'East', city: 'Philadelphia', state: 'PA', storeFormat: 'Hypermarket', squareFeet: 65000 },
  
  { storeId: 'STR-201', storeName: 'San Francisco Union Square', region: 'West', city: 'San Francisco', state: 'CA', storeFormat: 'Flagship', squareFeet: 38000 },
  { storeId: 'STR-202', storeName: 'Seattle Westlake Center', region: 'West', city: 'Seattle', state: 'WA', storeFormat: 'Hypermarket', squareFeet: 52000 },
  { storeId: 'STR-203', storeName: 'Los Angeles Beverly Center', region: 'West', city: 'Los Angeles', state: 'CA', storeFormat: 'Boutique', squareFeet: 21000 },
  { storeId: 'STR-204', storeName: 'Portland Pioneer Place', region: 'West', city: 'Portland', state: 'OR', storeFormat: 'Outlet', squareFeet: 24000 },

  { storeId: 'STR-301', storeName: 'Chicago Michigan Ave', region: 'Midwest', city: 'Chicago', state: 'IL', storeFormat: 'Flagship', squareFeet: 45000 },
  { storeId: 'STR-302', storeName: 'Minneapolis Mall of America', region: 'Midwest', city: 'Minneapolis', state: 'MN', storeFormat: 'Hypermarket', squareFeet: 70000 },
  { storeId: 'STR-303', storeName: 'Detroit Metro Center', region: 'Midwest', city: 'Detroit', state: 'MI', storeFormat: 'Outlet', squareFeet: 26000 },

  { storeId: 'STR-401', storeName: 'Dallas Galleria Center', region: 'South', city: 'Dallas', state: 'TX', storeFormat: 'Hypermarket', squareFeet: 58000 },
  { storeId: 'STR-402', storeName: 'Atlanta Lenox Square', region: 'South', city: 'Atlanta', state: 'GA', storeFormat: 'Flagship', squareFeet: 39000 },
  { storeId: 'STR-403', storeName: 'Miami Lincoln Road', region: 'South', city: 'Miami', state: 'FL', storeFormat: 'Boutique', squareFeet: 19500 },
  { storeId: 'STR-404', storeName: 'Austin South Congress', region: 'South', city: 'Austin', state: 'TX', storeFormat: 'Express', squareFeet: 12000 },
];

export const SAMPLE_CATEGORIES = [
  'Apparel & Fashion',
  'Consumer Electronics',
  'Groceries & Pantry',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Footwear & Athletic',
];

export const SAMPLE_WEEKS = ['W30', 'W31', 'W32', 'W33', 'W34', 'W35', 'W36', 'W37'];

// Generate deterministic realistic sample weekly sales dataset
export function generateSampleWeeklySales(): WeeklySalesRecord[] {
  const records: WeeklySalesRecord[] = [];
  let idCounter = 1;

  // Multipliers by store and week for realistic seasonality & performance variation
  const storeMultiplier: Record<string, number> = {
    'STR-101': 1.45, // Top performer
    'STR-102': 0.92,
    'STR-103': 1.15,
    'STR-201': 1.35,
    'STR-202': 1.20,
    'STR-203': 1.05,
    'STR-204': 0.78, // Lagging store missing target
    'STR-301': 1.28,
    'STR-302': 1.32,
    'STR-303': 0.74, // Lagging store missing target
    'STR-401': 1.18,
    'STR-402': 1.22,
    'STR-403': 0.82, // Lagging store
    'STR-404': 0.65, // Small express format
  };

  const categoryBase: Record<string, { avgGross: number; returnRate: number; discountRate: number; atv: number; stockoutProb: number }> = {
    'Apparel & Fashion': { avgGross: 24000, returnRate: 0.145, discountRate: 0.12, atv: 115, stockoutProb: 0.20 },
    'Consumer Electronics': { avgGross: 48000, returnRate: 0.082, discountRate: 0.06, atv: 340, stockoutProb: 0.28 },
    'Groceries & Pantry': { avgGross: 32000, returnRate: 0.018, discountRate: 0.04, atv: 62, stockoutProb: 0.15 },
    'Home & Kitchen': { avgGross: 21000, returnRate: 0.065, discountRate: 0.09, atv: 145, stockoutProb: 0.12 },
    'Beauty & Personal Care': { avgGross: 18000, returnRate: 0.035, discountRate: 0.08, atv: 78, stockoutProb: 0.08 },
    'Footwear & Athletic': { avgGross: 26000, returnRate: 0.182, discountRate: 0.11, atv: 128, stockoutProb: 0.24 }, // High return category
  };

  SAMPLE_WEEKS.forEach((week, weekIdx) => {
    // Slight weekly upward trend W30 -> W37
    const weekFactor = 0.94 + (weekIdx * 0.02) + (week === 'W35' ? 0.08 : 0); // W35 has a holiday promo bump

    SAMPLE_STORE_MASTER.forEach((store) => {
      const sMult = (storeMultiplier[store.storeId] || 1.0) * weekFactor;

      SAMPLE_CATEGORIES.forEach((cat, catIdx) => {
        const catInfo = categoryBase[cat];
        // Deterministic pseudo variation based on indices
        const variance = Math.sin(weekIdx * 3 + catIdx * 2 + store.storeId.charCodeAt(5)) * 0.12;
        const grossSales = Math.round(catInfo.avgGross * sMult * (1 + variance));
        const discountAmount = Math.round(grossSales * (catInfo.discountRate + (variance * 0.03)));
        const returnAmount = Math.round(grossSales * (catInfo.returnRate + (variance * 0.02)));
        const netSales = Math.max(0, grossSales - discountAmount - returnAmount);

        // Realistic target: set targets so some stores achieve >105%, some 95-100%, and some <88%
        const storeAchieveTargetBias = store.storeId === 'STR-303' || store.storeId === 'STR-204' || store.storeId === 'STR-403' ? 1.25 : 0.94;
        const targetSales = Math.round(netSales * storeAchieveTargetBias);

        const atv = catInfo.atv * (1 + variance * 0.1);
        const transactionsCount = Math.max(1, Math.round(netSales / atv));
        const avgUnitPrice = atv / 2.2;
        const unitsSold = Math.max(1, Math.round(netSales / avgUnitPrice));

        // Inventory levels: simulate realistic current stock and reorder points
        // Specific categories and stores will intentionally hit critical stockout risk
        const isStockoutRiskStore = (store.storeId === 'STR-101' && cat === 'Consumer Electronics') ||
                                    (store.storeId === 'STR-302' && cat === 'Footwear & Athletic') ||
                                    (store.storeId === 'STR-401' && cat === 'Apparel & Fashion') ||
                                    (weekIdx >= 5 && catInfo.stockoutProb > 0.22 && (weekIdx + catIdx) % 3 === 0);

        const currentStockUnits = isStockoutRiskStore
          ? Math.max(4, Math.round(unitsSold * (0.4 + (Math.abs(variance) * 0.4)))) // Less than 1 week of supply!
          : Math.round(unitsSold * (2.2 + (Math.abs(variance) * 2.0))); // Healthy 2.5 - 4.5 weeks

        const reorderPointUnits = Math.round(unitsSold * 1.5);

        records.push({
          id: `REC-${idCounter++}`,
          storeId: store.storeId,
          week,
          category: cat,
          grossSales,
          discountAmount,
          returnAmount,
          netSales,
          targetSales,
          transactionsCount,
          unitsSold,
          currentStockUnits,
          reorderPointUnits,
        });
      });
    });
  });

  return records;
}

export const INITIAL_SAMPLE_WEEKLY_SALES: WeeklySalesRecord[] = generateSampleWeeklySales();
