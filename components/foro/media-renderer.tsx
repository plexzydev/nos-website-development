import Image from 'next/image';

interface MediaRendererProps {
  mediaUrl?: string | null;
}

export function MediaRenderer({ mediaUrl }: MediaRendererProps) {
  if (!mediaUrl) return null;

  const urls = mediaUrl.split(',').filter(Boolean);
  
  if (urls.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {urls.map((url, i) => {
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');

        if (isVideo) {
          return (
            <video 
              key={i} 
              src={url} 
              controls 
              className="max-w-full rounded-xl border border-border bg-background/50 object-contain shadow-sm max-h-[400px]"
            />
          );
        }

        return (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="relative block max-h-[400px] overflow-hidden rounded-xl border border-border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={url} 
              alt="Media" 
              className="object-contain max-h-[400px] w-auto h-auto bg-background/50" 
            />
          </a>
        );
      })}
    </div>
  );
}
