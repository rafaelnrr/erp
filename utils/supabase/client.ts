import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase para uso em Client Components ("use client").
 * Usa a anon key — a segurança real é garantida pelo RLS no Postgres,
 * nunca confie apenas na UI para bloquear ações.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
