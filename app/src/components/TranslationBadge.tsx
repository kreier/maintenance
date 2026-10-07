import React from "react";
import type { TranslationStatus } from "../types";
import { CheckCircle2, Sparkles, FileEdit, AlertTriangle } from "lucide-react";

interface TranslationBadgeProps {
  status: TranslationStatus;
  isStale?: boolean;
}

export const TranslationBadge: React.FC<TranslationBadgeProps> = ({
  status,
  isStale,
}) => {
  if (isStale) {
    return (
      <span
        title="Source text has been updated since this translation was approved"
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300"
      >
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Outdated
      </span>
    );
  }

  switch (status) {
    case "HUMAN-APPROVED":
      return (
        <span
          title="Verified and approved by a qualified human reviewer"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Verified
        </span>
      );
    case "AI-PROPOSED":
      return (
        <span
          title="Proposed by AI model, pending human review"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-300"
        >
          <Sparkles className="w-3 h-3 text-purple-600" />
          AI Proposed
        </span>
      );
    case "DRAFT":
    default:
      return (
        <span
          title="Draft translation"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300"
        >
          <FileEdit className="w-3 h-3 text-slate-500" />
          Draft
        </span>
      );
  }
};
