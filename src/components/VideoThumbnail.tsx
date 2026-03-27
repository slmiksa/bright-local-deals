import { Play } from "lucide-react";
import { useVideoPoster } from "@/hooks/useVideoPoster";

interface VideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const VideoThumbnail = ({ src, alt, className = "", onClick }: VideoThumbnailProps) => {
  const poster = useVideoPoster(src);

  return (
    <div className={`relative cursor-pointer ${className}`} onClick={onClick}>
      {poster ? (
        <img src={poster} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20 pointer-events-none">
        <Play className="w-10 h-10 text-primary-foreground fill-primary-foreground drop-shadow-lg" />
      </div>
    </div>
  );
};

export default VideoThumbnail;
