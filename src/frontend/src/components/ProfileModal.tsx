import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUpdateProfile } from '../hooks/useQueries';
import { ExternalBlob } from '../backend';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import type { UserProfile } from '../backend';

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserProfile: UserProfile | null | undefined;
}

export default function ProfileModal({ open, onOpenChange, currentUserProfile }: ProfileModalProps) {
  const [status, setStatus] = useState(currentUserProfile?.status || '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<ExternalBlob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateProfileMutation = useUpdateProfile();

  const currentImageUrl = currentUserProfile?.profilePicture?.getDirectURL();

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes);
    setImageBlob(blob);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        profilePicture: imageBlob || currentUserProfile?.profilePicture || null,
        status,
      });
      toast.success('Profile updated!');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg border-cosmic-blue/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-cosmic-blue/50">
                {(selectedImage || currentImageUrl) ? (
                  <AvatarImage src={selectedImage || currentImageUrl} alt="Profile" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-cosmic-blue to-nebula-pink text-white text-2xl">
                  {currentUserProfile?.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-foreground">Status</Label>
            <Input
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="What's on your mind?"
              className="bg-background/50 border-cosmic-blue/30 focus:border-cosmic-blue"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-cosmic-blue/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
            className="bg-gradient-to-r from-cosmic-blue to-nebula-pink hover:from-cosmic-blue/90 hover:to-nebula-pink/90"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
