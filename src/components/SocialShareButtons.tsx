import { Share2 } from 'lucide-react';
import { shareOnPlatform, socialIcons, allPlatforms, type SocialPlatform } from '@/lib/social-share';

interface SocialShareButtonsProps {
  text: string;
  url: string;
  size?: 'sm' | 'md';
  showNativeShare?: boolean;
  platforms?: SocialPlatform[];
}

export default function SocialShareButtons({
  text,
  url,
  size = 'sm',
  showNativeShare = true,
  platforms = allPlatforms,
}: SocialShareButtonsProps) {
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 14 : 16;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: text, text, url }); } catch {}
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {platforms.map((platform) => {
        const icon = socialIcons[platform];
        return (
          <button
            key={platform}
            onClick={() => shareOnPlatform(platform, text, url)}
            className={`${btnSize} rounded-full text-white flex items-center justify-center hover:opacity-80 transition-opacity`}
            style={{ backgroundColor: icon.color }}
            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
          >
            <svg width={icon.size || iconSize} height={icon.size || iconSize} viewBox="0 0 24 24" fill="currentColor">
              <path d={icon.svg} />
            </svg>
          </button>
        );
      })}
      {showNativeShare && typeof navigator.share === 'function' && (
        <button onClick={handleNativeShare} className={`${btnSize} rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors`} title="Share">
          <Share2 size={iconSize} />
        </button>
      )}
    </div>
  );
}
