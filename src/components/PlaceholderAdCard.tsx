import { useNavigate } from "react-router-dom";

const PlaceholderAdCard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-card flex flex-col items-center justify-center p-5 min-h-[220px]">
      <span className="text-[40px] mb-3">👓</span>
      <h3 className="font-black text-base text-foreground text-center mb-1">لمحة</h3>
      <p className="text-[12px] text-muted-foreground text-center leading-relaxed mb-3">
        شارك الجمهور إعلانك
        <br />
        وزد مبيعاتك
      </p>
      <button
        onClick={() => navigate("/add")}
        className="touch-target w-full flex items-center justify-center gap-1.5 bg-primary text-primary-foreground rounded-xl py-2.5 text-[12px] font-bold active:scale-[0.97] transition-transform"
      >
        أضف إعلانك الآن
      </button>
    </div>
  );
};

export default PlaceholderAdCard;
