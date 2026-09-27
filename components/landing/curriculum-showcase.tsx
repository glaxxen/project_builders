"use client";

import { useState } from "react";
import { 
  FileXls, 
  Database, 
  Truck, 
  GraduationCap, 
  CheckCircle, 
  GitBranch, 
  ArrowRight,
  ShieldCheck
} from "@phosphor-icons/react";

interface ProjectModule {
  week: string;
  badge: string;
  title: string;
  datasetName: string;
  datasetRows: string;
  tools: string[];
  deliverable: string;
  skills: string[];
  checkpointFocus: string;
  icon: typeof FileXls;
}

const MODULES: ProjectModule[] = [
  {
    week: "Week 01",
    badge: "Current Live Week",
    title: "AfriMart Retail Performance Dashboard",
    datasetName: "AfriMart_Sales_Dataset.xlsx",
    datasetRows: "50,000+ Transactions",
    tools: ["Excel Pivot Tables", "Formulas", "Power BI", "GitHub"],
    deliverable: "Executive Sales Dashboard + 3 Findings in README",
    skills: [
      "Strict Profit = Revenue − Cost reconciliation",
      "Metric by Dimension naming convention (Revenue by Country)",
      "Interactive multi-select dimension slicers",
      "KPI summary cards (Revenue, Profit, Units, Margin %)"
    ],
    checkpointFocus: "10-question quiz testing formula accuracy, dimension relationships, and margin discrepancies.",
    icon: FileXls,
  },
  {
    week: "Week 02",
    badge: "Next Project",
    title: "FinTech Customer Churn & Retention Analytics",
    datasetName: "PayPulse_User_Activity_Logs.csv",
    datasetRows: "125,000 Event Records",
    tools: ["Postgres SQL", "Cohort Grids", "Power BI", "GitHub"],
    deliverable: "Cohort Retention Matrix & Churn Risk Heatmap",
    skills: [
      "Vintage cohort retention rate calculation",
      "MRR (Monthly Recurring Revenue) expansion vs contraction",
      "Payment gateway failure diagnosis",
      "Customer lifetime value (LTV) vs Acquisition Cost (CAC)"
    ],
    checkpointFocus: "Auto-graded checkpoint quiz testing SQL aggregation queries and cohort retention metrics.",
    icon: Database,
  },
  {
    week: "Week 03",
    badge: "Advanced Analysis",
    title: "Supply Chain & Cross-Border Logistics Throughput",
    datasetName: "OmniLogistics_CrossBorder_Shipments.xlsx",
    datasetRows: "84,000 Consignment Legs",
    tools: ["Excel", "SQL Window Functions", "Power BI", "GitHub"],
    deliverable: "Fulfillment SLA Tracker & Root-Cause Pareto Dashboard",
    skills: [
      "Dispatch-to-delivery lead time variance analysis",
      "Carrier SLA violation rate by border transit corridor",
      "Warehousing bottleneck identification via Pareto analysis",
      "Inventory holding cost impact modeling"
    ],
    checkpointFocus: "Checkpoint quiz evaluating transit bottleneck detection and outlier handling.",
    icon: Truck,
  },
  {
    week: "Week 04",
    badge: "Capstone & Exam",
    title: "Executive Portfolio Capstone & Final Assessment",
    datasetName: "Comprehensive Enterprise Data Package",
    datasetRows: "Cross-Domain Consolidated Data",
    tools: ["Complete Analytics Stack", "GitHub", "Final Exam Engine"],
    deliverable: "Employer-Ready GitHub Portfolio + Final Assessment Score",
    skills: [
      "Synthesizing 4 weeks of analytical artifacts into one cohesive portfolio",
      "Writing executive summary findings for C-suite presentation",
      "Repository documentation and reproducibility standards",
      "Passing the comprehensive Final Assessment exam"
    ],
    checkpointFocus: "Gated comprehensive Final Assessment covering analytical modeling, SQL syntax, and business logic across all 4 weeks.",
    icon: GraduationCap,
  },
];

