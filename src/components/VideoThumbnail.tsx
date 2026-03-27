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
        <div className="w-full h-full bg-muted" />
      )}
      <div className="absolute bottom-2 left-2 bg-foreground/60 backdrop-blur-sm rounded-full p-1 pointer-events-none">
        <Play className="w-3 h-3 text-primary-foreground fill-primary-foreground" />
      </div>
    </div>
  );
};

export default VideoThumbnail;
