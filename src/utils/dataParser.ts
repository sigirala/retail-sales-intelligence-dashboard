import * as XLSX from 'xlsx';
import { StoreMasterRecord, WeeklySalesRecord, MergedSalesRecord } from '../types';

// Helper to normalize keys from CSV / Excel rows
function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function parseStoreMasterFile(fileBuffer: ArrayBuffer, fileName: string): { records: StoreMasterRecord[]; error?: string } {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!rawRows || rawRows.length === 0) {
      return { records: [], error: 'Store master file contains no data rows.' };
    }

    const records: StoreMasterRecord[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const normMap: Record<string, any> = {};
      Object.keys(row).forEach((k) => {
        normMap[normalizeKey(k)] = row[k];
      });

      const storeId = String(normMap['storeid'] || normMap['store'] || normMap['id'] || `STR-${i + 1}`).trim();
      const storeName = String(normMap['storename'] || normMap['name'] || `Store ${storeId}`).trim();
      const region = String(normMap['region'] || normMap['zone'] || normMap['division'] || 'General').trim();
      const city = String(normMap['city'] || normMap['location'] || 'Metropolitan').trim();
      const state = String(normMap['state'] || normMap['province'] || '').trim();
      const storeFormat = String(normMap['storeformat'] || normMap['format'] || normMap['type'] || 'Standard').trim();
      const squareFeet = normMap['squarefeet'] || normMap['sqft'] || normMap['area'] ? Number(normMap['squarefeet'] || normMap['sqft'] || normMap['area']) : undefined;

      records.push({
        storeId,
        storeName,
        region,
        city,
        state,
        storeFormat,
        squareFeet,
      });
    }

    return { records };
  } catch (err: any) {
    return { records: [], error: `Failed to parse ${fileName}: ${err.message || 'Unknown error'}` };
  }
}

export function parseWeeklySalesFile(fileBuffer: ArrayBuffer, fileName: string): { records: WeeklySalesRecord[]; error?: string } {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!rawRows || rawRows.length === 0) {
      return { records: [], error: 'Weekly sales file contains no data rows.' };
    }

    const records: WeeklySalesRecord[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const normMap: Record<string, any> = {};
      Object.keys(row).forEach((k) => {
        normMap[normalizeKey(k)] = row[k];
      });

      const storeId = String(normMap['storeid'] || normMap['store'] || normMap['storenumber'] || '').trim();
      const rawWeek = normMap['week'] || normMap['weeknumber'] || normMap['weeknum'] || normMap['period'] || 'W01';
      const week = String(rawWeek).startsWith('W') ? String(rawWeek) : `W${rawWeek}`;
      const category = String(normMap['productcategory'] || normMap['category'] || normMap['dept'] || normMap['department'] || 'General Retail').trim();

      const grossSales = Number(normMap['grosssales'] || normMap['gross'] || normMap['sales'] || 0) || 0;
      const discountAmount = Number(normMap['discountamount'] || normMap['discount'] || normMap['discounts'] || 0) || 0;
      const returnAmount = Number(normMap['returnamount'] || normMap['returnsamount'] || normMap['returns'] || normMap['return'] || 0) || 0;

      let netSales = Number(normMap['netsales'] || normMap['net'] || 0);
      if (!netSales || isNaN(netSales)) {
        netSales = Math.max(0, grossSales - discountAmount - returnAmount);
      }

      const targetSales = Number(normMap['targetsales'] || normMap['target'] || normMap['budget'] || netSales * 0.95) || 0;
      const transactionsCount = Math.max(1, Number(normMap['totaltransactions'] || normMap['transactionscount'] || normMap['transactions'] || normMap['trans'] || 1));
      const unitsSold = Math.max(1, Number(normMap['unitssold'] || normMap['units'] || normMap['qty'] || 1));

      const currentStockUnits = Number(normMap['endinginventoryunits'] || normMap['currentstockunits'] || normMap['currentstock'] || normMap['stock'] || normMap['inventory'] || unitsSold * 2.5);
      const reorderPointUnits = Number(normMap['safetystockunits'] || normMap['reorderpointunits'] || normMap['reorderpoint'] || unitsSold * 1.5);

      records.push({
        id: `ROW-${i + 1}`,
        storeId,
        week,
        category,
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
    }

    return { records };
  } catch (err: any) {
    return { records: [], error: `Failed to parse ${fileName}: ${err.message || 'Unknown error'}` };
  }
}

export function mergeSalesWithStoreMaster(
  sales: WeeklySalesRecord[],
  stores: StoreMasterRecord[]
): MergedSalesRecord[] {
  const storeMap = new Map<string, StoreMasterRecord>();
  stores.forEach((s) => {
    storeMap.set(s.storeId.toLowerCase(), s);
  });

  return sales.map((sale) => {
    const matchedStore = storeMap.get(sale.storeId.toLowerCase()) || {
      storeId: sale.storeId,
      storeName: `Store ${sale.storeId}`,
      region: 'Unassigned',
      city: 'Unknown',
      state: '',
      storeFormat: 'Standard',
    };

    // Calculate weeks of supply
    const weeklyRate = sale.unitsSold > 0 ? sale.unitsSold : 1;
    const weeksOfSupply = Number((sale.currentStockUnits / weeklyRate).toFixed(1));

    let stockoutRisk: 'Critical' | 'Warning' | 'Healthy' = 'Healthy';
    if (weeksOfSupply < 1.0) {
      stockoutRisk = 'Critical';
    } else if (weeksOfSupply < 1.8) {
      stockoutRisk = 'Warning';
    }

    return {
      ...sale,
      storeName: matchedStore.storeName,
      region: matchedStore.region,
      city: matchedStore.city,
      state: matchedStore.state,
      storeFormat: matchedStore.storeFormat,
      weeksOfSupply,
      stockoutRisk,
    };
  });
}

