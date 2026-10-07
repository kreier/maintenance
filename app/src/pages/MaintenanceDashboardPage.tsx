import React, { useState } from "react";
import type { FacilityObject, MaintenanceEvent, LocaleCode } from "../types";
import {
  exampleFacility,
  exampleRooms,
  exampleObjects as initialObjects,
  exampleEvents as initialEvents,
} from "../services/data-loader";
import {
  computeAge,
  computeNextMaintenance,
  computeOverdueStatus,
} from "../types";
import { MaintenanceTaskList } from "../components/MaintenanceTaskList";
import { LogEventModal } from "../components/LogEventModal";
import { BarChart, type BarChartDataPoint } from "../components/charts/BarChart";
import { LineChart, type LineChartDataPoint } from "../components/charts/LineChart";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  BarChart3,
  History,
  TrendingUp,
} from "lucide-react";

interface MaintenanceDashboardPageProps {
  currentLocale: LocaleCode;
}

export const MaintenanceDashboardPage: React.FC<MaintenanceDashboardPageProps> = ({
  currentLocale,
}) => {
  const [objects, setObjects] = useState<FacilityObject[]>(initialObjects);
  const [events, setEvents] = useState<MaintenanceEvent[]>(initialEvents);
  const [selectedObjectForService, setSelectedObjectForService] = useState<FacilityObject | null>(null);

  // Stats calculation
  let overdueCount = 0;
  let due30Count = 0;
  let due90Count = 0;

  // Forecast distribution (next 6 months)
  const forecastMap: Record<string, number> = {};
  // Age distribution
  const ageDistribution = { "< 1 year": 0, "1-2 years": 0, "2-5 years": 0, "> 5 years": 0 };

  for (const obj of objects) {
    // Age bucket
    const age = computeAge(obj.installed);
    if (age.years < 1) ageDistribution["< 1 year"]++;
    else if (age.years < 2) ageDistribution["1-2 years"]++;
    else if (age.years < 5) ageDistribution["2-5 years"]++;
    else ageDistribution["> 5 years"]++;

    // Maintenance scheduling
    if (obj.maintenance?.last_serviced) {
      const nextDate = computeNextMaintenance(
        obj.maintenance.last_serviced,
        obj.maintenance.interval_months
      );
      const status = computeOverdueStatus(nextDate);

      if (status.isOverdue) overdueCount++;
      else if (status.isDueSoon) due30Count++;
      else if (status.daysUntilDue <= 90) due90Count++;

      const monthKey = nextDate.slice(0, 7); // YYYY-MM
      forecastMap[monthKey] = (forecastMap[monthKey] || 0) + 1;
    }
  }

  // Convert age distribution to BarChart points
  const ageChartData: BarChartDataPoint[] = Object.entries(ageDistribution).map(([label, value]) => ({
    label,
    value,
    color: "#6366f1",
  }));

  // Forecast chart data
  const forecastChartData: BarChartDataPoint[] = Object.entries(forecastMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({
      label: month.slice(5), // MM
      value: count,
      color: "#0ea5e9",
    }));

  // Energy consumption data
  const energyData: LineChartDataPoint[] = (exampleFacility.energy_consumption || []).map((e) => ({
    label: e.month.slice(5), // MM
    value: e.kwh,
  }));

  const handleServiceLogged = (newEvent: MaintenanceEvent, updatedObject: FacilityObject) => {
    // Prepend new event
    setEvents([newEvent, ...events]);
    // Replace updated object
    setObjects(objects.map((o) => (o.id === updatedObject.id ? updatedObject : o)));
    setSelectedObjectForService(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Maintenance & Operations Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Dynamic scheduling, overdue monitoring, and operational facility analytics computed from raw facts.
        </p>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Overdue Tasks</span>
            <AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? "text-rose-500" : "text-slate-400"}`} />
          </div>
          <div className={`text-3xl font-black ${overdueCount > 0 ? "text-rose-600" : "text-slate-900"}`}>
            {overdueCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Requires immediate technician action</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Due Within 30 Days</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {due30Count}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Approaching service deadline</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Next 90 Days</span>
            <Calendar className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black text-sky-600">
            {due90Count}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Upcoming scheduled maintenance</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
            <span>Logged Events</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {events.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Completed inspection & service logs</span>
        </div>
      </div>

      {/* Actionable Maintenance Tasks List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Active Maintenance Schedules</h2>
            <p className="text-xs text-slate-500">
              Sorted by urgency. Service events can be recorded directly.
            </p>
          </div>
        </div>

        <MaintenanceTaskList
          objects={objects}
          rooms={exampleRooms}
          currentLocale={currentLocale}
          onLogService={(obj) => setSelectedObjectForService(obj)}
        />
      </section>

      {/* Visual Analytics & Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forecast Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              <span>Service Forecast</span>
            </h3>
            <span className="text-[11px] text-slate-400">By Target Month</span>
          </div>
          <p className="text-xs text-slate-500">Scheduled maintenance task volume.</p>
          <BarChart data={forecastChartData} height={160} />
        </div>

        {/* Equipment Age Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Asset Age Profile</span>
            </h3>
            <span className="text-[11px] text-slate-400">Install to Today</span>
          </div>
          <p className="text-xs text-slate-500">Distribution of facility equipment by age bracket.</p>
          <BarChart data={ageChartData} height={160} />
        </div>

        {/* Facility Electricity Consumption */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Facility Electricity Usage</span>
            </h3>
            <span className="text-[11px] text-slate-400">12 Months (kWh)</span>
          </div>
          <p className="text-xs text-slate-500">Monthly electrical energy consumption trend.</p>
          <LineChart data={energyData} height={160} unit="kWh" />
        </div>
      </div>

      {/* Historical Event Feed */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-facility-600" />
            <span>Facility Service Log History ({events.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Append-Only Audit Fixture</span>
        </div>

        <div className="divide-y divide-slate-100">
          {events.map((evt) => {
            const obj = objects.find((o) => o.id === evt.object_id);
            const objTitle = obj ? (obj.name[currentLocale]?.text || obj.name.en.text) : evt.object_id;

            return (
              <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {evt.id}
                    </span>
                    <span className="text-xs uppercase font-bold text-slate-500">
                      {evt.type}
                    </span>
                    <span className="text-xs font-medium text-slate-400">•</span>
                    <a href={`#/objects/${evt.object_id}`} className="text-xs font-bold text-slate-900 hover:text-facility-600 hover:underline">
                      {objTitle} ({evt.object_id})
                    </a>
                  </div>

                  <p className="text-xs text-slate-600">
                    {evt.summary[currentLocale]?.text || evt.summary.en.text}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-semibold text-slate-800">
                    {evt.date}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {evt.performed_by}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Record Service Modal */}
      {selectedObjectForService && (
        <LogEventModal
          object={selectedObjectForService}
          currentLocale={currentLocale}
          onClose={() => setSelectedObjectForService(null)}
          onSubmit={handleServiceLogged}
        />
      )}
    </div>
  );
};
