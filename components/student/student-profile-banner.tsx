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

  // If already set and modal is closed, show a minimal badge with edit option
  if (!isDefaultName && !isOpen) {
    return (
      <div className="flex items-center justify-between bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl px-4 py-2.5 shadow-2xs text-xs font-sans">
        <div className="flex items-center gap-2">
          <UserCheck size={16} weight="bold" className="text-[#5BBFA4]" />
          <span className="text-[#7E8B9B]">Registered Builder:</span>
          <strong className="text-[#102038] font-semibold">{savedName}</strong>
        </div>

        <button
          onClick={() => {
            setName(savedName);
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#7E8B9B] hover:text-[#102038] transition-colors cursor-pointer"
        >
          <PencilSimple size={12} weight="bold" />
          <span>Edit</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#5BBFA4]/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3 relative">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EBF7F4] text-[#1E4D40] flex items-center justify-center">
            <Sparkle size={18} weight="fill" className="text-[#5BBFA4]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-[#102038]">
              {isDefaultName ? "Complete Your Builder Profile" : "Update Your Official Name"}
            </h3>
            <p className="text-xs font-sans text-[#7E8B9B]">
              Your official full name appears on your verified graduation certificate and instructor grading rosters.
            </p>
          </div>
        </div>

        {!isDefaultName && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#7E8B9B] hover:text-[#102038] p-1 cursor-pointer"
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
          className="flex-1 px-3.5 py-2 text-xs font-sans bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-[#102038] focus:outline-none focus:border-[#102038] focus:ring-1 focus:ring-[#102038]"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <SpinnerGap size={14} weight="bold" className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Official Name</span>
          )}
        </button>
      </form>

      {error && <p className="text-xs text-red-600 font-sans">{error}</p>}
    </div>
  );
}
