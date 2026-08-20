import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Atualiza a sessão do usuário a cada request. Deve ser chamado pelo
 * middleware.ts na raiz do projeto. Isso garante que o token de auth
 * não expire silenciosamente entre navegações em Server Components.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: não remova este getUser(). Ele revalida o token com o
  // servidor Supabase e evita que sessões expiradas passem despercebidas.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Bloqueia acesso a /admin para usuários não autenticados.
  // A checagem de ROLE (comercial vs administrador) fica a cargo do
  // RLS no banco e/ou de uma verificação adicional na própria página.
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
