"use client";

import { useState } from "react";
import { CaretDown, Question } from "@phosphor-icons/react";

interface FAQItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Data Cleansing",
    question: "How do I handle accented country names like 'Côte d'Ivoire' in Excel formulas?",
    answer: "Different operating systems and CSV exports use UTF-8 vs Windows-1252 character encodings. In Excel, always import using 'Data > From Text/CSV' and ensure File Origin is set to '65001 : Unicode (UTF-8)'. If using VLOOKUP or XLOOKUP, sanitize names with TRIM() and CLEAN() to prevent phantom whitespace lookup mismatches.",
  },
  {
    category: "Mathematical Accuracy",
    question: "Why does my Profit Margin differ from the rubric benchmark, and what is the exact formula?",
    answer: "The #1 student mistake is confusing markup with margin. Markup is Profit divided by Cost. Margin is Profit divided by Revenue: Profit Margin % = (Revenue − Cost) / Revenue. Additionally, never average individual transaction percentage cells in pivot tables — always compute a calculated field so percentages are weighted by volume.",
  },
  {
    category: "GitHub Submission",
    question: "I don't know Git terminal commands. How do I publish my project to GitHub?",
    answer: "You do NOT need Git command-line knowledge to submit. GitHub's web interface allows you to create a public repository, click 'Upload files', drag in your working dashboard file (.xlsx or .pbix) and screenshot, and use 'Add file > Create new file' to paste your README with your 3 findings.",
  },
  {
    category: "Deadlines & Policy",
    question: "Can I update or resubmit my project if I catch an error before the Friday deadline?",
    answer: "Yes. The platform allows unlimited resubmissions up until Friday 11:59 PM. Simply paste your updated GitHub link and reflection text; our system will re-verify the repository and timestamp the latest submission.",
  },
  {
    category: "Scoring & Assessments",
    question: "How do the Checkpoint Quizzes work, and is any AI involved in grading?",
    answer: "Zero AI is used in grading. Quizzes are 10-question multiple-choice assessments checking specific data points, formula syntax, and business conclusions from that week's brief. Scoring is 100% deterministic and runs instantly upon submit.",
  },
  {
    category: "Certification",
    question: "What are the requirements to unlock and pass the Final Assessment?",
    answer: "The comprehensive Final Assessment unlocks once all 4 weekly checkpoint submissions are completed. It covers cross-domain analytical modeling and business storytelling, certifying you as a Project Builders Graduate.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="bg-[#FAF8F3] py-16 lg:py-24 border-b border-[#E8E2D6] px-4 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#FFFFFF] border border-[#E8E2D6] text-xs font-mono uppercase tracking-wider text-[#102038]">
            <Question size={14} weight="bold" className="text-[#C8A55B]" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#102038] tracking-tight">
            Common questions from our cohorts.
          </h2>
          <p className="font-sans text-[#4A5568] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            From troubleshooting dirty dataset encodings to GitHub repository guidelines.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#5BBFA4] font-semibold block">
                      {faq.category}
                    </span>
                    <span className="font-display font-semibold text-base sm:text-lg text-[#102038] block leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#102038] shrink-0 transition-transform duration-200 mt-1 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    <CaretDown size={14} weight="bold" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm font-sans text-[#4A5568] leading-relaxed border-t border-[#F3EFE6]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
