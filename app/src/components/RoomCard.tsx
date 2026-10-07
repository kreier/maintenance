import React from "react";
import type { Room, LocaleCode } from "../types";
import { DoorClosed, ArrowRight, Wrench } from "lucide-react";

interface RoomCardProps {
  room: Room;
  equipmentCount: number;
  currentLocale: LocaleCode;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  equipmentCount,
  currentLocale,
}) => {
  const roomName = room.name[currentLocale] || room.name.en;
  const roomDesc = room.description
    ? room.description[currentLocale] || room.description.en
    : undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <DoorClosed className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                {room.id}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {roomName}
              </h3>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200 whitespace-nowrap">
            {room.floor}
          </span>
        </div>

        {roomDesc && (
          <p className="text-xs text-slate-600 mb-4 line-clamp-2">
            {roomDesc}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <Wrench className="w-3.5 h-3.5 text-slate-400" />
          <span>{equipmentCount} {equipmentCount === 1 ? "asset" : "assets"}</span>
          {room.area_sqm && (
            <>
              <span className="text-slate-300">•</span>
              <span>{room.area_sqm} m²</span>
            </>
          )}
        </div>

        <a
          href={`#/rooms/${room.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-facility-600 hover:text-facility-700 hover:underline"
        >
          <span>View Assets</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