// Download Sample Templates helper
export function downloadTemplate(type: 'sales' | 'stores', format: 'xlsx' | 'csv' = 'xlsx') {
  if (type === 'stores') {
    const data = [
      { Store_ID: 'STR-101', Store_Name: 'Manhattan 5th Ave Flagship', Region: 'East', City: 'New York', State: 'NY', Store_Format: 'Flagship', Square_Feet: 42000 },
      { Store_ID: 'STR-102', Store_Name: 'Boston Back Bay Galleria', Region: 'East', City: 'Boston', State: 'MA', Store_Format: 'Boutique', Square_Feet: 18500 },
      { Store_ID: 'STR-201', Store_Name: 'San Francisco Union Square', Region: 'West', City: 'San Francisco', State: 'CA', Store_Format: 'Flagship', Square_Feet: 38000 },
      { Store_ID: 'STR-301', Store_Name: 'Chicago Michigan Ave', Region: 'Midwest', City: 'Chicago', State: 'IL', Store_Format: 'Flagship', Square_Feet: 45000 },
      { Store_ID: 'STR-401', Store_Name: 'Dallas Galleria Center', Region: 'South', City: 'Dallas', State: 'TX', Store_Format: 'Hypermarket', Square_Feet: 58000 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StoreMaster');
    XLSX.writeFile(wb, `store_master.${format}`);
  } else {
    const data = [
      { Store_ID: 'STR-101', Week: 'W35', Product_Category: 'Apparel & Fashion', Gross_Sales: 42000, Discount_Amount: 4200, Return_Amount: 5100, Net_Sales: 32700, Target_Sales: 31000, Total_Transactions: 315, Units_Sold: 640, Ending_Inventory_Units: 1450, Safety_Stock_Units: 960 },
      { Store_ID: 'STR-101', Week: 'W35', Product_Category: 'Consumer Electronics', Gross_Sales: 89000, Discount_Amount: 5300, Return_Amount: 6400, Net_Sales: 77300, Target_Sales: 74000, Total_Transactions: 245, Units_Sold: 320, Ending_Inventory_Units: 210, Safety_Stock_Units: 480 },
      { Store_ID: 'STR-201', Week: 'W35', Product_Category: 'Footwear & Athletic', Gross_Sales: 36000, Discount_Amount: 3900, Return_Amount: 6200, Net_Sales: 25900, Target_Sales: 27500, Total_Transactions: 210, Units_Sold: 410, Ending_Inventory_Units: 920, Safety_Stock_Units: 615 },
      { Store_ID: 'STR-301', Week: 'W35', Product_Category: 'Beauty & Personal Care', Gross_Sales: 28500, Discount_Amount: 2200, Return_Amount: 950, Net_Sales: 25350, Target_Sales: 24000, Total_Transactions: 340, Units_Sold: 580, Ending_Inventory_Units: 2100, Safety_Stock_Units: 870 },
      { Store_ID: 'STR-401', Week: 'W35', Product_Category: 'Home & Kitchen', Gross_Sales: 33000, Discount_Amount: 2900, Return_Amount: 2100, Net_Sales: 28000, Target_Sales: 29000, Total_Transactions: 195, Units_Sold: 380, Ending_Inventory_Units: 1200, Safety_Stock_Units: 570 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WeeklySales');
    XLSX.writeFile(wb, `retail_weekly_sales.${format}`);
  }
}

// Export Filtered Records to CSV or XLSX
export function exportDataToFile(data: MergedSalesRecord[], format: 'xlsx' | 'csv', filename = 'retail_sales_report') {
  const exportRows = data.map((d) => ({
    'Store ID': d.storeId,
    'Store Name': d.storeName,
    'Region': d.region,
    'City': d.city,
    'State': d.state,
    'Format': d.storeFormat,
    'Week': d.week,
    'Category': d.category,
    'Gross Sales ($)': d.grossSales,
    'Discounts ($)': d.discountAmount,
    'Returns ($)': d.returnAmount,
    'Net Sales ($)': d.netSales,
    'Target Sales ($)': d.targetSales,
    'Achievement (%)': Number(((d.netSales / (d.targetSales || 1)) * 100).toFixed(1)),
    'Transactions': d.transactionsCount,
    'ATV ($)': Number((d.netSales / (d.transactionsCount || 1)).toFixed(2)),
    'Units Sold': d.unitsSold,
    'Stock Units': d.currentStockUnits,
    'Weeks of Supply': d.weeksOfSupply,
    'Stockout Risk': d.stockoutRisk,
  }));

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'FilteredSales');
  XLSX.writeFile(wb, `${filename}.${format}`);
}
