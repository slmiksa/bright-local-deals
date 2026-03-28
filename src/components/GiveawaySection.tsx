import { useState, useEffect, useMemo } from "react";
import { Gift, Trophy, ExternalLink, Check, Share2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const GiveawaySection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: giveaway } = useQuery({
    queryKey: ["active_giveaway"],
    queryFn: async () => {
      const { data } = await supabase
        .from("giveaways")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [registered, setRegistered] = useState(false);
  const [inlineMsg, setInlineMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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
    return (
      <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-white/20">
        {giveaway.sponsor_logo_url && (
          <img src={giveaway.sponsor_logo_url} alt={giveaway.sponsor_name} className="w-8 h-8 rounded-full object-cover bg-white" />
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

  const ShareButton = () => {
    const handleShare = async () => {
      const shareData = {
        title: giveaway.title,
        text: `🎁 ${giveaway.title} - الجائزة: ${giveaway.prize}\nسجّل الآن واربح!`,
        url: window.location.href,
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
          toast({ title: "تم نسخ رابط السحب 📋" });
        }
      } catch {}
    };
    return (
      <Button
        variant="secondary"
        size="sm"
        className="bg-white/20 text-white hover:bg-white/30 font-bold text-xs gap-1.5"
        onClick={handleShare}
      >
        <Share2 className="w-3.5 h-3.5" />
        مشاركة السحب
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
            <ShareButton />
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
      <div className="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-elevated">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-6 h-6" />
            <h3 className="font-black text-base">{giveaway.title}</h3>
          </div>
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
            <ShareButton />
          </div>
          <SponsorBadge />
        </div>
      </div>
    );
  }

  // Expired but no winner yet — hide
  return null;
};

export default GiveawaySection;
