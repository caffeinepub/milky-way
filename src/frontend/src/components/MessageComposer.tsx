import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Mic, Send, Square } from 'lucide-react';
import { useSendMessage } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';

export default function MessageComposer() {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sendMessageMutation = useSendMessage();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessageMutation.mutateAsync({ content: message, media: null });
      setMessage('');
    } catch (error: any) {
      toast.error('Failed to send message');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      
      await sendMessageMutation.mutateAsync({ content: '', media: blob });
      toast.success('Media sent!');
    } catch (error: any) {
      toast.error('Failed to send media');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const bytes = new Uint8Array(await audioBlob.arrayBuffer());
        const externalBlob = ExternalBlob.fromBytes(bytes);

        try {
          await sendMessageMutation.mutateAsync({ content: '', media: externalBlob });
          toast.success('Voice note sent!');
        } catch (error: any) {
          toast.error('Failed to send voice note');
        }

        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error: any) {
      toast.error('Microphone access denied');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  };

  return (
    <div className="bg-space-dark/95 backdrop-blur-lg border-t border-cosmic-blue/30 px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Clip Icon */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={sendMessageMutation.isPending}
          className="text-cosmic-blue hover:bg-cosmic-blue/20 flex-shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Message Input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type a message..."
          disabled={sendMessageMutation.isPending || isRecording}
          className="flex-1 bg-background/50 border-cosmic-blue/30 focus:border-cosmic-blue"
        />

        {/* Record/Send Button */}
        {message.trim() ? (
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            className="bg-gradient-to-r from-cosmic-blue to-nebula-pink hover:from-cosmic-blue/90 hover:to-nebula-pink/90 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            variant={isRecording ? 'destructive' : 'ghost'}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={sendMessageMutation.isPending}
            className={isRecording ? 'flex-shrink-0' : 'text-cosmic-blue hover:bg-cosmic-blue/20 flex-shrink-0'}
          >
            {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
