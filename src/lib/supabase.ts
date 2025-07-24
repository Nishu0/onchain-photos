import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type User = {
  id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
};

export type MemoryForm = {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type FormOwner = {
  id: string;
  form_id: string;
  wallet_address: string;
  created_at: string;
};

export type Photo = {
  id: string;
  form_id: string;
  pinata_url: string;
  pinata_cid: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
};

// Extended types for API responses
export type MemoryFormWithDetails = MemoryForm & {
  photos: Photo[];
  form_owners: FormOwner[];
  user: User;
};

export type CreateMemoryFormData = {
  title: string;
  description?: string;
  owners: string[];
  photos: File[];
};

export type UploadPhotoData = {
  form_id: string;
  file: File;
}; 