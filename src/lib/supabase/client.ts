'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente Supabase para Client Components.
 * Singleton — reutilizado entre renders.
 */
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
