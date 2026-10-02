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
      "Zero AI is used in grading. Quizzes are 5 to 10 question multiple-choice assessments checking specific data points, formula syntax, and business conclusions from that week's brief. Scoring is 100% deterministic and runs instantly upon submit.",
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
    <section className="bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-sm">
      {/* Announcements Notice: Bold, Authoritative Bar */}
      <div className="bg-[#FAF8F3] border-2 border-[#102038]/15 border-l-6 border-l-[#5BBFA4] rounded-xl p-5 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0 mt-0.5 border border-[#5BBFA4]/30">
          <Megaphone size={20} weight="fill" className="text-[#5BBFA4]" />
        </div>
        <div className="space-y-1 text-left">
          <div className="font-bold text-[#102038] text-base sm:text-lg font-display">
            Cohort Bulletin: Week 2 Live Analytics &amp; Examination Window
          </div>
          <p className="text-sm sm:text-base font-normal text-[#102038]/90 leading-relaxed">
            Welcome to Week 2 of the Data Analysis cohort! The FinTech Customer Churn brief, dataset, and official checkpoint examination are live above. Complete the 5-question exam and submit your public GitHub repo before Friday 11:59 PM.
          </p>
        </div>
      </div>

      {/* Header: Sentence-case, Bold display text */}
      <div className="border-b-2 border-[#102038]/10 pb-4 text-left">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#BA9C60]">
          Technical Briefing &amp; Guidance
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102038] mt-1">
          Frequently Encountered Questions
        </h2>
        <p className="text-sm sm:text-base font-medium text-[#102038]/70 mt-1">
          Official guidance on UTF-8 encodings, profit margin calculation formulas, and repository submission requirements.
        </p>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="bg-[#FAF8F3]/60 border-2 border-[#102038]/15 rounded-xl overflow-hidden transition-all text-left"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="w-full min-h-[54px] p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer text-left hover:bg-[#FAF8F3] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-left">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#BA9C60] shrink-0">
                    {faq.category}
                  </span>
                  <span className="font-sans font-bold text-sm sm:text-base text-[#102038]">
                    {faq.question}
                  </span>
                </div>

                <div
                  className={`w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#102038]/20 flex items-center justify-center text-[#102038] transition-transform duration-150 shrink-0 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <CaretDown size={16} weight="bold" />
                </div>
              </button>

              {isOpen && (
                <div className="p-5 sm:p-6 border-t border-[#102038]/10 bg-[#FFFFFF] text-left">
                  <p className="text-sm sm:text-base font-normal text-[#102038]/90 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
