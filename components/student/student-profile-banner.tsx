"use client";

import { useState } from "react";
import { UserCheck, Sparkle, SpinnerGap, PencilSimple, X } from "@phosphor-icons/react";
import { updateStudentNameAction } from "@/lib/actions/users";

interface StudentProfileBannerProps {
  currentName: string | null;
  studentEmail: string;
}

export function StudentProfileBanner({
  currentName,
  studentEmail,
}: StudentProfileBannerProps) {
  const defaultFallback = studentEmail.split("@")[0];
  const isDefaultName = !currentName || currentName === defaultFallback;

  const [name, setName] = useState(currentName || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedName, setSavedName] = useState(currentName || defaultFallback);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide your full legal or preferred name.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await updateStudentNameAction(name.trim());
      setSavedName(name.trim());
      setIsOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile name.");
    } finally {
      setIsLoading(false);
    }
  }

  // If already set and modal is closed, show a minimal clean banner with edit option
  if (!isDefaultName && !isOpen) {
    return (
      <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#102038]/15 rounded-xl px-5 py-3 text-xs font-sans text-left">
        <div className="flex items-center gap-2.5">
          <UserCheck size={16} weight="bold" className="text-[#5BBFA4]" />
          <span className="text-[#7E8B9B]">Registered builder:</span>
          <strong className="text-[#102038] font-semibold">{savedName}</strong>
        </div>

        <button
          type="button"
          onClick={() => {
            setName(savedName || "");
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-3 text-xs font-sans text-[#7E8B9B] hover:text-[#102038] transition-colors cursor-pointer"
        >
          <PencilSimple size={13} weight="bold" />
          <span>Edit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#102038]/15 border-l-4 border-l-[#5BBFA4] rounded-xl p-5 sm:p-6 space-y-3 relative text-left">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkle size={16} weight="fill" className="text-[#5BBFA4]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-[#102038]">
              {isDefaultName ? "Complete your builder profile" : "Update your official name"}
            </h3>
            <p className="text-xs font-sans text-[#7E8B9B] mt-0.5">
              Your official full name appears on your verified graduation certificate and instructor grading rosters.
            </p>
          </div>
        </div>

        {!isDefaultName && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7E8B9B] hover:text-[#102038] rounded-lg cursor-pointer transition-colors"
            aria-label="Close edit"
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Samuel Adebayo"
          required
          disabled={isLoading}
          className="flex-1 min-h-[44px] px-3.5 py-2.5 text-xs font-sans bg-[#FAF8F3] border border-[#102038]/20 rounded-lg text-[#102038] focus:outline-none focus:border-[#102038] focus:ring-1 focus:ring-[#102038]"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <SpinnerGap size={14} weight="bold" className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save official name</span>
          )}
        </button>
      </form>

      {error && <p className="text-xs text-[#B91C1C] font-sans">{error}</p>}
    </div>
  );
}
