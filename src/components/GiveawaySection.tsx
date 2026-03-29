import { useState, useEffect, useMemo } from "react";
import { Gift, Trophy, ExternalLink, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCity } from "@/contexts/CityContext";
import { useRegionsWithCities } from "@/hooks/useRegions";

const GiveawaySection = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { city, selectionMode, regionCities } = useCity();
  const { data: regions = [] } = useRegionsWithCities();

  const { data: giveaway } = useQuery({
    queryKey: ["active_giveaway", city, selectionMode, regionCities, regions.map(r => r.id).join(",")],
    queryFn: async () => {
      const { data } = await supabase
        .from("giveaways")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) return null;

      const userCities = selectionMode === "region" ? regionCities : [city];
      const matching = data.filter((g: any) => {
        const gCity = g.city || "all";
        if (gCity === "all") return true;
        if (gCity.startsWith("region:")) {
          const rName = gCity.replace("region:", "");
          const region = regions.find(r => r.name === rName);
          if (!region) return false;
          const rCityNames = region.cities.map(c => c.name);
          return userCities.some(uc => rCityNames.includes(uc));
        }
        const gCities = gCity.split(",").map((c: string) => c.trim());
        return userCities.some(uc => gCities.includes(uc));
      });

      return matching.length > 0 ? matching[0] : null;
    },
    staleTime: 1000 * 60 * 2,
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [registered, setRegistered] = useState(false);
  const [inlineMsg, setInlineMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expanded, setExpanded] = useState(false);

  const endTime = useMemo(() => giveaway?.end_date ? new Date(giveaway.end_date).getTime() : null, [giveaway?.end_date]);
  const isExpired = endTime ? endTime <= Date.now() : true;
  const hasWinner = !!giveaway?.winner_name;

  useEffect(() => {
    if (!endTime || hasWinner) return;
    const calc = () => {
      const diff = Math.max(0, endTime - Date.now());
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calc());
    const timer = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(timer);
  }, [endTime, hasWinner]);

  // Check if user already registered (by phone in localStorage)
  useEffect(() => {
    if (!giveaway) return;
    const key = `giveaway_${giveaway.id}`;
    if (localStorage.getItem(key)) setRegistered(true);
  }, [giveaway]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      if (!trimmedName || !trimmedPhone) throw new Error("يرجى إدخال الاسم ورقم الجوال");
      if (trimmedPhone.length < 9 || trimmedPhone.length > 15) throw new Error("رقم الجوال غير صحيح");

      const { error } = await supabase.from("giveaway_entries").insert({
        giveaway_id: giveaway!.id,
        name: trimmedName,
        phone: trimmedPhone,
      });
      if (error) {
        if (error.code === "23505") throw new Error("رقم الجوال مسجل مسبقاً في هذا السحب");
        throw error;
      }
    },
    onSuccess: () => {
      localStorage.setItem(`giveaway_${giveaway!.id}`, "1");
      setRegistered(true);
      setName("");
      setPhone("");
      setInlineMsg({ text: "تم التسجيل بنجاح! بالتوفيق 🎉", type: "success" });
    },
    onError: (err: any) => {
      setInlineMsg({ text: err.message, type: "error" });
      setTimeout(() => setInlineMsg(null), 4000);
    },
  });

  if (!giveaway) return null;

  const SponsorBadge = () => {
    if (!giveaway.sponsor_name) return null;
    const sponsorUrl = (giveaway as any).sponsor_url as string | null;
    const linkType = (giveaway as any).sponsor_link_type as string | null;
    const isSnapchat = linkType === "snapchat";

    const SnapIcon = () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.992-.27a.93.93 0 01.402-.082.68.68 0 01.541.264c.164.215.188.486.012.7-.218.262-.556.46-.874.635-.39.21-.828.39-1.252.484a.49.49 0 00-.375.39c-.13.66-.27 1.32-.39 1.98-.12.63-.33 1.26-.6 1.86-.51 1.14-1.35 2.07-2.37 2.73-.57.36-1.2.63-1.83.84-.63.18-1.29.3-1.95.33h-.18c-.66-.03-1.32-.15-1.95-.33-.63-.21-1.26-.48-1.83-.84-1.02-.66-1.86-1.59-2.37-2.73-.27-.6-.48-1.23-.6-1.86-.12-.66-.26-1.32-.39-1.98a.49.49 0 00-.375-.39c-.424-.093-.862-.273-1.252-.484-.318-.176-.656-.373-.874-.635-.176-.215-.152-.486.012-.7a.68.68 0 01.54-.264.93.93 0 01.403.082c.333.15.692.254.992.27.198 0 .326-.045.401-.09a15.27 15.27 0 01-.033-.57c-.104-1.628-.23-3.654.3-4.847C5.653 1.069 9.01.793 10 .793h2.206z"/>
      </svg>
    );

    if (sponsorUrl) {
      const handleClick = () => {
        const internalMatch = sponsorUrl.match(/^\/ad\/(\d+)$/);
        if (internalMatch) {
          navigate(sponsorUrl);
        } else {
          window.open(sponsorUrl, "_blank");
        }
      };
      return (
        <button
          onClick={handleClick}
          className="mt-3 inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-white rounded-full px-5 py-2 transition-all active:scale-[0.97]"
          style={{ color: isSnapchat ? "#FFFC00" : undefined, background: isSnapchat ? "#FFFC00" : undefined }}
        >
          {giveaway.sponsor_logo_url && (
            <img src={giveaway.sponsor_logo_url} alt={giveaway.sponsor_name} className="w-5 h-5 rounded-full object-cover" />
          )}
          <span className={`text-xs font-bold ${isSnapchat ? "text-black" : "text-gray-700"}`}>مشاهدة الراعي</span>
          {isSnapchat ? <SnapIcon /> : <ExternalLink className="w-3 h-3 opacity-60" />}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/20">
        {giveaway.sponsor_logo_url && (
          <img src={giveaway.sponsor_logo_url} alt={giveaway.sponsor_name} className="w-6 h-6 rounded-full object-cover bg-white" />
        )}
        <span className="text-xs opacity-80">برعاية {giveaway.sponsor_name}</span>
      </div>
    );
  };

  const SnapchatButton = () => {
    if (!giveaway.snapchat_url) return null;
    return (
      <Button
        variant="secondary"
        size="sm"
        className="bg-[#FFFC00] text-black hover:bg-[#FFFC00]/90 font-bold text-xs gap-1.5"
        onClick={() => window.open(giveaway.snapchat_url, "_blank")}
      >
        <ExternalLink className="w-3.5 h-3.5" />
        تابعنا لإعلان الفائز 👻
      </Button>
    );
  };


  // Winner announced state
  if (hasWinner) {
    return (
      <div className="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white shadow-elevated relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="absolute text-2xl animate-pulse" style={{
              top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}>✨</span>
          ))}
        </div>
        <div className="relative z-10 text-center space-y-3">
          <Trophy className="w-10 h-10 mx-auto text-white drop-shadow-lg" />
          <h3 className="font-black text-lg">{giveaway.title}</h3>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">🎉 مبروك للفائز</p>
            <p className="text-2xl font-black">{giveaway.winner_name}</p>
            <p className="text-sm mt-1 opacity-80">الجائزة: {giveaway.prize}</p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <SnapchatButton />
          </div>
          <SponsorBadge />
        </div>
      </div>
    );
  }

  // Active giveaway - not expired
  if (!isExpired) {
    const units = [
      { label: "ثانية", value: timeLeft.seconds },
      { label: "دقيقة", value: timeLeft.minutes },
      { label: "ساعة", value: timeLeft.hours },
      { label: "يوم", value: timeLeft.days },
    ];

    return (
      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-elevated overflow-hidden">
        {/* Collapsed header - always visible */}
        <div
          className="px-4 py-3.5 flex items-center justify-between cursor-pointer active:opacity-90"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg">🎁</span>
            <span className="text-lg">💰</span>
            <div className="min-w-0">
              <h3 className="font-black text-sm truncate">{giveaway.title}</h3>
              {!expanded && <p className="text-[10px] opacity-75 mt-0.5">اضغط هنا وادخل السحب</p>}
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0" dir="ltr">
            {!expanded && (
              <div className="flex items-center gap-1 text-xs font-bold tabular-nums">
                <span className="bg-white/20 rounded-lg px-1.5 py-0.5">{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="opacity-50">:</span>
                <span className="bg-white/20 rounded-lg px-1.5 py-0.5">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="opacity-50">:</span>
                <span className="bg-white/20 rounded-lg px-1.5 py-0.5">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="opacity-50">:</span>
                <span className="bg-white/20 rounded-lg px-1.5 py-0.5">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* Expanded content */}
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: expanded ? "600px" : "0", opacity: expanded ? 1 : 0 }}
        >
          <div className="px-5 pb-5 text-center space-y-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2">
              <p className="text-xl font-black">{giveaway.prize}</p>
            </div>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-3" dir="ltr">
              {units.map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-black tabular-nums bg-white/20 rounded-xl w-11 h-11 flex items-center justify-center backdrop-blur-sm">
                      {String(unit.value).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] mt-1 opacity-75">{unit.label}</span>
                  </div>
                  {i < units.length - 1 && <span className="text-lg font-bold opacity-50 -mt-4">:</span>}
                </div>
              ))}
            </div>

            {/* Registration form */}
            {registered ? (
              <div className="bg-white/15 rounded-xl p-3 flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span className="text-sm font-bold">تم تسجيلك بنجاح، بالتوفيق! 🎉</span>
              </div>
            ) : (
              <div className="space-y-2">
                {inlineMsg && (
                  <div className={`rounded-lg px-3 py-2 text-xs font-bold text-center ${
                    inlineMsg.type === "error" ? "bg-red-500/20 text-red-200" : "bg-white/15 text-green-200"
                  }`}>
                    {inlineMsg.text}
                  </div>
                )}
                <Input
                  placeholder="الاسم"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/15 border-white/20 text-white placeholder:text-white/60 text-center text-sm h-10"
                  maxLength={50}
                />
                <Input
                  placeholder="رقم الجوال"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-white/15 border-white/20 text-white placeholder:text-white/60 text-center text-sm h-10"
                  dir="ltr"
                  maxLength={15}
                />
                <Button
                  onClick={() => registerMutation.mutate()}
                  disabled={registerMutation.isPending}
                  className="w-full bg-white text-emerald-700 hover:bg-white/90 font-black text-sm"
                >
                  {registerMutation.isPending ? "جارٍ التسجيل..." : "اشترك الآن 🎁"}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <SnapchatButton />
            </div>
            <SponsorBadge />
          </div>
        </div>
      </div>
    );
  }

  // Expired but no winner yet — hide
  return null;
};

export default GiveawaySection;
