import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Client Supabase para uso em Server Components, Server Actions e
 * Route Handlers. Lê/escreve cookies de sessão via next/headers.
 *
 * IMPORTANTE: chame createClient() a cada request — nunca reutilize
 * uma instância entre requests diferentes (cookies mudam por usuário).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll foi chamado a partir de um Server Component.
            // Pode ser ignorado se houver middleware fazendo refresh
            // de sessão (ver utils/supabase/middleware.ts).
          }
        },
      },
    }
  );
}
