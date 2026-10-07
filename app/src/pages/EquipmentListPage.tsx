import React, { useState, useMemo } from "react";
import type { LocaleCode } from "../types";
import { exampleObjects, exampleRooms } from "../services/data-loader";
import { ObjectCard } from "../components/ObjectCard";
import { Search, Filter, X } from "lucide-react";

interface EquipmentListPageProps {
  currentLocale: LocaleCode;
}

export const EquipmentListPage: React.FC<EquipmentListPageProps> = ({
  currentLocale,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const categories: Array<{ id: string; label: string }> = [
    { id: "all", label: "All Categories" },
    { id: "hvac", label: "HVAC" },
    { id: "electrical", label: "Electrical" },
    { id: "av", label: "Audio / Visual" },
    { id: "safety", label: "Fire & Safety" },
  ];

  const filteredObjects = useMemo(() => {
    return exampleObjects.filter((obj) => {
      // Search match
      const text = (obj.name[currentLocale]?.text || obj.name.en.text).toLowerCase();
      const idMatch = obj.id.toLowerCase().includes(searchQuery.toLowerCase());
      const manufacturerMatch = obj.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const modelMatch = obj.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
      const queryMatch = !searchQuery || idMatch || text.includes(searchQuery.toLowerCase()) || manufacturerMatch || modelMatch;

      // Category match
      const categoryMatch = selectedCategory === "all" || obj.category === selectedCategory;

      // Room match
      const roomMatch = selectedRoomId === "all" || obj.room_id === selectedRoomId;

      // Status match
      const statusMatch = selectedStatus === "all" || obj.status === selectedStatus;

      return queryMatch && categoryMatch && roomMatch && statusMatch;
    });
  }, [searchQuery, selectedCategory, selectedRoomId, selectedStatus, currentLocale]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedRoomId("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== "all" ||
    selectedRoomId !== "all" ||
    selectedStatus !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Equipment Catalog</h1>
        <p className="text-sm text-slate-500">
          Browse and filter physical equipment by room, category, and maintenance status.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search text input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID (e.g. HVAC-001), name, manufacturer, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-facility-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Room filter dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-facility-500"
            >
              <option value="all">All Rooms</option>
              {exampleRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name[currentLocale] || r.name.en} ({r.id})
                </option>
              ))}
            </select>

            {/* Status filter dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-facility-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance_required">Maintenance Required</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Category:
          </span>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-facility-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="text-xs font-semibold text-slate-500 mb-3">
          Showing {filteredObjects.length} of {exampleObjects.length} equipment items
        </div>

        {filteredObjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">No equipment matches your current filters.</p>
            <button
              onClick={clearFilters}
              className="mt-3 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredObjects.map((obj) => {
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
        )}
      </div>
    </div>
  );
};
