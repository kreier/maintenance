import type { Facility, Room, FacilityObject, MaintenanceEvent } from "../types";
import facilityRaw from "../../../data/example/facility.json";

// Ingest all example fixtures using Vite's eager glob
const roomModules = import.meta.glob<{ default: Room }>(
  "../../../data/example/rooms/*.json",
  { eager: true }
);

const objectModules = import.meta.glob<{ default: FacilityObject }>(
  "../../../data/example/objects/*.json",
  { eager: true }
);

const eventModules = import.meta.glob<{ default: MaintenanceEvent }>(
  "../../../data/example/maintenance/*.json",
  { eager: true }
);

export const exampleFacility = facilityRaw as Facility;

export const exampleRooms: Room[] = Object.values(roomModules).map(
  (mod) => mod.default
);

export const exampleObjects: FacilityObject[] = Object.values(objectModules).map(
  (mod) => mod.default
);

export const exampleEvents: MaintenanceEvent[] = Object.values(eventModules).map(
  (mod) => mod.default
);

export function getRoomById(id: string): Room | undefined {
  return exampleRooms.find((r) => r.id === id);
}

export function getObjectById(id: string): FacilityObject | undefined {
  return exampleObjects.find((o) => o.id === id);
}

export function getObjectsByRoomId(roomId: string): FacilityObject[] {
  return exampleObjects.filter((o) => o.room_id === roomId);
}

export function getEventsByObjectId(objectId: string): MaintenanceEvent[] {
  return exampleEvents.filter((e) => e.object_id === objectId);
}
