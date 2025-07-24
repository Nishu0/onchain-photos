import { RealtimeChannel, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload, RealtimePostgresDeletePayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { MemoryForm, Photo, User, FormOwner } from './supabase';

// Channel names
export const REALTIME_CHANNELS = {
  MEMORY_FORMS: 'memory_forms',
  PHOTOS: 'photos',
  FORM_OWNERS: 'form_owners',
  USERS: 'users'
} as const;

type MemoryFormPayload = 
  | RealtimePostgresInsertPayload<MemoryForm>
  | RealtimePostgresUpdatePayload<MemoryForm>
  | RealtimePostgresDeletePayload<MemoryForm>;

type PhotoPayload = 
  | RealtimePostgresInsertPayload<Photo>
  | RealtimePostgresUpdatePayload<Photo>
  | RealtimePostgresDeletePayload<Photo>;

type FormOwnerPayload = 
  | RealtimePostgresInsertPayload<FormOwner>
  | RealtimePostgresUpdatePayload<FormOwner>
  | RealtimePostgresDeletePayload<FormOwner>;

type UserPayload = 
  | RealtimePostgresInsertPayload<User>
  | RealtimePostgresUpdatePayload<User>
  | RealtimePostgresDeletePayload<User>;

// Subscription handlers
export function subscribeToMemoryForms(
  callback: (payload: MemoryFormPayload | null) => void,
  userId?: string
): RealtimeChannel {
  const channel = supabase.channel(REALTIME_CHANNELS.MEMORY_FORMS);
  
  if (userId) {
    // Subscribe to forms created by or owned by specific user
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memory_forms',
        filter: `created_by=eq.${userId}`
      },
      (payload) => callback(payload as MemoryFormPayload)
    );
  } else {
    // Subscribe to all memory forms
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memory_forms'
      },
      (payload) => callback(payload as MemoryFormPayload)
    );
  }
  
  return channel.subscribe();
}

export function subscribeToPhotos(
  callback: (payload: PhotoPayload | null) => void,
  formId?: string
): RealtimeChannel {
  const channel = supabase.channel(REALTIME_CHANNELS.PHOTOS);
  
  if (formId) {
    // Subscribe to photos for specific form
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos',
        filter: `form_id=eq.${formId}`
      },
      (payload) => callback(payload as PhotoPayload)
    );
  } else {
    // Subscribe to all photos
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'photos'
      },
      (payload) => callback(payload as PhotoPayload)
    );
  }
  
  return channel.subscribe();
}

export function subscribeToFormOwners(
  callback: (payload: FormOwnerPayload | null) => void,
  formId?: string
): RealtimeChannel {
  const channel = supabase.channel(REALTIME_CHANNELS.FORM_OWNERS);
  
  if (formId) {
    // Subscribe to owners for specific form
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'form_owners',
        filter: `form_id=eq.${formId}`
      },
      (payload) => callback(payload as FormOwnerPayload)
    );
  } else {
    // Subscribe to all form owners
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'form_owners'
      },
      (payload) => callback(payload as FormOwnerPayload)
    );
  }
  
  return channel.subscribe();
}

export function subscribeToUsers(
  callback: (payload: UserPayload | null) => void
): RealtimeChannel {
  return supabase
    .channel(REALTIME_CHANNELS.USERS)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users'
      },
      (payload) => callback(payload as UserPayload)
    )
    .subscribe();
}

export function subscribeToUserMemories(
  walletAddress: string,
  callback: (payload: MemoryFormPayload | null) => void
): RealtimeChannel {
  const channel = supabase.channel(`user_memories_${walletAddress}`);
  
  // Subscribe to memory forms where user is creator or owner
  channel
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memory_forms'
      },
      (payload) => callback(payload as MemoryFormPayload)
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'form_owners',
        filter: `wallet_address=eq.${walletAddress}`
      },
      () => {
        // When user is added/removed as owner, trigger callback
        callback(null);
      }
    );
  
  return channel.subscribe();
}
