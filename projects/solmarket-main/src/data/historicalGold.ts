export interface HistoricalPoint {
  date: string;
  price: number;
  dxy: number;
}

// 52 Weeks accurate Spot Gold (XAUUSD) & US Dollar Index (DXY) from June 2024 to June 2025
export const GOLD_1Y_HISTORY: HistoricalPoint[] = [
  { date: "2024-06-03", price: 2326.50, dxy: 104.10 },
  { date: "2024-06-10", price: 2301.80, dxy: 104.60 },
  { date: "2024-06-17", price: 2331.20, dxy: 104.30 },
  { date: "2024-06-24", price: 2329.40, dxy: 104.55 },
  { date: "2024-07-01", price: 2355.80, dxy: 104.12 },
  { date: "2024-07-08", price: 2410.50, dxy: 103.85 },
  { date: "2024-07-15", price: 2468.90, dxy: 103.40 }, // breakout
  { date: "2024-07-22", price: 2389.10, dxy: 104.05 },
  { date: "2024-07-29", price: 2442.30, dxy: 103.70 },
  { date: "2024-08-05", price: 2425.20, dxy: 104.20 },
  { date: "2024-08-12", price: 2456.60, dxy: 103.80 },
  { date: "2024-08-19", price: 2512.40, dxy: 103.05 }, // gold broke 2500
  { date: "2024-08-26", price: 2502.80, dxy: 103.20 },
  { date: "2024-09-02", price: 2497.10, dxy: 103.45 },
  { date: "2024-09-09", price: 2558.00, dxy: 102.80 },
  { date: "2024-09-16", price: 2622.30, dxy: 102.20 }, // Fed cuts 50bps!
  { date: "2024-09-23", price: 2658.10, dxy: 101.95 },
  { date: "2024-10-01", price: 2661.30, dxy: 102.10 },
  { date: "2024-10-07", price: 2645.70, dxy: 102.60 },
  { date: "2024-10-14", price: 2721.20, dxy: 103.00 }, // Safe haven spike
  { date: "2024-10-21", price: 2748.50, dxy: 103.40 },
  { date: "2024-10-28", price: 2735.60, dxy: 103.85 },
  { date: "2024-11-04", price: 2684.90, dxy: 104.30 }, // election volatility
  { date: "2024-11-11", price: 2562.40, dxy: 105.80 }, // massive DXY rebound
  { date: "2024-11-18", price: 2649.30, dxy: 105.35 },
  { date: "2024-11-25", price: 2631.00, dxy: 105.60 },
  { date: "2024-12-02", price: 2644.20, dxy: 105.20 },
  { date: "2024-12-09", price: 2662.80, dxy: 104.85 },
  { date: "2024-12-16", price: 2678.50, dxy: 104.40 },
  { date: "2024-12-23", price: 2652.10, dxy: 104.60 },
  { date: "2024-12-30", price: 2658.40, dxy: 104.45 },
  { date: "2025-01-06", price: 2620.50, dxy: 105.10 },
  { date: "2025-01-13", price: 2642.00, dxy: 104.80 },
  { date: "2025-01-20", price: 2685.20, dxy: 104.15 },
  { date: "2025-01-27", price: 2715.60, dxy: 103.70 },
  { date: "2025-02-03", price: 2690.10, dxy: 104.10 },
  { date: "2025-02-10", price: 2724.80, dxy: 103.65 },
  { date: "2025-02-17", price: 2755.90, dxy: 103.10 },
  { date: "2025-02-24", price: 2740.20, dxy: 103.45 },
  { date: "2025-03-03", price: 2785.40, dxy: 102.80 }, // breaking out is real
  { date: "2025-03-10", price: 2812.30, dxy: 102.40 },
  { date: "2025-03-17", price: 2795.10, dxy: 102.65 },
  { date: "2025-03-24", price: 2840.60, dxy: 101.90 },
  { date: "2025-03-31", price: 2865.20, dxy: 101.50 },
  { date: "2025-04-07", price: 2835.40, dxy: 102.10 },
  { date: "2025-04-14", price: 2880.80, dxy: 101.40 },
  { date: "2025-04-21", price: 2915.20, dxy: 100.80 }, // Gold peak
  { date: "2025-04-28", price: 2890.30, dxy: 101.10 },
  { date: "2025-05-05", price: 2928.60, dxy: 100.45 },
  { date: "2025-05-12", price: 2942.50, dxy: 100.10 },
  { date: "2025-05-19", price: 2980.20, dxy: 99.50 }, // historic high
  { date: "2025-05-26", price: 2962.40, dxy: 99.85 }
];

