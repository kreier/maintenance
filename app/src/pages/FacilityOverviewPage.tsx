import React from "react";
import type { LocaleCode } from "../types";
import {
  exampleFacility,
  exampleRooms,
  exampleObjects,
} from "../services/data-loader";
import { RoomCard } from "../components/RoomCard";
import { ObjectCard } from "../components/ObjectCard";
import { computeNextMaintenance, computeOverdueStatus } from "../types";
import {
  MapPin,
  Building,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface FacilityOverviewPageProps {
  currentLocale: LocaleCode;
}

export const FacilityOverviewPage: React.FC<FacilityOverviewPageProps> = ({
  currentLocale,
}) => {
  const facilityName =
    exampleFacility.name[currentLocale] || exampleFacility.name.en;

  // Calculate quick stats
  let overdueCount = 0;
  let dueSoonCount = 0;

  for (const obj of exampleObjects) {
    if (obj.maintenance?.last_serviced) {
      const nextDate = computeNextMaintenance(
        obj.maintenance.last_serviced,
        obj.maintenance.interval_months
      );
      const status = computeOverdueStatus(nextDate);
      if (status.isOverdue) overdueCount++;
      else if (status.isDueSoon) dueSoonCount++;
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-facility-500/20 text-facility-400 border border-facility-500/30 mb-3">
            <Building className="w-3.5 h-3.5" />
            <span>Facility ID: {exampleFacility.id}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            {facilityName}
          </h1>

          <p className="flex items-center gap-1.5 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>
              {exampleFacility.address.street}, {exampleFacility.address.city},{" "}
              {exampleFacility.address.country}
            </span>
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Zones & Rooms</span>
            <div className="text-2xl font-bold mt-0.5">{exampleRooms.length}</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium">Documented Assets</span>
            <div className="text-2xl font-bold mt-0.5">{exampleObjects.length}</div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Overdue</span>
            </span>
            <div className={`text-2xl font-bold mt-0.5 ${overdueCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {overdueCount}
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur rounded-xl p-3.5 border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Due Soon</span>
            </span>
            <div className="text-2xl font-bold mt-0.5 text-amber-300">
              {dueSoonCount}
            </div>
          </div>
        </div>
      </div>

      {/* Rooms & Spaces Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Physical Rooms & Spaces</h2>
            <p className="text-xs text-slate-500">
              Zones within the facility with attached assets and equipment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exampleRooms.map((room) => {
            const count = exampleObjects.filter((o) => o.room_id === room.id).length;
            return (
              <RoomCard
                key={room.id}
                room={room}
                equipmentCount={count}
                currentLocale={currentLocale}
              />
            );
          })}
        </div>
      </section>

      {/* Equipment Highlights Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Equipment Highlights</h2>
            <p className="text-xs text-slate-500">
              Key physical assets monitored in this facility.
            </p>
          </div>

          <a
            href="#/equipment"
            className="inline-flex items-center gap-1 text-sm font-semibold text-facility-600 hover:text-facility-700"
          >
            <span>View All Equipment ({exampleObjects.length})</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exampleObjects.slice(0, 3).map((obj) => {
            const room = exampleRooms.find((r) => r.id === obj.room_id);
            return (
              <ObjectCard
                key={obj.id}
                object={obj}
                room={room}
                currentLocale={currentLocale}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};
