import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";

const LAUNCH_DATE = new Date();
LAUNCH_DATE.setMonth(LAUNCH_DATE.getMonth() + 1);
const LAUNCH_TIMESTAMP = LAUNCH_DATE.getTime();

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const diff = Math.max(0, LAUNCH_TIMESTAMP - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "ثانية", value: timeLeft.seconds },
    { label: "دقيقة", value: timeLeft.minutes },
    { label: "ساعة", value: timeLeft.hours },
    { label: "يوم", value: timeLeft.days },
  ];

  return (
    <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-elevated">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Rocket className="w-5 h-5" />
        <h3 className="font-bold text-[14px]">التدشين الرسمي قريباً!</h3>
      </div>
      <div className="flex items-center justify-center gap-3" dir="ltr">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black tabular-nums bg-primary-foreground/20 rounded-xl w-12 h-12 flex items-center justify-center backdrop-blur-sm">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="text-[10px] mt-1 opacity-80">{unit.label}</span>
            </div>
            {i < units.length - 1 && <span className="text-xl font-bold opacity-60 -mt-4">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountdownTimer;
