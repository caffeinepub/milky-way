import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetGallery } from '../hooks/useQueries';
import { Play } from 'lucide-react';

interface GalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GalleryModal({ open, onOpenChange }: GalleryModalProps) {
  const { data: gallery } = useGetGallery();
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const handleMediaClick = (url: string) => {
    setSelectedMedia(url);
  };

  const handleCloseViewer = () => {
    setSelectedMedia(null);
  };

  if (selectedMedia) {
    const isVideo = selectedMedia.includes('video') || selectedMedia.match(/\.(mp4|webm|ogg)$/i);
    const isAudio = !selectedMedia.includes('image') && !isVideo;

    return (
      <Dialog open={!!selectedMedia} onOpenChange={handleCloseViewer}>
        <DialogContent className="bg-space-dark/95 backdrop-blur-lg border-cosmic-blue/30 max-w-4xl">
          {isVideo ? (
            <video src={selectedMedia} controls className="w-full rounded-lg" playsInline />
          ) : isAudio ? (
            <div className="flex items-center justify-center p-8">
              <audio src={selectedMedia} controls className="w-full" />
            </div>
          ) : (
            <img src={selectedMedia} alt="Gallery item" className="w-full rounded-lg" />
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg border-cosmic-blue/30 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Gallery</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {!gallery || gallery.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No media shared yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {gallery.map((media, index) => {
                const url = media.getDirectURL();
                const isVideo = url.includes('video') || url.match(/\.(mp4|webm|ogg)$/i);
                const isAudio = !url.includes('image') && !isVideo;

                return (
                  <div
                    key={index}
                    onClick={() => handleMediaClick(url)}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-muted"
                  >
                    {isVideo ? (
                      <>
                        <video src={url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </>
                    ) : isAudio ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cosmic-blue to-nebula-pink">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
