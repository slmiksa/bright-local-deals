import { Search, MapPin } from "lucide-react";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg text-foreground">الرياض</span>
        </div>
        <button className="touch-target flex items-center justify-center w-11 h-11 rounded-full bg-secondary">
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};

export default TopBar;
