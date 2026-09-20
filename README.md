# Retail Sales Intelligence Dashboard 📊

An executive-level Retail Sales Intelligence application built with **Google AI Studio**. This dashboard ingests weekly sales performance facts and store master dimension data to provide real-time KPI tracking, cross-dimensional slicing, stockout risk analytics, and automated business summaries.

---

## 🌟 Key Features

* **Dual File Integration:** Ingests and joins `retail_weekly_sales.xlsx` (sales transactions, returns, discounts) and `store_master.xlsx` (store locations, formats, regions) by Store ID.
* **Interactive Slicers & Filters:** Multi-select filtering across **Week**, **Region**, **Store**, **City**, **Store Format**, and **Product Category**.
* **Executive KPI Cards:**
  * **Net Sales ($)** & Gross Revenue
  * **Target Achievement Rate (%)** with color-coded status gap indicators
  * **Average Transaction Value (ATV)**
  * **Return Rate (%)** with elevated return threshold warnings
  * **Discount Rate (%)** relative to gross sales
* **Visual Analytics Suite:**
  * **Weekly Sales Trend:** Line chart tracking Net Sales vs. Target Sales trajectory over time
  * **Sales by Region:** Bar chart highlighting regional contribution vs. targets
  * **Category Performance:** Toggle between Donut/Pie market share and horizontal return-rate bar charts
  * **Store Leaderboard:** Horizontal ranking by revenue volume or quota attainment
  * **Stockout Risk Indicator:** Evaluates **Weeks of Supply (WOS)** to identify critical inventory depletion (`< 1.0 WOS`) and calculated revenue at risk
* **Automated Business Insight Summary:** Rule-based executive synthesis highlighting top/lagging regions, quota shortfalls, and high-return categories requiring quality/sizing audits.
* **Data Export:** Directly export filtered datasets to **Excel (.xlsx)** or **CSV (.csv)** and generate an Executive Briefing Report.

---

## 🛠️ Tech Stack

* **Framework:** React / TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS / Lucide Icons
* **Charts:** Chart.js / Recharts
* **Data Processing:** SheetJS (XLSX)

---

## 🚀 Getting Started Locally

### Prerequisites
Make sure you have **Node.js** (v18+) or **Bun** installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/sigirala/retail-sales-intelligence-dashboard.git](https://github.com/sigirala/retail-sales-intelligence-dashboard.git)
   cd retail-sales-intelligence-dashboard
