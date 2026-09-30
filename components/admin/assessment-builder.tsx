"use client";

import { useState, useTransition } from "react";
import { createQuestionAction } from "@/lib/actions/assessments";
import {
  CaretDown,
  CaretUp,
  CheckCircle,
  FilePlus,
  GraduationCap,
  PlusCircle,
  Question,
  Sparkle,
  SpinnerGap,
  X,
} from "@phosphor-icons/react";

interface AssessmentItem {
  id: string;
  weekId: string;
  title: string;
  isFinal: boolean;
  passingScore: number;
  questions: {
    id: string;
    orderNumber: number;
    prompt: string;
    correctOptionId: string;
    points: number;
    options: {
      id: string;
      text: string;
      explanation: string | null;
    }[];
  }[];
}

interface AssessmentBuilderProps {
  assessments: AssessmentItem[];
}

export function AssessmentBuilder({ assessments }: AssessmentBuilderProps) {
  const [expandedId, setExpandedId] = useState<string | null>(assessments[0]?.id || null);
  const [activeModalAssessmentId, setActiveModalAssessmentId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Question form state
  const [prompt, setPrompt] = useState("");
  const [points, setPoints] = useState(20);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [options, setOptions] = useState([
    { text: "", explanation: "" },
    { text: "", explanation: "" },
    { text: "", explanation: "" },
    { text: "", explanation: "" },
  ]);

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text };
      return copy;
    });
  };

  const handleOptionExplanationChange = (index: number, explanation: string) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], explanation };
      return copy;
    });
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalAssessmentId) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate options
    if (options.some((opt) => !opt.text.trim())) {
      setErrorMsg("Please fill in text for all 4 multiple-choice options.");
      return;
    }

    startTransition(async () => {
      try {
        await createQuestionAction({
          assessmentId: activeModalAssessmentId,
          prompt,
          points,
          correctOptionIndex: correctIndex,
          options,
        });

        setSuccessMsg("Question added successfully!");
        setTimeout(() => {
          setActiveModalAssessmentId(null);
          setSuccessMsg(null);
          setPrompt("");
          setOptions([
            { text: "", explanation: "" },
            { text: "", explanation: "" },
            { text: "", explanation: "" },
            { text: "", explanation: "" },
          ]);
        }, 1200);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Failed to add question.");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-display font-bold text-[#102038]">
          Assessment Engine &amp; Question Builder
        </h2>
        <p className="text-xs font-sans text-[#7E8B9B]">
          Deterministic multiple-choice checkpoints. Correct options are pre-stored and evaluated instantly on submit.
        </p>
      </div>

      <div className="space-y-3">
        {assessments.map((assessment) => {
          const isExpanded = expandedId === assessment.id;

          return (
            <div
              key={assessment.id}
              className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl overflow-hidden shadow-sm transition-all"
            >
              {/* Assessment Header Strip */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : assessment.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#FAF8F3]/60 transition-colors select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF8F3] border border-[#E8E2D6] flex items-center justify-center text-[#102038]">
                    {assessment.isFinal ? (
                      <Sparkle size={16} weight="fill" className="text-[#8C6D23]" />
                    ) : (
                      <GraduationCap size={16} weight="bold" className="text-[#5BBFA4]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#102038]">
                        {assessment.title}
                      </span>
                      {assessment.isFinal && (
                        <span className="text-[10px] font-mono font-bold bg-[#FDF8ED] text-[#8C6D23] border border-[#BA9C60] px-2 py-0.5 rounded-full">
                          Capstone Gated
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-[#7E8B9B] mt-0.5">
                      Passing Score: {assessment.passingScore}% &bull; {assessment.questions.length} Questions Configured
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveModalAssessmentId(assessment.id);
                      setErrorMsg(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-semibold text-[#102038] bg-[#FAF8F3] hover:bg-[#E8E2D6] border border-[#E8E2D6] rounded-lg transition-colors cursor-pointer"
                  >
                    <PlusCircle size={14} weight="bold" />
                    <span>Add Question</span>
                  </button>

                  <div className="text-[#7E8B9B]">
                    {isExpanded ? <CaretUp size={16} weight="bold" /> : <CaretDown size={16} weight="bold" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Questions List */}
              {isExpanded && (
                <div className="p-4 sm:p-5 border-t border-[#E8E2D6] bg-[#FAF8F3]/40 space-y-4 font-sans text-xs">
                  {assessment.questions.length === 0 ? (
                    <div className="text-center py-6 text-[#7E8B9B] font-mono">
                      No questions configured yet for this assessment. Click &ldquo;Add Question&rdquo; to build one.
                    </div>
                  ) : (
                    assessment.questions.map((q, qIndex) => (
                      <div
                        key={q.id}
                        className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-xl p-4 space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-sm text-[#102038] leading-relaxed">
                            <span className="font-mono text-xs text-[#7E8B9B] mr-2">
                              #{qIndex + 1}
                            </span>
                            {q.prompt}
                          </div>
                          <span className="font-mono text-[11px] text-[#7E8B9B] shrink-0 bg-[#FAF8F3] px-2 py-0.5 rounded border border-[#E8E2D6]">
                            {q.points} pts
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                          {q.options.map((opt, optIndex) => {
                            const isCorrect = opt.id === q.correctOptionId;

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                                  isCorrect
                                    ? "bg-[#EBF7F4] border-[#77CBB3] text-[#1E4D40] font-semibold"
                                    : "bg-[#FAF8F3] border-[#E8E2D6] text-[#4A5568]"
                                }`}
                              >
                                <span className="font-bold shrink-0">
                                  {String.fromCharCode(65 + optIndex)}.
                                </span>
                                <div className="space-y-1">
                                  <div>{opt.text}</div>
                                  {isCorrect && (
                                    <div className="text-[10px] text-[#1E4D40] flex items-center gap-1 font-sans">
                                      <CheckCircle size={11} weight="fill" className="text-[#5BBFA4]" />
                                      <span>Correct Key</span>
                                    </div>
                                  )}
                                  {opt.explanation && (
                                    <div className="text-[10px] text-[#7E8B9B] font-sans italic">
                                      Rationale: {opt.explanation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add Assessment Question */}
      {activeModalAssessmentId && (
        <div className="fixed inset-0 z-50 bg-[#102038]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5BBFA4]" />
                <h3 className="font-display font-bold text-lg text-[#102038]">
                  Add Multiple-Choice Question
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalAssessmentId(null)}
                className="text-[#7E8B9B] hover:text-[#102038] p-1 rounded-md"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-sans px-4 py-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="bg-[#EBF7F4] border border-[#77CBB3] text-[#1E4D40] text-xs font-sans px-4 py-3 rounded-lg flex items-center gap-1.5">
                <CheckCircle size={15} weight="fill" className="text-[#5BBFA4]" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateQuestion} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-mono font-semibold text-[#102038]">
                  Question Prompt
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. When aggregating Gross Profit Margin across 50k transactions, what is the required formula?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg text-sm text-[#102038] focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                />
              </div>

              <div className="w-32 space-y-1">
                <label className="font-mono font-semibold text-[#102038]">Points</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-[#FAF8F3] border border-[#E8E2D6] rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                />
              </div>

              <div className="space-y-3 pt-1">
                <div className="font-mono font-semibold text-[#102038] flex items-center justify-between">
                  <span>Multiple Choice Options</span>
                  <span className="text-[11px] text-[#7E8B9B] font-normal">
                    Select the radio button next to the correct answer key
                  </span>
                </div>

                {options.map((opt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border space-y-2 ${
                      correctIndex === idx
                        ? "bg-[#EBF7F4]/50 border-[#77CBB3]"
                        : "bg-[#FAF8F3] border-[#E8E2D6]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={correctIndex === idx}
                        onChange={() => setCorrectIndex(idx)}
                        className="text-[#102038] focus:ring-[#5BBFA4] cursor-pointer"
                      />
                      <span className="font-mono font-bold text-[#102038]">
                        Option {String.fromCharCode(65 + idx)} {correctIndex === idx && "(Correct Answer)"}
                      </span>
                    </div>

                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text...`}
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E2D6] rounded-lg text-xs text-[#102038] focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                    />

                    {correctIndex === idx && (
                      <input
                        type="text"
                        placeholder="Explanation rationale shown to students post-grading..."
                        value={opt.explanation}
                        onChange={(e) => handleOptionExplanationChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#FFFFFF] border border-[#E8E2D6] rounded-lg text-xs italic text-[#4A5568] focus:outline-none focus:ring-2 focus:ring-[#5BBFA4]"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#E8E2D6]">
                <button
                  type="button"
                  onClick={() => setActiveModalAssessmentId(null)}
                  className="px-3.5 py-2 text-xs font-sans font-medium text-[#4A5568] hover:text-[#102038] rounded-lg transition-colors cursor-pointer"
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
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
