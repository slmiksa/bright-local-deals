import { Home, Grid3X3, Plus, Clapperboard, Headphones } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { icon: Home, label: "الرئيسية", id: "home", path: "/" },
  { icon: Grid3X3, label: "التصنيفات", id: "categories", path: "/categories" },
  { icon: Plus, label: "انشر اعلانك", id: "add", accent: true, path: "/add" },
  { icon: Clapperboard, label: "المعرض", id: "gallery", path: "/gallery" },
  { icon: Headphones, label: "الدعم", id: "support", path: "/support" },
];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/admin") || location.pathname === "/gallery") return null;

  const getActiveTab = () => {
    const path = location.pathname;
    const tab = tabs.find((t) => t.path === path);
    return tab?.id || "home";
  };

  const active = getActiveTab();

  return (
    <>
      <div
        aria-hidden
        className="fixed bottom-0 left-0 right-0 z-40 max-w-[430px] mx-auto bg-card"
        style={{ height: "env(safe-area-inset-bottom, 0px)" }}
      />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-card/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2px)" }}
      >
        <div className="flex items-end justify-around px-2 pt-2 pb-1.5">
          {tabs.map((tab) => {
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="touch-target flex flex-col items-center justify-center gap-1 flex-1 active:scale-95 transition-transform"
              >
                {tab.accent ? (
                  <div className="w-[56px] h-[56px] -mt-6 rounded-full bg-primary flex items-center justify-center shadow-elevated border-4 border-card">
                    <tab.icon className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                ) : (
                  <div className={`w-[46px] h-[46px] rounded-xl flex items-center justify-center transition-colors duration-200 ${
                    isActive ? "bg-primary/15" : "bg-secondary"
                  }`}>
                    <tab.icon
                      className={`w-[20px] h-[20px] transition-colors duration-200 ${
                        isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                      strokeWidth={isActive ? 2.2 : 1.8}
                    />
                  </div>
                )}
                <span
                  className={`text-[10px] leading-none transition-colors duration-200 ${
                    tab.accent
                      ? "font-bold text-primary mt-0.5"
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
    </>
  );
};

export default BottomTabBar;
