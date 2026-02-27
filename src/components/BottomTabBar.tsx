import { Home, Grid3X3, Plus, Star, Headphones } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { icon: Home, label: "الرئيسية", id: "home", path: "/" },
  { icon: Grid3X3, label: "التصنيفات", id: "categories", path: "/categories" },
  { icon: Plus, label: "أضف", id: "add", accent: true, path: "/add" },
  { icon: Star, label: "المميزة", id: "featured", path: "/featured" },
  { icon: Headphones, label: "الدعم", id: "support", path: "/support" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = () => {
    const path = location.pathname;
    const tab = tabs.find((t) => t.path === path);
    return tab?.id || "home";
  };

  const active = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border max-w-[430px] mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around px-1 pt-1.5 pb-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="touch-target flex flex-col items-center justify-center gap-1 flex-1 active:scale-95 transition-transform"
            >
              {tab.accent ? (
                <div className="w-[52px] h-[52px] -mt-7 rounded-2xl bg-primary flex items-center justify-center shadow-elevated">
                  <tab.icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                </div>
              ) : (
                <tab.icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              )}
              <span
                className={`text-[10px] leading-none transition-colors duration-200 ${
                  tab.accent
                    ? "font-bold text-primary mt-1"
                    : isActive
                    ? "font-bold text-primary"
                    : "font-medium text-muted-foreground"
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
