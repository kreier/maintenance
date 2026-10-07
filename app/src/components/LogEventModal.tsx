import React, { useState } from "react";
import type { FacilityObject, MaintenanceEvent, LocaleCode } from "../types";
import { X, Wrench, CheckCircle } from "lucide-react";

interface LogEventModalProps {
  object: FacilityObject | null;
  currentLocale: LocaleCode;
  onClose: () => void;
  onSubmit: (newEvent: MaintenanceEvent, updatedObject: FacilityObject) => void;
}

export const LogEventModal: React.FC<LogEventModalProps> = ({
  object,
  currentLocale,
  onClose,
  onSubmit,
}) => {
  if (!object) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(todayStr);
  const [type, setType] = useState<"service" | "inspection" | "repair" | "replacement">("service");
  const [performedBy, setPerformedBy] = useState("Da Nang Technical Services");
  const [costAmount, setCostAmount] = useState<number>(500000);
  const [costCurrency, setCostCurrency] = useState("VND");
  const [summaryText, setSummaryText] = useState("Routine inspection and scheduled maintenance performed.");
  const [notes, setNotes] = useState("All operating parameters verified within factory tolerances.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventId = `EVT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newEvent: MaintenanceEvent = {
      id: eventId,
      facility_id: object.facility_id,
      object_id: object.id,
      date,
      type,
      performed_by: performedBy,
      summary: {
        en: {
          text: summaryText,
          status: "HUMAN-APPROVED",
          updated_at: new Date().toISOString(),
        },
        vi: {
          text: `Đã thực hiện bảo dưỡng và kiểm tra định kỳ (${summaryText}).`,
          status: "AI-PROPOSED",
          updated_at: new Date().toISOString(),
        },
      },
      notes,
      cost: costAmount > 0 ? { amount: costAmount, currency: costCurrency } : undefined,
      documents: [],
      created_at: new Date().toISOString(),
    };

    // Update the object's last_serviced fact and status
    const updatedObject: FacilityObject = {
      ...object,
      status: "active",
      maintenance: object.maintenance
        ? {
            ...object.maintenance,
            last_serviced: date,
          }
        : undefined,
    };

    onSubmit(newEvent, updatedObject);
  };

  const objectName = object.name[currentLocale]?.text || object.name.en.text;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-facility-50 text-facility-600 rounded-lg">
              <Wrench className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Maintenance Event</h3>
              <p className="text-xs text-slate-500 font-mono">{object.id} • {objectName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date (Fact)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
              >
                <option value="service">Service / Maintenance</option>
                <option value="inspection">Safety Inspection</option>
                <option value="repair">Repair</option>
                <option value="replacement">Part Replacement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technician or Vendor Name
            </label>
            <input
              type="text"
              required
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Amount
              </label>
              <input
                type="number"
                min="0"
                value={costAmount}
                onChange={(e) => setCostAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Currency
              </label>
              <select
                value={costCurrency}
                onChange={(e) => setCostCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500 font-mono"
              >
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Summary Description
            </label>
            <textarea
              rows={2}
              required
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-facility-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-facility-600 hover:bg-facility-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Save & Recalculate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
