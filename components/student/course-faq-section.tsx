"use client";

import { useState } from "react";
import { CaretDown, Megaphone } from "@phosphor-icons/react";

interface FAQItem {
  question: string;
  category: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Data cleansing",
    question: "How do I handle accented country names like 'Côte d'Ivoire' in Excel formulas?",
    answer:
      "Different operating systems and CSV exports use UTF-8 vs Windows-1252 character encodings. In Excel, always import using 'Data > From Text/CSV' and ensure File Origin is set to '65001 : Unicode (UTF-8)'. If using VLOOKUP or XLOOKUP, sanitize names with TRIM() and CLEAN() to prevent phantom whitespace lookup mismatches.",
  },
  {
    category: "Mathematical accuracy",
    question: "Why does my Profit Margin differ from the rubric benchmark, and what is the exact formula?",
    answer:
      "The #1 student mistake is confusing markup with margin. Markup is Profit divided by Cost. Margin is Profit divided by Revenue: Profit Margin % = (Revenue − Cost) / Revenue. Additionally, never average individual transaction percentage cells in pivot tables — always compute a calculated field so percentages are weighted by volume.",
  },
  {
    category: "GitHub submission",
    question: "I don't know Git terminal commands. How do I publish my project to GitHub?",
    answer:
      "You do NOT need Git command-line knowledge to submit. GitHub's web interface allows you to create a public repository, click 'Upload files', drag in your working dashboard file (.xlsx or .pbix) and screenshot, and use 'Add file > Create new file' to paste your README with your 3 findings.",
  },
  {
    category: "Deadlines and policy",
    question: "Can I update or resubmit my project if I catch an error before the Friday deadline?",
    answer:
      "Yes. The platform allows unlimited resubmissions up until Friday 11:59 PM. Simply paste your updated GitHub link and reflection text; our system will re-verify the repository and timestamp the latest submission.",
  },
  {
    category: "Scoring and assessments",
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

  return (
    <section className="bg-[#FFFFFF] border border-[#102038]/15 rounded-xl p-6 sm:p-8 space-y-6 text-left">
      {/* Announcements Notice: 1px border + left-edge 4px accent bar, no pill */}
      <div className="bg-[#FAF8F3] border border-[#102038]/15 border-l-4 border-l-[#5BBFA4] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0 mt-0.5">
          <Megaphone size={18} weight="fill" className="text-[#5BBFA4]" />
        </div>
        <div className="space-y-1 text-xs font-sans text-left">
          <div className="font-sans font-semibold text-[#102038] text-sm">
            Cohort bulletin: Week 1 live class and submission window
          </div>
          <p className="text-[#4A5568] leading-relaxed">
            Welcome to the Data Analysis cohort! Week 1 project briefs and datasets are live below. Remember to keep your repository public and verify that all currency and UTF-8 encoding formulas match the rubric requirements.
          </p>
        </div>
      </div>

      {/* Header: Sentence-case, no all-caps tracking, no pill filter row */}
      <div className="border-b border-[#102038]/10 pb-4 text-left">
        <div className="text-xs font-sans text-[#7E8B9B]">
          Technical briefing and guidance
        </div>
        <h2 className="font-display text-xl font-bold text-[#102038] mt-1">
          Frequently encountered questions
        </h2>
        <p className="text-xs font-sans text-[#7E8B9B] mt-0.5">
          Official guidance on UTF-8 encodings, profit margin calculation formulas, and repository submission requirements.
        </p>
      </div>

      {/* Plain Expandable List: Clean 1px borders, min 44px touch height, no all-caps categories, reduced-motion safe */}
      <div className="space-y-2.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.question}
              className="border border-[#102038]/15 rounded-lg overflow-hidden bg-[#FAF8F3] transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="w-full min-h-[44px] p-4 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="font-sans font-semibold text-sm text-[#102038] block leading-snug">
                  {faq.question}
                </span>
                <div
                  className={`w-7 h-7 rounded-md bg-[#FFFFFF] border border-[#102038]/15 flex items-center justify-center text-[#102038] shrink-0 transition-transform duration-150 motion-reduce:transition-none ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <CaretDown size={14} weight="bold" />
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs font-sans text-[#4A5568] leading-relaxed border-t border-[#102038]/10 bg-[#FFFFFF]">
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
