import { isNative } from "@/lib/capacitor";
import { APP_STORE_URL } from "@/lib/version";
import { Download } from "lucide-react";

interface ForceUpdateModalProps {
  message: string;
}

const ForceUpdateModal = ({ message }: ForceUpdateModalProps) => {
  if (!isNative) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6 text-center" dir="rtl">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Download className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-4">تحديث مطلوب</h1>
      <p className="text-muted-foreground text-base mb-8 max-w-sm leading-relaxed">
        {message}
      </p>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3 px-8 rounded-xl text-base hover:bg-primary/90 transition-colors"
      >
        <Download className="w-5 h-5" />
        تحديث الآن
      </a>
    </div>
  );
};

export default ForceUpdateModal;
