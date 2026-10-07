import React, { useState } from "react";
import type { LocaleCode } from "../types";
import {
  getObjectById,
  getRoomById,
  getEventsByObjectId,
} from "../services/data-loader";
import {
  computeAge,
  computeNextMaintenance,
  computeOverdueStatus,
  checkStaleTranslations,
} from "../types";
import { TranslationBadge } from "../components/TranslationBadge";
import {
  ArrowLeft,
  Copy,
  Check,
  Calendar,
  Clock,
  Wrench,
  FileText,
  AlertCircle,
  Building,
  CheckCircle2,
  Tag,
  ExternalLink,
} from "lucide-react";

interface ObjectDetailPageProps {
  objectId: string;
  currentLocale: LocaleCode;
}

export const ObjectDetailPage: React.FC<ObjectDetailPageProps> = ({
  objectId,
  currentLocale,
}) => {
  const [copied, setCopied] = useState(false);
  const object = getObjectById(objectId);

  if (!object) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Object Not Found</h2>
        <p className="text-sm text-slate-500">
          No equipment or facility asset exists with Stable ID: <code className="font-mono font-bold text-slate-700">{objectId}</code>
        </p>
        <a
          href="#/equipment"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Equipment Catalog</span>
        </a>
      </div>
    );
  }

  const room = getRoomById(object.room_id);
  const events = getEventsByObjectId(object.id);

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(object.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Facts & Calculations
  const age = computeAge(object.installed);

  let nextServiceDate: string | undefined;
  let overdueStatus: { isOverdue: boolean; daysOverdue: number; isDueSoon: boolean; daysUntilDue: number } | undefined;

  if (object.maintenance?.last_serviced) {
    nextServiceDate = computeNextMaintenance(
      object.maintenance.last_serviced,
      object.maintenance.interval_months
    );
    overdueStatus = computeOverdueStatus(nextServiceDate);
  }

  const staleCheck = checkStaleTranslations(object.name);
  const textEntry = object.name[currentLocale] || object.name.en;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <a
          href="#/equipment"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Equipment</span>
        </a>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-slate-900 text-white font-mono font-bold text-sm rounded-lg tracking-wider">
              {object.id}
            </span>

            <button
              onClick={copyIdToClipboard}
              title="Copy Stable ID"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
              {object.category}
            </span>

            {object.status === "active" ? (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {object.status.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {textEntry.text}
          </h1>

          {room && (
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>Location:</span>
              <a href={`#/rooms/${room.id}`} className="font-semibold text-facility-600 hover:underline">
                {room.name[currentLocale] || room.name.en} ({room.floor})
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Facts vs Derived Calculations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Specs & Facts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-facility-600" />
            <span>Asset Specifications</span>
          </h2>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400 font-medium">Manufacturer</dt>
              <dd className="font-semibold text-slate-800">{object.manufacturer || "—"}</dd>
            </div>

            <div>
              <dt className="text-xs text-slate-400 font-medium">Model</dt>
              <dd className="font-semibold text-slate-800">{object.model || "—"}</dd>
            </div>

            <div>
              <dt className="text-xs text-slate-400 font-medium">Serial Number</dt>
              <dd className="font-mono text-xs font-semibold text-slate-800">{object.serial_number || "—"}</dd>
            </div>

            <div>
              <dt className="text-xs text-slate-400 font-medium">Install Date (Raw Fact)</dt>
              <dd className="font-mono text-xs font-semibold text-slate-800">{object.installed}</dd>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-100">
              <dt className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Computed Equipment Age (Derived)</span>
              </dt>
              <dd className="text-base font-bold text-slate-900 mt-0.5">
                {age.years} years, {age.months} months
                <span className="text-xs font-normal text-slate-400 ml-2">({age.totalDays} days total)</span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Maintenance Schedule */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-facility-600" />
            <span>Maintenance Schedule</span>
          </h2>

          {object.maintenance ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Service Interval</span>
                  <div className="font-semibold text-slate-800">
                    Every {object.maintenance.interval_months} months
                  </div>
                </div>

                <div>
                  <span className="text-xs text-slate-400 font-medium">Last Serviced</span>
                  <div className="font-semibold text-slate-800 font-mono text-xs">
                    {object.maintenance.last_serviced || "Never recorded"}
                  </div>
                </div>
              </div>

              {nextServiceDate && (
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Next Scheduled Service</span>
                      <div className="font-bold text-slate-900 font-mono">{nextServiceDate}</div>
                    </div>

                    {overdueStatus?.isOverdue ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-md">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {overdueStatus.daysOverdue} days overdue
                      </span>
                    ) : overdueStatus?.isDueSoon ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-md">
                        Due in {overdueStatus.daysUntilDue} days
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                        On Schedule
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No recurring maintenance schedule defined.</p>
          )}
        </div>
      </div>

      {/* Multilingual Review Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Multilingual Documentation States</h2>
          <span className="text-xs text-slate-500">Governed by Phase 1 Schema Review Workflow</span>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
          {(["en", "vi", "ko"] as LocaleCode[]).map((loc) => {
            const entry = object.name[loc];
            const isStale = loc !== "en" && staleCheck.staleLocales.includes(loc as any);

            return (
              <div key={loc} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div className="flex items-start gap-3">
                  <span className="uppercase text-xs font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded font-mono">
                    {loc}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {entry?.text || <span className="text-slate-400 italic">Not translated</span>}
                    </div>
                    {entry && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        Last updated: {new Date(entry.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  {entry ? (
                    <TranslationBadge status={entry.status} isStale={isStale} />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Missing</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-facility-600" />
          <span>Manuals & Documentation ({object.documents.length})</span>
        </h2>

        {object.documents.length === 0 ? (
          <p className="text-xs text-slate-400">No documents attached.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {object.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 truncate">{doc.title}</div>
                    <div className="text-slate-400 font-mono text-[11px] truncate">{doc.filename}</div>
                  </div>
                </div>

                <a
                  href={`#/documents/${doc.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Document proxying to Cloudflare R2 will be active in Phase 5. In demo mode, documents are synthetic fixtures.`);
                  }}
                  className="ml-3 p-1.5 text-slate-500 hover:text-facility-600 hover:bg-white rounded transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service History Events */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-facility-600" />
          <span>Service & Maintenance History ({events.length})</span>
        </h2>

        {events.length === 0 ? (
          <p className="text-xs text-slate-400">No maintenance events recorded for this asset yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((evt) => (
              <div key={evt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-200 rounded text-slate-800">
                      {evt.id}
                    </span>
                    <span className="text-xs uppercase font-semibold text-slate-500">
                      {evt.type}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-medium text-slate-600">
                    {evt.date}
                  </span>
                </div>

                <p className="text-sm text-slate-800">
                  {evt.summary[currentLocale]?.text || evt.summary.en.text}
                </p>

                <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-200/60">
                  <span>Performed by: <strong className="text-slate-700">{evt.performed_by}</strong></span>
                  {evt.cost && (
                    <span>Cost: <strong className="text-slate-700">{evt.cost.amount.toLocaleString()} {evt.cost.currency}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
