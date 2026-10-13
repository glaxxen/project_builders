"use client";

import Link from "next/link";
import { CheckCircle, ShieldCheck, ArrowLeft, CalendarBlank } from "@phosphor-icons/react";

interface SubmittedScreenProps {
  submittedAt: string | null;
}

export function SubmittedScreen({ submittedAt }: SubmittedScreenProps) {
  const formattedTime = submittedAt
    ? new Date(submittedAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date().toLocaleString();

  return (
    <div className="max-w-xl mx-auto my-12 bg-[#FFFFFF] border-2 border-[#102038]/15 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl text-left">
      <div className="w-16 h-16 rounded-2xl bg-[#EBF7F4] text-[#1E4D40] border-2 border-[#5BBFA4]/40 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle size={36} weight="fill" className="text-[#5BBFA4]" />
      </div>

      <div className="space-y-2 text-center">
        <div className="text-xs uppercase tracking-widest font-sans font-semibold text-[#5BBFA4]">
          Assessment Completed
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102038] tracking-tight">
          Submitted successfully
        </h1>
        <p className="text-sm sm:text-base font-sans text-[#102038]/70 leading-relaxed max-w-md mx-auto pt-1">
          Your Capstone Final Assessment attempt has been securely received and recorded on the assessment server.
        </p>
      </div>

      {/* Submission Receipt Box */}
      <div className="bg-[#FAF8F3] border border-[#102038]/15 rounded-2xl p-5 space-y-3 text-left">
        <div className="flex items-center justify-between text-xs font-mono text-[#102038]/60 pb-2 border-b border-[#102038]/10">
          <span>Official Submission Timestamp</span>
          <ShieldCheck size={16} weight="fill" className="text-[#5BBFA4]" />
        </div>
        <div suppressHydrationWarning className="flex items-center gap-2.5 text-sm sm:text-base font-sans font-semibold text-[#102038]">
          <CalendarBlank size={18} weight="bold" className="text-[#BA9C60]" />
          <span>{formattedTime}</span>
        </div>
        <p className="text-xs font-sans text-[#102038]/60 pt-1 leading-relaxed">
          Standard policy strictly enforces one attempt per student. Your official performance record has been transmitted to cohort instructors.
        </p>
      </div>

      <div className="pt-2 text-center">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center justify-center gap-2.5 min-h-[48px] px-8 py-3 rounded-xl bg-[#102038] hover:bg-[#233B5F] text-[#FAF8F3] text-sm font-sans font-semibold shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft size={16} weight="bold" />
          <span>Return to Student Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
