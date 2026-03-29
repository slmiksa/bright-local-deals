import { useState } from "react";
import { MapPin, ChevronDown, ChevronLeft, X, Check } from "lucide-react";
import { useRegionsWithCities, RegionWithCities } from "@/hooks/useRegions";

interface AdminLocationPickerProps {
  value: string; // "all" | "region:X" | "city1" | "city1,city2,city3"
  onChange: (value: string) => void;
}

type Mode = "all" | "region" | "cities";

function parseValue(value: string): { mode: Mode; regionName?: string; selectedCities: string[] } {
  if (!value || value === "all") return { mode: "all", selectedCities: [] };
  if (value.startsWith("region:")) return { mode: "region", regionName: value.replace("region:", ""), selectedCities: [] };
  const cities = value.split(",").filter(Boolean);
  return { mode: "cities", selectedCities: cities };
}

function formatDisplay(value: string, regions: RegionWithCities[]): string {
  if (!value) return "اختر الموقع";
  if (value === "all") return "جميع المدن";
  if (value.startsWith("region:")) return `كل مدن ${value.replace("region:", "")}`;
  const cities = value.split(",").filter(Boolean);
  if (cities.length === 1) return cities[0];
  return `${cities.length} مدن محددة`;
}

const AdminLocationPicker = ({ value, onChange }: AdminLocationPickerProps) => {
  const { data: regions = [] } = useRegionsWithCities();
  const [open, setOpen] = useState(false);
  const parsed = parseValue(value);
  const [mode, setMode] = useState<Mode>(parsed.mode);
  const [selectedRegion, setSelectedRegion] = useState<string>(parsed.regionName || "");
  const [selectedCities, setSelectedCities] = useState<string[]>(parsed.selectedCities);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const handleOpen = () => {
    const p = parseValue(value);
    setMode(p.mode);
    setSelectedRegion(p.regionName || "");
    setSelectedCities(p.selectedCities);
    setExpandedRegion(null);
    setOpen(true);
  };

  const handleSelectAll = () => {
    onChange("all");
    setOpen(false);
  };

  const handleSelectRegion = (rName: string) => {
    onChange(`region:${rName}`);
    setOpen(false);
  };

  const toggleCity = (cityName: string) => {
    setSelectedCities(prev => {
      const next = prev.includes(cityName)
        ? prev.filter(c => c !== cityName)
        : [...prev, cityName];
      return next;
    });
    setMode("cities");
  };

  const confirmCities = () => {
    if (selectedCities.length === 0) return;
    onChange(selectedCities.join(","));
    setOpen(false);
  };

  const inputClass = "w-full h-10 px-3 rounded-xl bg-background text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer flex items-center justify-between";

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-foreground mb-1">الموقع *</label>
      <button type="button" onClick={handleOpen} className={inputClass}>
        <span className="truncate">{formatDisplay(value, regions)}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {/* Selected cities tags */}
      {parsed.mode === "cities" && parsed.selectedCities.length > 1 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {parsed.selectedCities.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold">
              {c}
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/30" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl max-w-[600px] mx-auto animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mt-3" />
            <div className="px-4 py-3">
              <h3 className="text-sm font-bold text-foreground mb-3">اختر الموقع</h3>
              <div className="space-y-0.5 max-h-[50vh] overflow-y-auto">
                {/* All cities */}
                <button
                  onClick={handleSelectAll}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    value === "all" ? "bg-primary/10 text-primary font-bold" : "text-foreground active:bg-secondary"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>جميع المدن</span>
                  {value === "all" && <Check className="w-4 h-4 mr-auto" />}
                </button>

                {/* Regions */}
                {regions.map(region => {
                  const isExpanded = expandedRegion === region.id;
                  const isRegionSelected = value === `region:${region.name}`;

                  // Count how many cities of this region are in selectedCities
                  const regionCityNames = region.cities.map(c => c.name);
                  const selectedInRegion = selectedCities.filter(c => regionCityNames.includes(c));

                  return (
                    <div key={region.id}>
                      <button
                        onClick={() => setExpandedRegion(isExpanded ? null : region.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          isRegionSelected ? "bg-primary/10" : "active:bg-secondary"
                        }`}
                      >
                        <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "-rotate-90" : ""}`} />
                        <span className={`font-bold ${isRegionSelected ? "text-primary" : "text-foreground"}`}>{region.name}</span>
                        {selectedInRegion.length > 0 && !isRegionSelected && (
                          <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full mr-auto">{selectedInRegion.length}</span>
                        )}
                        {isRegionSelected && <Check className="w-4 h-4 text-primary mr-auto" />}
                      </button>

                      {isExpanded && (
                        <div className="mr-5 space-y-0.5 mt-0.5 mb-1">
                          {/* Select all region */}
                          <button
                            onClick={() => handleSelectRegion(region.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors ${
                              isRegionSelected ? "bg-primary/10 text-primary font-bold" : "text-foreground active:bg-secondary"
                            }`}
                          >
                            <span>🌐</span>
                            <span>كل مدن {region.name}</span>
                          </button>

                          {/* Individual cities with checkboxes */}
                          {region.cities.map(c => {
                            const isChecked = selectedCities.includes(c.name);
                            return (
                              <button
                                key={c.id}
                                onClick={() => toggleCity(c.name)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors ${
                                  isChecked ? "bg-primary/10 text-primary font-bold" : "text-foreground active:bg-secondary"
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked ? "bg-primary border-primary" : "border-muted-foreground/40"
                                }`}>
                                  {isChecked && <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span>{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Confirm button for multi-city */}
              {selectedCities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <button
                    onClick={confirmCities}
                    className="w-full h-10 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                  >
                    <Check className="w-4 h-4" />
                    تأكيد ({selectedCities.length} مدن)
                  </button>
                </div>
              )}
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocationPicker;
