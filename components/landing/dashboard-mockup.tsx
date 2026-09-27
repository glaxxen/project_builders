"use client";

import { useState } from "react";
import { 
  ChartBar, 
  TrendUp, 
  Funnel, 
  CheckCircle, 
  Table, 
  FileXls, 
  GitFork, 
  CaretDown,
  Info
} from "@phosphor-icons/react";

interface CountryMetric {
  country: string;
  code: string;
  revenue: number;
  profit: number;
  margin: string;
  share: number; // percentage
}

const COUNTRIES: CountryMetric[] = [
  { country: "Nigeria", code: "NG", revenue: 582400, profit: 186368, margin: "32.0%", share: 40.8 },
  { country: "Kenya", code: "KE", revenue: 328600, profit: 101866, margin: "31.0%", share: 23.0 },
  { country: "South Africa", code: "ZA", revenue: 264100, profit: 79230, margin: "30.0%", share: 18.5 },
  { country: "Ghana", code: "GH", revenue: 142850, profit: 42855, margin: "30.0%", share: 10.0 },
  { country: "Egypt", code: "EG", revenue: 111000, profit: 29461, margin: "26.5%", share: 7.7 },
];

export function DashboardMockup() {
  const [selectedCountry, setSelectedCountry] = useState<string>("All Markets");
  const [activeTab, setActiveTab] = useState<"overview" | "rubric">("overview");

  return (
    <div className="w-full bg-[#FFFFFF] border border-[#DCD5C5] rounded-xl shadow-[0_2px_8px_rgba(16,32,56,0.06)] overflow-hidden text-left">
      {/* Dashboard Top Application Bar */}
      <div className="bg-[#102038] text-[#FAF8F3] px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#233B5F]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#233B5F] text-[11px] font-mono font-medium text-[#77CBB3]">
            <FileXls size={14} weight="bold" />
            <span>AfriMart_Sales_Dataset.xlsx</span>
          </div>
          <span className="text-xs text-[#FAF8F3]/60 hidden sm:inline">•</span>
          <span className="text-xs font-sans font-medium text-[#FAF8F3]/90 hidden sm:inline">
            Executive Performance Review (Q1–Q3)
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#233B5F] text-[#FAF8F3] text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5BBFA4]" />
            Formula: Profit = Revenue − Cost
          </span>
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[#C8A55B] bg-[#233B5F]/50 px-2 py-0.5 rounded">
            <span>Rubric: 100% Validated</span>
          </div>
        </div>
      </div>

      {/* Slicers & Dimension Filter Bar */}
      <div className="bg-[#FAF8F3] px-4 py-2.5 border-b border-[#E8E2D6] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 font-mono text-[#7E8B9B] mr-1">
            <Funnel size={13} weight="bold" />
            <span className="uppercase text-[10px] tracking-wider">Slicers:</span>
          </div>
          {["All Markets", "Nigeria (NG)", "Kenya (KE)", "South Africa (ZA)", "Ghana (GH)"].map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedCountry(opt)}
              className={`px-2.5 py-1 rounded text-xs font-sans transition-colors ${
                selectedCountry === opt
                  ? "bg-[#102038] text-[#FAF8F3] font-semibold"
                  : "bg-[#FFFFFF] text-[#4A5568] border border-[#E8E2D6] hover:bg-[#F3EFE6]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E8E2D6] p-0.5 rounded text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-[#233B5F] text-[#FAF8F3]"
                : "text-[#4A5568] hover:text-[#102038]"
            }`}
          >
            Dashboard View
          </button>
          <button
            onClick={() => setActiveTab("rubric")}
            className={`px-2.5 py-1 rounded text-[11px] font-sans font-medium transition-colors ${
              activeTab === "rubric"
                ? "bg-[#233B5F] text-[#FAF8F3]"
                : "text-[#4A5568] hover:text-[#102038]"
            }`}
          >
            Submission Rubric (20%)
          </button>
        </div>
      </div>

      {/* Main Analytical Body */}
      {activeTab === "overview" ? (
        <div className="p-4 sm:p-5 space-y-5 bg-[#FFFFFF]">
          {/* 4 Standard Rubric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6]">
              <div className="flex items-center justify-between text-xs text-[#7E8B9B] font-sans">
                <span>Total Revenue</span>
                <span className="font-mono text-[10px] text-[#1E4D40] bg-[#EBF7F4] px-1.5 py-0.5 rounded font-semibold">
                  +18.4%
                </span>
              </div>
              <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#102038] tracking-tight">
                $1,428,950
              </div>
              <p className="mt-1 text-[11px] text-[#4A5568] font-sans">
                Target: $1.20M (Exceeded)
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6]">
              <div className="flex items-center justify-between text-xs text-[#7E8B9B] font-sans">
                <span>Net Gross Profit</span>
                <span className="font-mono text-[10px] text-[#1E4D40] bg-[#EBF7F4] px-1.5 py-0.5 rounded font-semibold">
                  Reconciled
                </span>
              </div>
              <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#102038] tracking-tight">
                $439,780
              </div>
              <p className="mt-1 text-[11px] text-[#4A5568] font-sans">
                Formula: Revenue − Cost
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6]">
              <div className="flex items-center justify-between text-xs text-[#7E8B9B] font-sans">
                <span>Profit Margin</span>
                <span className="font-mono text-[10px] text-[#C8A55B] bg-[#FDF8ED] px-1.5 py-0.5 rounded font-semibold border border-[#E8D9B5]">
                  Benchmark
                </span>
              </div>
              <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#102038] tracking-tight">
                30.78%
              </div>
              <p className="mt-1 text-[11px] text-[#4A5568] font-sans">
                +2.28% above 28.5% goal
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6]">
              <div className="flex items-center justify-between text-xs text-[#7E8B9B] font-sans">
                <span>Total Units Sold</span>
                <span className="font-mono text-[10px] text-[#233B5F] bg-[#FFFFFF] border border-[#E8E2D6] px-1.5 py-0.5 rounded font-semibold">
                  Volume
                </span>
              </div>
              <div className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#102038] tracking-tight">
                58,420
              </div>
              <p className="mt-1 text-[11px] text-[#4A5568] font-sans">
                Across 6 African Markets
              </p>
            </div>
          </div>

          {/* Charts Row: Revenue by Dimension */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Chart 1: Revenue by Country (Horizontal Bars) */}
            <div className="lg:col-span-7 p-4 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D6]">
                <div>
                  <h4 className="font-display font-semibold text-sm text-[#102038]">
                    Revenue & Profit by Country
                  </h4>
                  <p className="text-[11px] font-sans text-[#7E8B9B]">
                    Rule: Metric by Dimension (Sorted descending)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-sans">
                  <span className="flex items-center gap-1 text-[#233B5F]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#233B5F]" /> Revenue
                  </span>
                  <span className="flex items-center gap-1 text-[#1E4D40]">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#5BBFA4]" /> Profit
                  </span>
                </div>
              </div>

              {/* Data Bars */}
              <div className="mt-3 space-y-2.5">
                {COUNTRIES.map((c) => (
                  <div key={c.country} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="font-medium text-[#102038] flex items-center gap-1.5">
                        <span className="w-5 font-mono text-[10px] text-[#7E8B9B]">{c.code}</span>
                        {c.country}
                      </span>
                      <span className="font-mono text-[11px] text-[#4A5568]">
                        ${(c.revenue / 1000).toFixed(1)}k rev • <strong className="text-[#102038]">${(c.profit / 1000).toFixed(1)}k profit</strong> ({c.margin})
                      </span>
                    </div>
                    {/* Solid Bar Track */}
                    <div className="w-full h-3 bg-[#E8E2D6] rounded-xs overflow-hidden flex">
                      <div 
                        className="h-full bg-[#233B5F]" 
                        style={{ width: `${c.share}%` }} 
                        title={`Revenue share: ${c.share}%`}
                      />
                      <div 
                        className="h-full bg-[#5BBFA4]" 
                        style={{ width: `${c.share * 0.31}%` }} 
                        title={`Profit margin: ${c.margin}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Category Breakdown & Key Findings */}
            <div className="lg:col-span-5 p-4 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] flex flex-col justify-between">
              <div>
                <h4 className="font-display font-semibold text-sm text-[#102038]">
                  Student Written Reflection (3 Findings)
                </h4>
                <p className="text-[11px] font-sans text-[#7E8B9B] mb-3">
                  Requirement: Concise business findings based strictly on data
                </p>

                <div className="space-y-2 text-xs font-sans">
                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E8E2D6]">
                    <div className="font-semibold text-[#102038] mb-0.5">
                      1. Geographic Concentration
                    </div>
                    <p className="text-[#4A5568] text-[11px] leading-relaxed">
                      Nigeria accounts for 40.8% of gross revenue ($582.4k) and delivers the highest margin rate (32.0%), serving as the primary growth engine.
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E8E2D6]">
                    <div className="font-semibold text-[#102038] mb-0.5">
                      2. Margin Consistency Across Hubs
                    </div>
                    <p className="text-[#4A5568] text-[11px] leading-relaxed">
                      Kenya and South Africa maintain steady 30–31% margins, while Egypt exhibits high shipping friction resulting in a margin dip to 26.5%.
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E8E2D6]">
                    <div className="font-semibold text-[#102038] mb-0.5">
                      3. Operational Recommendation
                    </div>
                    <p className="text-[#4A5568] text-[11px] leading-relaxed">
                      FMCG category sales generated 58% of volume; bundling with electronics can optimize average cart value across West African fulfillment nodes.
                    </p>
                  </div>
                </div>
              </div>

              {/* GitHub Upload Stamp */}
              <div className="mt-3 pt-3 border-t border-[#E8E2D6] flex items-center justify-between text-[11px] text-[#7E8B9B] font-mono">
                <span className="flex items-center gap-1.5 text-[#102038]">
                  <GitFork size={13} weight="bold" />
                  <span>github.com/student/afrimart-dashboard</span>
                </span>
                <span className="text-[#5BBFA4] font-semibold flex items-center gap-1">
                  <CheckCircle size={13} weight="fill" /> Ready to Submit
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Rubric Inspection Tab */
        <div className="p-5 space-y-4 bg-[#FFFFFF] text-xs font-sans">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D6]">
            <div>
              <h4 className="font-display font-semibold text-base text-[#102038]">
                Week 1 Grading Rubric Breakdown
              </h4>
              <p className="text-[#7E8B9B] text-xs">
                Criteria evaluated on every student submission before checkpoint unlock
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#EBF7F4] text-[#1E4D40] font-mono font-semibold rounded">
              Total Weight: 100%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2D6] text-[11px] font-mono uppercase text-[#7E8B9B] bg-[#FAF8F3]">
                  <th className="py-2 px-3">Criteria</th>
                  <th className="py-2 px-3">Weight</th>
                  <th className="py-2 px-3">Standard Checked</th>
                  <th className="py-2 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D6] text-xs">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#102038]">KPI Cards</td>
                  <td className="py-2.5 px-3 font-mono text-[#4A5568]">20%</td>
                  <td className="py-2.5 px-3 text-[#4A5568]">Revenue, Profit, Units Sold, and Profit Margin % cards present</td>
                  <td className="py-2.5 px-3 text-right text-[#1E4D40] font-medium">Passed</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#102038]">Charts (Pivot Tables)</td>
                  <td className="py-2.5 px-3 font-mono text-[#4A5568]">25%</td>
                  <td className="py-2.5 px-3 text-[#4A5568]">At least 5 pivot-driven charts answering specific business questions</td>
                  <td className="py-2.5 px-3 text-right text-[#1E4D40] font-medium">Passed</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#102038]">Naming Convention</td>
                  <td className="py-2.5 px-3 font-mono text-[#4A5568]">10%</td>
                  <td className="py-2.5 px-3 text-[#4A5568]">Follows Metric by Dimension rule (e.g. Revenue by Country)</td>
                  <td className="py-2.5 px-3 text-right text-[#1E4D40] font-medium">Passed</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#102038]">Mathematical Accuracy</td>
                  <td className="py-2.5 px-3 font-mono text-[#4A5568]">15%</td>
                  <td className="py-2.5 px-3 text-[#4A5568]">Profit = Revenue − Cost verified; formulas used rather than manual inputs</td>
                  <td className="py-2.5 px-3 text-right text-[#1E4D40] font-medium">Passed</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-[#102038]">Written Reflection</td>
                  <td className="py-2.5 px-3 font-mono text-[#4A5568]">10%</td>
                  <td className="py-2.5 px-3 text-[#4A5568]">3 clear findings in plain English submitted in reflection form</td>
                  <td className="py-2.5 px-3 text-right text-[#1E4D40] font-medium">Passed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
