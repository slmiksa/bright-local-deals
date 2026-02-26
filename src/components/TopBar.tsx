import { Search, MapPin, Bell } from "lucide-react";

const TopBar = () => {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium leading-none mb-0.5">موقعك الحالي</p>
            <h1 className="text-base font-bold text-foreground leading-tight">الرياض</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="touch-target flex items-center justify-center w-10 h-10 rounded-xl bg-secondary transition-colors active:bg-muted">
            <Bell className="w-[18px] h-[18px] text-foreground" />
          </button>
          <button className="touch-target flex items-center justify-center w-10 h-10 rounded-xl bg-secondary transition-colors active:bg-muted">
            <Search className="w-[18px] h-[18px] text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
