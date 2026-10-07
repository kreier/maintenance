import React, { useState } from "react";
import type { FacilityObject, LocaleCode, Room } from "../types";
import { computeNextMaintenance, computeOverdueStatus } from "../types";
import { AlertCircle, Clock, Calendar, CheckCircle2, ArrowRight, Wrench } from "lucide-react";

interface MaintenanceTaskItem {
  object: FacilityObject;
  room?: Room;
  nextDate: string;
  isOverdue: boolean;
  daysOverdue: number;
  isDueSoon: boolean;
  daysUntilDue: number;
}

interface MaintenanceTaskListProps {
  objects: FacilityObject[];
  rooms: Room[];
  currentLocale: LocaleCode;
  onLogService: (object: FacilityObject) => void;
}

export const MaintenanceTaskList: React.FC<MaintenanceTaskListProps> = ({
  objects,
  rooms,
  currentLocale,
  onLogService,
}) => {
  const [activeTab, setActiveTab] = useState<"overdue" | "30d" | "90d" | "all">("overdue");

  // Compile task list with calculated statuses
  const tasks: MaintenanceTaskItem[] = [];

  for (const obj of objects) {
    if (obj.maintenance?.last_serviced) {
      const nextDate = computeNextMaintenance(
        obj.maintenance.last_serviced,
        obj.maintenance.interval_months
      );
      const overdue = computeOverdueStatus(nextDate);
      const room = rooms.find((r) => r.id === obj.room_id);

      tasks.push({
        object: obj,
        room,
        nextDate,
        isOverdue: overdue.isOverdue,
        daysOverdue: overdue.daysOverdue,
        isDueSoon: overdue.isDueSoon,
        daysUntilDue: overdue.daysUntilDue,
      });
    }
  }

  // Sort by next date ascending (most urgent first)
  tasks.sort((a, b) => a.nextDate.localeCompare(b.nextDate));

  const overdueTasks = tasks.filter((t) => t.isOverdue);
  const due30Tasks = tasks.filter((t) => !t.isOverdue && t.daysUntilDue <= 30);
  const due90Tasks = tasks.filter((t) => !t.isOverdue && t.daysUntilDue <= 90);

  const displayedTasks =
    activeTab === "overdue"
      ? overdueTasks
      : activeTab === "30d"
      ? due30Tasks
      : activeTab === "90d"
      ? due90Tasks
      : tasks;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overdue")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "overdue"
              ? "border-rose-600 text-rose-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Overdue</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-rose-100 text-rose-800">
            {overdueTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("30d")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "30d"
              ? "border-amber-500 text-amber-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Due Soon (30 Days)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800">
            {due30Tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("90d")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "90d"
              ? "border-facility-600 text-facility-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-facility-500" />
          <span>Upcoming (90 Days)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-sky-100 text-sky-800">
            {due90Tasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-slate-800 text-slate-900 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>All Scheduled Tasks</span>
          <span className="px-1.5 py-0.5 rounded-full text-[11px] bg-slate-200 text-slate-700">
            {tasks.length}
          </span>
        </button>
      </div>

      {/* Task Rows */}
      {displayedTasks.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No maintenance tasks match the selected criteria.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {displayedTasks.map(({ object, room, nextDate, isOverdue, daysOverdue, isDueSoon, daysUntilDue }) => {
            const textEntry = object.name[currentLocale] || object.name.en;

            return (
              <div
                key={object.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded">
                      {object.id}
                    </span>
                    <span className="text-xs uppercase font-semibold text-slate-500">
                      {object.category}
                    </span>
                    {room && (
                      <span className="text-xs text-slate-400">
                        • in {room.name[currentLocale] || room.name.en}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">
                    <a href={`#/objects/${object.id}`} className="hover:text-facility-600 hover:underline">
                      {textEntry.text}
                    </a>
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last: {object.maintenance?.last_serviced}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scheduled: <strong className="text-slate-800 font-mono">{nextDate}</strong></span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Status Tag */}
                  {isOverdue ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-xs font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {daysOverdue} days overdue
                    </span>
                  ) : isDueSoon ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold">
                      Due in {daysUntilDue} days
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      On Schedule
                    </span>
                  )}

                  {/* Log service action button */}
                  <button
                    onClick={() => onLogService(object)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-facility-600 hover:bg-facility-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Record Service</span>
                  </button>

                  <a
                    href={`#/objects/${object.id}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
                    title="View Asset Details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
