import React from "react";
import { Sliders } from "lucide-react";

const FilterSidebar = ({ filters, setFilters }) => {
  const handlePriceChange = (e) => {
    setFilters({ ...filters, maxPrice: e.target.value });
  };

  const handleModeChange = (mode) => {
    const newModes = filters.modes.includes(mode)
      ? filters.modes.filter((m) => m !== mode)
      : [...filters.modes, mode];
    setFilters({ ...filters, modes: newModes });
  };

  const handleSortChange = (e) => {
    setFilters({ ...filters, sortBy: e.target.value });
  };

  const handleDepartureTimeChange = (value) => {
    const newTimes = filters.departureTimes.includes(value)
      ? filters.departureTimes.filter((t) => t !== value)
      : [...filters.departureTimes, value];
    setFilters({ ...filters, departureTimes: newTimes });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
      <div className="flex items-center space-x-2 mb-6">
        <Sliders className="h-5 w-5 text-gray-700" />
        <h3 className="text-lg font-bold">Filters</h3>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="departure">Departure Time</option>
          <option value="duration">Duration</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Max Price: ₹{filters.maxPrice?.toLocaleString("en-IN") || "50000"}
        </label>
        <input
          type="range"
          min="500"
          max="50000"
          step="500"
          value={filters.maxPrice || 50000}
          onChange={handlePriceChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>₹500</span>
          <span>₹50,000</span>
        </div>
      </div>

      {/* Travel Mode */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Travel Mode
        </label>
        <div className="space-y-2">
          {["flight", "train", "bus"].map((mode) => (
            <label
              key={mode}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.modes.includes(mode)}
                onChange={() => handleModeChange(mode)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm capitalize">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Departure Time
        </label>
        <div className="space-y-2">
          {[
            { label: "Early Morning (00:00 - 06:00)", value: "early-morning" },
            { label: "Morning (06:00 - 12:00)", value: "morning" },
            { label: "Afternoon (12:00 - 18:00)", value: "afternoon" },
            { label: "Evening (18:00 - 00:00)", value: "evening" },
          ].map((time) => (
            <label
              key={time.value}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.departureTimes.includes(time.value)}
                onChange={() => handleDepartureTimeChange(time.value)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm">{time.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Reset Filters */}
      <button
        onClick={() =>
          setFilters({
            maxPrice: 50000,
            modes: [],
            sortBy: "price-low",
            departureTimes: [],
          })
        }
        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
