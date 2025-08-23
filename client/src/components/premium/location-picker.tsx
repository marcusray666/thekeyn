import { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Check, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  importance?: number;
}

interface LocationPickerProps {
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
  placeholder?: string;
}

export function LocationPicker({ selectedLocation, onLocationSelect, placeholder = "Add location..." }: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lon: number} | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Get user's current location for nearby suggestions
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  }, []);

  // Search locations using Nominatim (OpenStreetMap)
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Build search URL with potential location bias
      let searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&extratags=1`;
      
      // Add location bias if available
      if (currentLocation) {
        searchUrl += `&lat=${currentLocation.lat}&lon=${currentLocation.lon}&radius=50000`;
      }
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Loggin-Platform/1.0'
        }
      });
      
      if (response.ok) {
        const results = await response.json();
        // Sort by relevance/importance
        const sortedResults = results.sort((a: LocationResult, b: LocationResult) => {
          return (b.importance || 0) - (a.importance || 0);
        });
        setSearchResults(sortedResults);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 200);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const formatLocationName = (result: LocationResult) => {
    const parts = result.display_name.split(',');
    
    // For popular places, try to format nicely
    if (parts.length >= 4) {
      // Neighborhood, City, State/Region, Country
      return `${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}`;
    } else if (parts.length === 3) {
      // City, State, Country
      return `${parts[0].trim()}, ${parts[1].trim()}, ${parts[2].trim()}`;
    } else if (parts.length === 2) {
      return `${parts[0].trim()}, ${parts[1].trim()}`;
    }
    return parts[0].trim();
  };

  // Get nearby locations based on current location
  const searchNearbyLocations = async () => {
    if (!currentLocation) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lon}&zoom=14&addressdetails=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Loggin-Platform/1.0'
          }
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result) {
          setSearchResults([result]);
        }
      }
    } catch (error) {
      console.error('Error getting nearby locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSelect = (result: LocationResult) => {
    const locationName = formatLocationName(result);
    onLocationSelect(locationName);
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const clearLocation = () => {
    onLocationSelect("");
    setIsOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };



  return (
    <div className="relative">
      {/* Location Display / Trigger */}
      <div
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between bg-white/90 border border-gray-200 rounded-xl px-4 py-3 cursor-pointer hover:bg-white transition-colors shadow-sm"
      >
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className={`text-sm font-medium ${selectedLocation ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedLocation || placeholder}
          </span>
        </div>
        {selectedLocation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearLocation();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-semibold text-lg">Select Location</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search for a location (e.g., Soho, NYC)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 rounded-xl pl-10 focus:bg-white focus:border-gray-300"
                  autoFocus
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <div className="w-6 h-6 border-2 border-[#FE3F5E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Searching locations...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleLocationSelect(result)}
                      className="w-full text-left p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-[#FE3F5E] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-medium text-sm leading-tight">
                            {formatLocationName(result)}
                          </p>
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                            {result.display_name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No locations found</p>
                  <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Search for a location</p>
                  <p className="text-gray-400 text-xs mt-1">Try searching for "Soho NYC" or "Times Square"</p>
                  
                  {/* Current location button */}
                  {currentLocation && (
                    <button
                      onClick={searchNearbyLocations}
                      disabled={isLoading}
                      className="mt-3 flex items-center space-x-2 mx-auto px-3 py-2 bg-[#FE3F5E]/20 border border-[#FE3F5E]/30 text-[#FE3F5E] rounded-lg hover:bg-[#FE3F5E]/30 transition-colors disabled:opacity-50"
                    >
                      <Navigation className="h-4 w-4" />
                      <span className="text-sm">Use Current Location</span>
                    </button>
                  )}

                  {/* Popular locations */}
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-400 text-xs text-center mb-2">Popular locations:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Soho, NYC', 'Times Square, NYC', 'Brooklyn, NYC', 'Los Angeles, CA', 'Miami, FL', 'Chicago, IL'].map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            onLocationSelect(location);
                            setIsOpen(false);
                          }}
                          className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 text-xs rounded-full transition-colors"
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {selectedLocation && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-gray-700 text-sm">Current: {selectedLocation}</span>
                  </div>
                  <Button
                    onClick={clearLocation}
                    variant="outline"
                    size="sm"
                    className="bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}