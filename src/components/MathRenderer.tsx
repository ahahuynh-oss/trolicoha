import React, { useEffect, useRef } from "react";

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).MathJax && (window as any).MathJax.typesetPromise) {
      (window as any).MathJax.typesetPromise([containerRef.current]).catch((err: any) => {
        console.warn("MathJax typeset error:", err);
      });
    }
  }, [content]);

  // Basic formatting helper for bold, italics, bullets and line breaks
  const formatText = (text: string) => {
    if (!text) return "";
    return text
      .split("\n")
      .map((line, idx) => {
        // Heading
        if (line.startsWith("### ")) {
          return `<h4 class="font-bold text-slate-800 text-base mt-2 mb-1">${line.replace("### ", "")}</h4>`;
        }
        if (line.startsWith("## ")) {
          return `<h3 class="font-bold text-slate-800 text-lg mt-3 mb-1 text-blue-700">${line.replace("## ", "")}</h3>`;
        }
        // Bullet
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          return `<div class="flex items-start gap-2 my-1"><span class="text-amber-500 font-bold">•</span><span>${line.trim().substring(2)}</span></div>`;
        }
        // Numbered list
        const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return `<div class="flex items-start gap-2 my-1"><span class="font-semibold text-blue-600">${numMatch[1]}.</span><span>${numMatch[2]}</span></div>`;
        }
        if (line.trim() === "") {
          return '<div class="h-2"></div>';
        }
        return `<p class="my-1 leading-relaxed">${line}</p>`;
      })
      .join("");
  };

  return (
    <div
      ref={containerRef}
      className={`math-content prose max-w-none text-slate-700 text-sm md:text-base leading-relaxed break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: formatText(content) }}
    />
  );
};
