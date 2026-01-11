import React, { useState, useRef } from "react";
import { MapPin } from "lucide-react";

// Popular airports with IATA codes (Indian + International)
const INDIAN_AIRPORTS = [
  // Indian Airports
  { code: 'BLR', city: 'Bangalore', name: 'Kempegowda International Airport' },
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International Airport' },
  { code: 'GOI', city: 'Goa', name: 'Goa International Airport' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh International Airport' },
  { code: 'IXC', city: 'Chandigarh', name: 'Chandigarh International Airport' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport' },
  { code: 'NAG', city: 'Nagpur', name: 'Dr. Babasaheb Ambedkar International Airport' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri International Airport' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan International Airport' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi International Airport' },
  { code: 'IXR', city: 'Ranchi', name: 'Birsa Munda Airport' },
  
  // International Airports
  { code: 'SIN', city: 'Singapore', name: 'Singapore Changi Airport' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' },
  { code: 'LHR', city: 'London', name: 'London Heathrow Airport' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport' },
];

const AutoCompleteInput = ({ label, name, value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(e);

    if (inputValue.trim().length > 0) {
      const filtered = INDIAN_AIRPORTS.filter(
        (airport) =>
          airport.city.toLowerCase().includes(inputValue.toLowerCase()) ||
          airport.code.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (airport) => {
    onChange({ target: { name, value: airport.code } });
    setShowDropdown(false);
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onFocus={() => value && handleInputChange({ target: { value } })}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="input-field pl-10"
          autoComplete="off"
        />

        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-64 overflow-y-auto">
            {suggestions.map((airport) => (
              <li
                key={airport.code}
                onMouseDown={() => handleSelect(airport)}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900">
                      {airport.city}
                    </span>
                    <span className="text-gray-500 ml-2 text-xs">
                      ({airport.code})
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {airport.name}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Enter city name or airport code (e.g., BLR, DEL, BOM)
      </p>
    </div>
  );
};

export default AutoCompleteInput;
