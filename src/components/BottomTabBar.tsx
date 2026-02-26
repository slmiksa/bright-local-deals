import { Home, Grid3X3, PlusCircle, Star, User } from "lucide-react";
import { useState } from "react";

const tabs = [
  { icon: Home, label: "الرئيسية", id: "home" },
  { icon: Grid3X3, label: "التصنيفات", id: "categories" },
  { icon: PlusCircle, label: "أضف إعلان", id: "add", accent: true },
  { icon: Star, label: "المميزة", id: "featured" },
  { icon: User, label: "الحساب", id: "account" },
];

const BottomTabBar = () => {
  const [active, setActive] = useState("home");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="touch-target flex flex-col items-center justify-center gap-0.5 flex-1"
            >
              {tab.accent ? (
                <div className="w-12 h-12 -mt-4 rounded-full bg-primary flex items-center justify-center shadow-elevated">
                  <tab.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              ) : (
                <tab.icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
              )}
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  tab.accent
                    ? "text-primary"
                    : isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