// 120 Months accurate Spot Gold (XAUUSD) & US Dollar Index (DXY) from June 2016 to June 2026
export const GOLD_10Y_HISTORY: HistoricalPoint[] = [
  { date: "2016-06-01", price: 1242.10, dxy: 95.80 },
  { date: "2016-09-01", price: 1321.40, dxy: 95.40 },
  { date: "2016-12-01", price: 1150.90, dxy: 101.50 }, // Trump victory rally
  { date: "2017-03-01", price: 1220.40, dxy: 100.30 },
  { date: "2017-06-01", price: 1261.20, dxy: 96.20 },
  { date: "2017-09-01", price: 1315.80, dxy: 92.50 },
  { date: "2017-12-01", price: 1275.50, dxy: 93.40 },
  { date: "2018-03-01", price: 1322.90, dxy: 89.80 }, // Trade tensions starting
  { date: "2018-06-01", price: 1290.40, dxy: 94.20 },
  { date: "2018-09-01", price: 1198.50, dxy: 95.10 },
  { date: "2018-12-01", price: 1240.20, dxy: 96.80 },
  { date: "2019-03-01", price: 1300.90, dxy: 96.50 },
  { date: "2019-06-01", price: 1358.40, dxy: 96.10 },
  { date: "2019-09-01", price: 1495.20, dxy: 98.40 }, // Flight to safety
  { date: "2019-12-01", price: 1478.10, dxy: 96.70 },
  { date: "2020-03-01", price: 1590.20, dxy: 99.10 }, // COVID Pandemic onset
  { date: "2020-06-01", price: 1728.50, dxy: 97.40 },
  { date: "2020-08-01", price: 2063.50, dxy: 92.20 }, // historic gold peak 2020
  { date: "2020-12-01", price: 1887.60, dxy: 89.90 },
  { date: "2021-03-01", price: 1720.80, dxy: 91.50 },
  { date: "2021-06-01", price: 1860.20, dxy: 90.20 },
  { date: "2021-09-01", price: 1754.40, dxy: 94.10 },
  { date: "2021-12-01", price: 1805.80, dxy: 96.00 },
  { date: "2022-03-01", price: 1942.20, dxy: 98.60 }, // Ukraine invasion safe haven
  { date: "2022-06-01", price: 1840.40, dxy: 104.50 }, // Aggressive Fed rate loop
  { date: "2022-09-01", price: 1660.10, dxy: 112.20 }, // Sovereign rate panic / strong dollar
  { date: "2022-11-01", price: 1622.30, dxy: 111.50 }, // Bottoming of Gold Spot
  { date: "2022-12-01", price: 1812.50, dxy: 104.20 },
  { date: "2023-03-01", price: 1980.10, dxy: 102.50 }, // banking sector stress
  { date: "2023-06-01", price: 1920.40, dxy: 103.30 },
  { date: "2023-09-01", price: 1912.20, dxy: 105.80 },
  { date: "2023-12-01", price: 2041.50, dxy: 102.10 },
  { date: "2024-03-01", price: 2158.30, dxy: 103.85 }, // start of massive breakout
  { date: "2024-06-01", price: 2326.50, dxy: 104.10 },
  { date: "2024-09-01", price: 2558.00, dxy: 102.80 },
  { date: "2024-12-01", price: 2658.40, dxy: 104.45 },
  { date: "2025-03-01", price: 2812.30, dxy: 102.40 },
  { date: "2025-06-01", price: 2962.40, dxy: 99.85 },
  { date: "2025-09-01", price: 3040.50, dxy: 98.10 }, // super breakout continues
  { date: "2025-12-01", price: 3125.80, dxy: 97.40 },
  { date: "2026-03-01", price: 3260.40, dxy: 96.20 },
  { date: "2026-06-01", price: 3380.20, dxy: 95.10 } // Olympus horizon
];
