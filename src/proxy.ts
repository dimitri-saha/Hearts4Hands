import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth cookie on signed-in routes.
 *
 * Next 16 renamed the `middleware` convention to `proxy`; behaviour is
 * unchanged.
 *
 * Without this, a session silently expires mid-task and the next server action
 * bounces the user to a login screen. Scoped to the two signed-in areas so the
 * public marketing pages stay fully static.
 */
export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
