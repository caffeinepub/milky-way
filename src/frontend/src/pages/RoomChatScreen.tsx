import { useState, useEffect, useRef } from 'react';
import { usePasswordSession } from '../auth/usePasswordSession';
import { useGetCallerProfile, useGetMessages, useGetOtherUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import RoomChatHeader from '../components/RoomChatHeader';
import MessageList from '../components/MessageList';
import MessageComposer from '../components/MessageComposer';
import ProfileModal from '../components/ProfileModal';
import GalleryModal from '../components/GalleryModal';
import type { Principal } from '@dfinity/principal';

export default function RoomChatScreen() {
  const { clearSession, username } = usePasswordSession();
  const queryClient = useQueryClient();
  const { data: currentUserProfile } = useGetCallerProfile();
  const { data: messages } = useGetMessages();
  const [showProfile, setShowProfile] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get other user's principal from messages
  // Compare by username since we don't have principal stored
  const otherUserPrincipal: Principal | null = messages && messages.length > 0 && currentUserProfile
    ? messages.find(msg => {
        // Find a message not sent by current user
        return messages.some(m => m.sender.toString() !== msg.sender.toString());
      })?.sender || null
    : null;

  const { data: otherUserProfile } = useGetOtherUserProfile(otherUserPrincipal);

  const handleLogout = () => {
    clearSession();
    queryClient.clear();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div 
      className="h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/assets/generated/milky-way-chat-bg.dim_1440x2560.png)' }}
    >
      {/* Header */}
      <RoomChatHeader
        currentUserProfile={currentUserProfile}
        otherUserProfile={otherUserProfile}
        onProfileClick={() => setShowProfile(true)}
        onGalleryClick={() => setShowGallery(true)}
        onLogout={handleLogout}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages || []} currentUsername={username} />
        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <MessageComposer />

      {/* Modals */}
      <ProfileModal
        open={showProfile}
        onOpenChange={setShowProfile}
        currentUserProfile={currentUserProfile}
      />
      <GalleryModal
        open={showGallery}
        onOpenChange={setShowGallery}
      />
    </div>
  );
}
