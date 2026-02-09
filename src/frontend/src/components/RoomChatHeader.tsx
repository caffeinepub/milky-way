import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, User, Image as ImageIcon, LogOut } from 'lucide-react';
import type { UserProfile } from '../backend';

interface RoomChatHeaderProps {
  currentUserProfile: UserProfile | null | undefined;
  otherUserProfile: UserProfile | null | undefined;
  onProfileClick: () => void;
  onGalleryClick: () => void;
  onLogout: () => void;
}

export default function RoomChatHeader({
  currentUserProfile,
  otherUserProfile,
  onProfileClick,
  onGalleryClick,
  onLogout,
}: RoomChatHeaderProps) {
  const currentUserImageUrl = currentUserProfile?.profilePicture?.getDirectURL();
  const otherUserImageUrl = otherUserProfile?.profilePicture?.getDirectURL();

  return (
    <header className="bg-space-dark/95 backdrop-blur-lg border-b border-cosmic-blue/30 px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left: Current User Avatar */}
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 border-2 border-cosmic-blue/50">
            {currentUserImageUrl ? (
              <AvatarImage src={currentUserImageUrl} alt={currentUserProfile?.username} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-cosmic-blue to-nebula-pink text-white">
              {currentUserProfile?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {currentUserProfile?.username || 'Loading...'}
            </span>
            {currentUserProfile?.status && (
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {currentUserProfile.status}
              </span>
            )}
          </div>
        </div>

        {/* Center: Other User Info */}
        {otherUserProfile && (
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Avatar className="w-8 h-8 border border-starlight/50">
              {otherUserImageUrl ? (
                <AvatarImage src={otherUserImageUrl} alt={otherUserProfile.username} />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-starlight to-cosmic-blue text-xs text-white">
                {otherUserProfile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-starlight">
                {otherUserProfile.username}
              </span>
              {otherUserProfile.status && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {otherUserProfile.status}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Right: Three-dots Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-cosmic-blue/20">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-lg border-cosmic-blue/30">
            <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onGalleryClick} className="cursor-pointer">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
