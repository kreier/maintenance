import React from "react";
import type { LocaleCode } from "../types";
import { getRoomById, getObjectsByRoomId } from "../services/data-loader";
import { ObjectCard } from "../components/ObjectCard";
import { ArrowLeft, DoorClosed, Layers, Maximize2 } from "lucide-react";

interface RoomDetailPageProps {
  roomId: string;
  currentLocale: LocaleCode;
}

export const RoomDetailPage: React.FC<RoomDetailPageProps> = ({
  roomId,
  currentLocale,
}) => {
  const room = getRoomById(roomId);

  if (!room) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Room Not Found</h2>
        <p className="text-sm text-slate-500">
          No zone or room exists with ID: <code className="font-mono font-bold text-slate-700">{roomId}</code>
        </p>
        <a
          href="#/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Facility Overview</span>
        </a>
      </div>
    );
  }

  const objects = getObjectsByRoomId(room.id);
  const roomName = room.name[currentLocale] || room.name.en;
  const roomDesc = room.description
    ? room.description[currentLocale] || room.description.en
    : undefined;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <a
          href="#/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Facility Overview</span>
        </a>
      </div>

      {/* Room Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <DoorClosed className="w-5 h-5" />
          </span>
          <span className="font-mono text-sm font-bold text-slate-600 uppercase">
            {room.id}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {roomName}
        </h1>

        {roomDesc && <p className="text-sm text-slate-600 max-w-3xl">{roomDesc}</p>}

        <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Floor: {room.floor}</span>
          </span>

          {room.area_sqm && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Area: {room.area_sqm} m²</span>
            </span>
          )}
        </div>
      </div>

      {/* Assets in this Room */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          Equipment in this Room ({objects.length})
        </h2>

        {objects.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
            No equipment is assigned to this room yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {objects.map((obj) => (
              <ObjectCard
                key={obj.id}
                object={obj}
                room={room}
                currentLocale={currentLocale}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
