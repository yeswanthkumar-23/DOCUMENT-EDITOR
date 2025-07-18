import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Document = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  created_by: string
  last_edited_by: string
  is_public: boolean
}

export type DocumentCollaborator = {
  id: string
  document_id: string
  user_id: string
  permission: "read" | "write" | "admin"
  created_at: string
}

export type DocumentSession = {
  id: string
  document_id: string
  user_id: string
  cursor_position: any
  is_typing: boolean
  last_seen: string
  created_at: string
}
