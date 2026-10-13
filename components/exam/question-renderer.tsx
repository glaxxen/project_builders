"use client";

import React from "react";

interface QuestionRendererProps {
  text: string;
}

export function QuestionRenderer({ text }: QuestionRendererProps) {
  // Regex to split fenced code blocks: ```lang\ncode``` or ```code```
  const codeBlockRegex = /```(?:(\w+)?\n)?([\s\S]*?)```/g;

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const textBefore = text.slice(lastIndex, match.index);
    if (textBefore) {
      segments.push(renderFormattedParagraph(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || "sql";
    const codeContent = match[2]?.trimEnd() || "";

    segments.push(
      <div
        key={`code-${match.index}`}
        className="my-4 rounded-xl border border-[#233B5F] bg-[#0A1424] overflow-hidden text-left shadow-md"
      >
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#102038] border-b border-[#233B5F] text-[11px] font-mono font-medium text-[#FAF8F3]/60">
          <span className="uppercase tracking-wider">{language} query block</span>
          <span>monospaced syntax</span>
        </div>
        <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-[#FAF8F3] leading-relaxed whitespace-pre selection:bg-[#5BBFA4]/30 selection:text-white">
          <code>{codeContent}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  const remainingText = text.slice(lastIndex);
  if (remainingText) {
    segments.push(renderFormattedParagraph(remainingText, `text-${lastIndex}`));
  }

  return <div className="space-y-3 leading-relaxed text-[#102038]">{segments}</div>;
}

function renderFormattedParagraph(paragraphText: string, keyPrefix: string) {
  // Handle inline code: `code`
  const lines = paragraphText.split("\n");

  return (
    <div key={keyPrefix} className="space-y-2">
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={`${keyPrefix}-line-${lIdx}`} className="h-2" />;

        const inlineCodeRegex = /`([^`]+)`/g;
        const inlineSegments: React.ReactNode[] = [];
        let curIdx = 0;
        let inlineMatch: RegExpExecArray | null;

        while ((inlineMatch = inlineCodeRegex.exec(line)) !== null) {
          if (inlineMatch.index > curIdx) {
            inlineSegments.push(line.slice(curIdx, inlineMatch.index));
          }
          inlineSegments.push(
            <code
              key={`inline-${curIdx}`}
              className="px-1.5 py-0.5 rounded-md bg-[#FAF8F3] border border-[#102038]/20 text-[#102038] font-mono text-xs sm:text-sm font-semibold"
            >
              {inlineMatch[1]}
            </code>
          );
          curIdx = inlineMatch.index + inlineMatch[0].length;
        }

        if (curIdx < line.length) {
          inlineSegments.push(line.slice(curIdx));
        }

        return (
          <p
            key={`${keyPrefix}-line-${lIdx}`}
            className="text-base sm:text-lg font-sans font-medium text-[#102038] leading-relaxed"
          >
            {inlineSegments}
          </p>
        );
      })}
    </div>
  );
}
