import { Clapperboard, Podcast } from "lucide-react";

const ComingSoonSection = () => {
  return (
    <section className="px-5 pt-5">
      <div className="grid grid-cols-2 gap-3">
        {/* لقاءات لمحة الحصرية */}
        <div className="relative bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2.5 opacity-75 select-none">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Podcast className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-[13px] font-bold text-foreground text-center leading-tight">
            لقاءات لمحة 
          </h3>
          <span className="text-[11px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            قريباً
          </span>
        </div>

        {/* تغطيات لمحة المتميزة */}
        <div className="relative bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2.5 opacity-75 select-none">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(40,65%,42%)] flex items-center justify-center shadow-md">
            <Clapperboard className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-[13px] font-bold text-foreground text-center leading-tight">
            تغطيات لمحة 
          </h3>
          <span className="text-[11px] font-bold text-[hsl(var(--gold))] bg-[hsl(var(--gold))/0.1] px-3 py-1 rounded-full">
            قريباً
          </span>
        </div>
      </div>
    </section>);

};

export default ComingSoonSection;