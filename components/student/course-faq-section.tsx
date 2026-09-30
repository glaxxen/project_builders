"use client";

import { useState } from "react";
import {
  CaretDown,
  Info,
  Question,
  Megaphone,
  CheckCircle,
  Lightbulb,
} from "@phosphor-icons/react";

interface FAQItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Data Cleansing",
    question: "How do I handle accented country names like 'Côte d'Ivoire' in Excel formulas?",
    answer:
      "Different operating systems and CSV exports use UTF-8 vs Windows-1252 character encodings. In Excel, always import using 'Data > From Text/CSV' and ensure File Origin is set to '65001 : Unicode (UTF-8)'. If using VLOOKUP or XLOOKUP, sanitize names with TRIM() and CLEAN() to prevent phantom whitespace lookup mismatches.",
  },
  {
    category: "Mathematical Accuracy",
    question: "Why does my Profit Margin differ from the rubric benchmark, and what is the exact formula?",
    answer:
      "The #1 student mistake is confusing markup with margin. Markup is Profit divided by Cost. Margin is Profit divided by Revenue: Profit Margin % = (Revenue − Cost) / Revenue. Additionally, never average individual transaction percentage cells in pivot tables — always compute a calculated field so percentages are weighted by volume.",
  },
  {
    category: "GitHub Submission",
    question: "I don't know Git terminal commands. How do I publish my project to GitHub?",
    answer:
      "You do NOT need Git command-line knowledge to submit. GitHub's web interface allows you to create a public repository, click 'Upload files', drag in your working dashboard file (.xlsx or .pbix) and screenshot, and use 'Add file > Create new file' to paste your README with your 3 findings.",
  },
  {
    category: "Deadlines & Policy",
    question: "Can I update or resubmit my project if I catch an error before the Friday deadline?",
    answer:
      "Yes. The platform allows unlimited resubmissions up until Friday 11:59 PM. Simply paste your updated GitHub link and reflection text; our system will re-verify the repository and timestamp the latest submission.",
  },
  {
    category: "Scoring & Assessments",
    question: "How do the Checkpoint Quizzes work, and is any AI involved in grading?",
    answer:
      "Zero AI is used in grading. Quizzes are 10-question multiple-choice assessments checking specific data points, formula syntax, and business conclusions from that week's brief. Scoring is 100% deterministic and runs instantly upon submit.",
  },
  {
    category: "Certification",
    question: "What are the requirements to unlock and pass the Final Assessment?",
    answer:
      "The comprehensive Final Assessment unlocks once all 4 weekly checkpoint submissions are completed. It covers cross-domain analytical modeling and business storytelling, certifying you as a Project Builders Graduate.",
  },
];

export function CourseFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(FAQS.map((f) => f.category)))];

  const filteredFaqs =
    activeCategory === "All"
      ? FAQS
      : FAQS.filter((f) => f.category === activeCategory);

  return (
    <section className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(16,32,56,0.04)] space-y-6">
      {/* Announcements Notice */}
      <div className="bg-[#FAF8F3] border border-[#E8E2D6] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0">
          <Megaphone size={20} weight="fill" className="text-[#5BBFA4]" />
        </div>
        <div className="space-y-1 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold uppercase tracking-wider text-[#102038]">
              Cohort Bulletin: Week 1 Live Class &amp; Submission Window
            </span>
            <span className="text-[10px] font-mono bg-[#5BBFA4] text-[#FAF8F3] px-2 py-0.5 rounded font-bold">
              Active
            </span>
          </div>
          <p className="text-[#4A5568] leading-relaxed">
            Welcome to the Data Analysis cohort! Week 1 project briefs and datasets are live below. Remember to keep your repository public and verify that all currency and UTF-8 encoding formulas match the rubric requirements.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#FAF8F3] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#BA9C60] font-semibold uppercase tracking-wider">
            <Question size={15} weight="bold" />
            <span>Technical Briefing &amp; FAQ</span>
          </div>
          <h2 className="font-display text-xl font-bold text-[#102038] mt-1">
            Frequently Encountered Issues &amp; Guidance
          </h2>
          <p className="text-xs font-sans text-[#7E8B9B]">
            Official course answers on UTF-8 encodings, profit formulas, and repository guidelines.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#102038] text-[#FAF8F3] font-semibold"
                  : "bg-[#FAF8F3] text-[#7E8B9B] hover:text-[#102038] border border-[#E8E2D6]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="border border-[#E8E2D6] rounded-xl overflow-hidden bg-[#FAF8F3] transition-colors"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 text-left flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5BBFA4] font-semibold block">
                    {faq.category}
                  </span>
                  <span className="font-sans font-semibold text-sm text-[#102038] block leading-snug">
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E8E2D6] flex items-center justify-center text-[#102038] shrink-0 transition-transform duration-200 mt-0.5 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <CaretDown size={12} weight="bold" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs font-sans text-[#4A5568] leading-relaxed border-t border-[#E8E2D6] bg-[#FFFFFF]">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
