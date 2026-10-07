import React from "react";
import type { FacilityObject, LocaleCode, Room } from "../types";
import { computeAge, computeOverdueStatus, computeNextMaintenance, checkStaleTranslations } from "../types";
import { TranslationBadge } from "./TranslationBadge";
import {
  Wind,
  Zap,
  Flame,
  Tv,
  HelpCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface ObjectCardProps {
  object: FacilityObject;
  room?: Room;
  currentLocale: LocaleCode;
}

export const ObjectCard: React.FC<ObjectCardProps> = ({
  object,
  room,
  currentLocale,
}) => {
  // Locale text resolution with fallback to English
  const textEntry = object.name[currentLocale] || object.name.en;
  const staleCheck = checkStaleTranslations(object.name);
  const isStale = currentLocale !== "en" && staleCheck.staleLocales.includes(currentLocale as any);

  // Dynamic age calculation
  const age = computeAge(object.installed);

  // Maintenance calculations
  let isOverdue = false;
  let isDueSoon = false;
  let nextDate: string | undefined;

  if (object.maintenance?.last_serviced) {
    nextDate = computeNextMaintenance(
      object.maintenance.last_serviced,
      object.maintenance.interval_months
    );
    const overdue = computeOverdueStatus(nextDate);
    isOverdue = overdue.isOverdue;
    isDueSoon = overdue.isDueSoon;
  }

  // Category Icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "hvac":
        return <Wind className="w-4 h-4 text-sky-600" />;
      case "electrical":
        return <Zap className="w-4 h-4 text-amber-600" />;
      case "safety":
        return <Flame className="w-4 h-4 text-rose-600" />;
      case "av":
        return <Tv className="w-4 h-4 text-purple-600" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 text-white tracking-wide">
            {object.id}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="p-1.5 bg-slate-100 rounded-md" title={`Category: ${object.category.toUpperCase()}`}>
              {getCategoryIcon(object.category)}
            </span>
            <TranslationBadge status={textEntry.status} isStale={isStale} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
          <a
            href={`#/objects/${object.id}`}
            className="hover:text-facility-600 transition-colors"
          >
            {textEntry.text}
          </a>
        </h3>

        {/* Specs */}
        <div className="text-xs text-slate-500 mb-3 space-x-1.5">
          {object.manufacturer && <span className="font-medium text-slate-700">{object.manufacturer}</span>}
          {object.model && <span>• {object.model}</span>}
          {room && (
            <span>
              • in <a href={`#/rooms/${room.id}`} className="text-facility-600 hover:underline">{room.name[currentLocale] || room.name.en}</a>
            </span>
          )}
        </div>

        {/* Calculated metrics: Age & Maintenance */}
        <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs mb-4">
          <div>
            <div className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Age</span>
            </div>
            <div className="font-semibold text-slate-800">
              {age.years > 0 ? `${age.years}y ` : ""}
              {age.months}m
            </div>
          </div>

          <div>
            <div className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3" />
              <span>Next Service</span>
            </div>
            <div className="font-semibold text-slate-800">
              {nextDate || "Not scheduled"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div>
          {isOverdue ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Service Overdue
            </span>
          ) : isDueSoon ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Due Soon
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Status Normal
            </span>
          )}
        </div>

        <a
          href={`#/objects/${object.id}`}
          className="text-xs font-semibold text-facility-600 hover:text-facility-700 hover:underline"
        >
          View Details →
        </a>
      </div>
    </div>
  );
};
