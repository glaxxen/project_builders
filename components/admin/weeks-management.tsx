"use client";

import { useState, useTransition } from "react";
import type { Week } from "@/lib/db/schema";
import { toggleWeekPublishAction, createWeekAction } from "@/lib/actions/weeks";
import {
  Calendar,
  CheckCircle,
  Eye,
  EyeSlash,
  FilePlus,
  LinkSimple,
  SpinnerGap,
  Sparkle,
  X,
} from "@phosphor-icons/react";

interface WeeksManagementProps {
  weeks: Week[];
  cohortId: string;
}

export function WeeksManagement({ weeks, cohortId }: WeeksManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [actionWeekId, setActionWeekId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state
  const [weekNumber, setWeekNumber] = useState(weeks.length + 1);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [datasetUrl, setDatasetUrl] = useState("");
  const [slidesUrl, setSlidesUrl] = useState("");
  const [publishImmediate, setPublishImmediate] = useState(false);

  const handleToggle = (weekId: string, currentPublished: boolean) => {
    setActionWeekId(weekId);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await toggleWeekPublishAction(weekId, currentPublished);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to toggle status");
      } finally {
        setActionWeekId(null);
      }
    });
  };

  const handleCreateWeek = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      try {
        await createWeekAction({
          cohortId,
          weekNumber,
          title,
          brief,
          deadline,
          datasetUrl: datasetUrl || undefined,
          slidesUrl: slidesUrl || undefined,
          published: publishImmediate,
        });

        // Reset and close
        setShowCreateModal(false);
        setTitle("");
        setBrief("");
        setDeadline("");
        setDatasetUrl("");
        setSlidesUrl("");
        setPublishImmediate(false);
        setWeekNumber(weeks.length + 2);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "Failed to create week");
      }
    });
  };

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-[#102038]">
            Cohort Weeks &amp; Publishing Gate
          </h2>
          <p className="text-xs font-sans text-[#7E8B9B]">
            Interactive publishing control. Students only see weeks toggled to Published.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <FilePlus size={15} weight="bold" />
          <span>Add Curriculum Week</span>
        </button>
      </div>

      <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-[#FAF8F3] border-b border-[#E8E2D6] text-xs font-mono text-[#7E8B9B]">
                <th className="py-3 px-4 font-semibold">Week</th>
                <th className="py-3 px-4 font-semibold">Project Title &amp; Brief</th>
                <th className="py-3 px-4 font-semibold">Resources</th>
                <th className="py-3 px-4 font-semibold">Deadline</th>
                <th className="py-3 px-4 font-semibold text-right">Publication Gate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D6] font-sans">
              {weeks.map((week) => {
                const isItemPending = isPending && actionWeekId === week.id;

                return (
                  <tr key={week.id} className="hover:bg-[#FAF8F3]/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-xs text-[#102038] whitespace-nowrap">
                      Week {week.weekNumber}
                    </td>

                    <td className="py-3.5 px-4 min-w-[240px]">
                      <div className="font-semibold text-[#102038]">{week.title}</div>
                      <div className="text-xs text-[#7E8B9B] line-clamp-2 mt-0.5">
                        {week.brief}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono whitespace-nowrap text-[#7E8B9B]">
                      <div className="flex flex-col gap-1">
                        {week.datasetUrl ? (
                          <span className="inline-flex items-center gap-1 text-[#102038]">
                            <LinkSimple size={12} weight="bold" />
                            <span>Dataset attached</span>
                          </span>
                        ) : (
                          <span className="text-[#A0AEC0]">No dataset</span>
                        )}
                        {week.slidesUrl ? (
                          <span className="inline-flex items-center gap-1 text-[#102038]">
                            <LinkSimple size={12} weight="bold" />
                            <span>Guide attached</span>
                          </span>
                        ) : (
                          <span className="text-[#A0AEC0]">No guide</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-xs text-[#7E8B9B] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} weight="bold" />
                        <span>
                          {new Date(week.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggle(week.id, week.published)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                          week.published
                            ? "bg-[#EBF7F4] text-[#1E4D40] border border-[#77CBB3] hover:bg-[#D7EFE8]"
                            : "bg-[#FAF8F3] text-[#7E8B9B] border border-[#E8E2D6] hover:bg-[#E8E2D6] hover:text-[#102038]"
                        } ${isItemPending ? "opacity-60 cursor-wait" : ""}`}
                      >
                        {isItemPending ? (
                          <SpinnerGap size={13} weight="bold" className="animate-spin" />
                        ) : week.published ? (
                          <Eye size={13} weight="bold" />
                        ) : (
                          <EyeSlash size={13} weight="bold" />
                        )}
                        <span>{week.published ? "Published (Live)" : "Unpublished (Hidden)"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create New Week */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#102038]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5BBFA4]" />
                <h3 className="font-display font-bold text-lg text-[#102038]">
                  Add Curriculum Week
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#7E8B9B] hover:text-[#102038] p-1 rounded-md"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleCreateWeek} className="space-y-4 font-sans text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#102038]">
                    Week #
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    required
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-mono font-semibold text-[#102038]">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-[#102038]">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Supply Chain Inventory Variance Modeling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-semibold text-[#102038]">
                  Project Brief &amp; Requirements
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the expectations, datasets, and milestone requirements..."
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#7E8B9B]">
                    Dataset URL / Asset Path (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="/assets/data.xlsx or https://..."
                    value={datasetUrl}
                    onChange={(e) => setDatasetUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-[#7E8B9B]">
                    Slides / Guide URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="/assets/guide.docx or https://..."
                    value={slidesUrl}
                    onChange={(e) => setSlidesUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#E8E2D6]">
                <label className="flex items-center gap-2 text-xs font-mono font-semibold text-[#102038] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishImmediate}
                    onChange={(e) => setPublishImmediate(e.target.checked)}
                    className="rounded text-[#102038] focus:ring-[#5BBFA4] w-4 h-4 cursor-pointer"
                  />
                  <span>Publish immediately to students</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-2 text-xs font-sans font-medium text-[#4A5568] hover:text-[#102038] rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-sans font-semibold text-[#FAF8F3] bg-[#102038] hover:bg-[#233B5F] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? (
                      <SpinnerGap size={14} weight="bold" className="animate-spin" />
                    ) : (
                      <CheckCircle size={14} weight="bold" />
                    )}
                    <span>Save Week</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
