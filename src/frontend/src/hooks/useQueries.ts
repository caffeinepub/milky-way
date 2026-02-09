import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ChatMessage } from '../backend';
import { ExternalBlob } from '../backend';
import type { Principal } from '@dfinity/principal';

export function useLogin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Normalize username to lowercase to match backend credentials
      const normalizedUsername = username.toLowerCase();
      
      try {
        // Send password as plain string (backend expects Text, not Blob)
        const profile = await actor.login(normalizedUsername, password);
        return { profile, username: normalizedUsername };
      } catch (error: any) {
        // Normalize backend error messages to user-friendly English
        const errorMessage = error.message || String(error);
        
        // Handle authorization/role-related errors
        if (errorMessage.includes('only admin can assign user roles') ||
            errorMessage.includes('admin') ||
            errorMessage.includes('role')) {
          throw new Error('Authentication system error. Please try again.');
        }
        
        // Handle credential errors
        if (errorMessage.includes('Incorrect password') || 
            errorMessage.includes('User not found') ||
            errorMessage.includes('password') ||
            errorMessage.includes('not found')) {
          throw new Error('Incorrect username or password.');
        }
        
        // Preserve unexpected errors for debugging
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetOtherUserProfile(otherUserPrincipal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['otherUserProfile', otherUserPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !otherUserPrincipal) return null;
      return actor.getUserProfile(otherUserPrincipal);
    },
    enabled: !!actor && !actorFetching && !!otherUserPrincipal,
    retry: false,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ profilePicture, status }: { profilePicture: ExternalBlob | null; status: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateProfile(profilePicture, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['otherUserProfile'] });
    },
  });
}

export function useGetMessages() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['messages'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, media }: { content: string; media: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendMessage(content, media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    },
  });
}

export function useGetGallery() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ExternalBlob[]>({
    queryKey: ['gallery'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGallery();
    },
    enabled: !!actor && !actorFetching,
  });
}
