import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChatMessage } from '../backend';

interface MessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const mediaUrl = message.media?.getDirectURL();
  const isImage = mediaUrl && (mediaUrl.includes('image') || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i));
  const isVideo = mediaUrl && (mediaUrl.includes('video') || mediaUrl.match(/\.(mp4|webm|ogg)$/i));
  const isAudio = mediaUrl && !isImage && !isVideo;

  const handleAudioToggle = () => {
    if (!audioElement) {
      const audio = new Audio(mediaUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setAudioElement(audio);
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className={`flex gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 border border-cosmic-blue/30 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-cosmic-blue to-nebula-pink text-white text-xs">
          {isCurrentUser ? 'Y' : 'T'}
        </AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? 'bg-gradient-to-br from-cosmic-blue to-nebula-pink text-white'
            : 'bg-card/90 backdrop-blur-sm border border-cosmic-blue/30 text-foreground'
        }`}
      >
        {message.content && (
          <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
        )}

        {mediaUrl && isImage && (
          <img
            src={mediaUrl}
            alt="Shared image"
            className="mt-2 rounded-lg max-w-full h-auto"
            loading="lazy"
          />
        )}

        {mediaUrl && isVideo && (
          <video
            src={mediaUrl}
            controls
            className="mt-2 rounded-lg max-w-full h-auto"
            playsInline
          />
        )}

        {mediaUrl && isAudio && (
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAudioToggle}
              className={isCurrentUser ? 'text-white hover:bg-white/20' : 'hover:bg-cosmic-blue/20'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <span className="text-xs">Voice note</span>
          </div>
        )}
      </div>
    </div>
  );
}