export function CurriculumShowcase() {
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const current = MODULES[selectedWeek] ?? MODULES[0]!;
  const Icon = current.icon;

  return (
    <section id="curriculum" className="bg-[#FAF8F3] py-16 lg:py-24 border-b border-[#E8E2D6] px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FFFFFF] border border-[#E8E2D6] text-xs font-mono uppercase tracking-wider text-[#102038]">
              <Database size={14} weight="bold" className="text-[#5BBFA4]" />
              <span>Real Datasets • 4 Weeks • 4 Repositories</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#102038] tracking-tight">
              The 4-Week Project Curriculum.
            </h2>
            <p className="font-sans text-[#4A5568] text-base leading-relaxed">
              Every project uses dirty, un-sanitized enterprise datasets designed to teach authentic data cleansing, formula reconciliation, and business storytelling.
            </p>
          </div>

          {/* Week Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FFFFFF] border border-[#E8E2D6] rounded-lg">
            {MODULES.map((m, idx) => (
              <button
                key={m.week}
                onClick={() => setSelectedWeek(idx)}
                className={`px-3.5 py-1.5 text-xs font-mono font-medium rounded transition-colors ${
                  selectedWeek === idx
                    ? "bg-[#102038] text-[#FAF8F3] font-bold"
                    : "text-[#4A5568] hover:text-[#102038] hover:bg-[#FAF8F3]"
                }`}
              >
                {m.week}
              </button>
            ))}
          </div>
        </div>

        {/* Project Inspector Card (Architectural Workspace, NOT 3 Generic Cards) */}
        <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(16,32,56,0.04)]">
          {/* Module Banner */}
          <div className="p-6 lg:p-8 bg-[#102038] text-[#FAF8F3] flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#233B5F]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#233B5F] text-[#5BBFA4] flex items-center justify-center shrink-0 border border-[#335384]">
                <Icon size={26} weight="duotone" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-[#77CBB3] font-semibold uppercase tracking-wider">
                    {current.week}
                  </span>
                  <span className="text-[#335384]">•</span>
                  <span className="text-xs font-mono text-[#C8A55B] bg-[#233B5F] px-2 py-0.5 rounded font-medium">
                    {current.badge}
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F3]">
                  {current.title}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#233B5F]/80 border border-[#335384]">
                <span className="text-[#FAF8F3]/60 block text-[10px] uppercase">Dataset File</span>
                <span className="text-[#77CBB3] font-semibold">{current.datasetName}</span>
              </div>
              <div className="p-2.5 rounded bg-[#233B5F]/80 border border-[#335384]">
                <span className="text-[#FAF8F3]/60 block text-[10px] uppercase">Scale</span>
                <span className="text-[#FAF8F3] font-semibold">{current.datasetRows}</span>
              </div>
            </div>
          </div>

          {/* Module Details Grid */}
          <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#FFFFFF]">
            {/* Left: Project Rubric & Skills (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h4 className="font-display font-semibold text-lg text-[#102038] mb-1">
                  Core Skills & Verification Criteria
                </h4>
                <p className="text-xs font-sans text-[#7E8B9B]">
                  Every student must implement and verify the following rubric standards:
                </p>
              </div>

              <div className="space-y-2.5">
                {current.skills.map((skill) => (
                  <div
                    key={skill}
                    className="p-3.5 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] flex items-start gap-3"
                  >
                    <CheckCircle size={18} weight="fill" className="text-[#5BBFA4] shrink-0 mt-0.5" />
                    <span className="text-xs font-sans font-medium text-[#102038] leading-relaxed">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tools Employed */}
              <div className="pt-2">
                <span className="text-[11px] font-mono text-[#7E8B9B] uppercase tracking-wider block mb-2">
                  Technical Stack for this Module:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {current.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded bg-[#FAF8F3] border border-[#E8E2D6] text-xs font-mono font-medium text-[#102038]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Deliverables & Assessment Checkpoint (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-[#E8E2D6] pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#E8E2D6] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#5BBFA4] font-semibold">
                    <GitBranch size={16} weight="bold" />
                    <span>Weekly Portfolio Artifact</span>
                  </div>
                  <div className="font-display font-bold text-base text-[#102038]">
                    {current.deliverable}
                  </div>
                  <p className="text-xs font-sans text-[#4A5568] leading-relaxed">
                    Published to a public GitHub repository. Must contain raw data link, dashboard file, full-res export image, and 3 plain-English findings.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FDF8ED] border border-[#E8D9B5] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C8A55B] font-semibold">
                    <ShieldCheck size={16} weight="bold" />
                    <span>Auto-Marked Checkpoint Quiz</span>
                  </div>
                  <p className="text-xs font-sans text-[#4A5568] leading-relaxed">
                    {current.checkpointFocus}
                  </p>
                  <div className="text-[11px] font-mono text-[#8C6D2B]">
                    Instant deterministic scoring upon submission
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-[#E8E2D6] flex items-center justify-between">
                <span className="text-xs font-mono text-[#7E8B9B]">
                  Module {selectedWeek + 1} of 4
                </span>
                <button
                  onClick={() => setSelectedWeek((prev) => (prev + 1) % MODULES.length)}
                  className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold text-[#102038] hover:text-[#233B5F]"
                >
                  <span>Next Week</span>
                  <ArrowRight size={13} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
