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
  const { pathname, searchParams } = request.nextUrl;

  /*
   * Rescue an auth code that landed on the wrong page.
   *
   * Supabase silently falls back to the project's Site URL when the
   * `emailRedirectTo` we ask for isn't in its allow-list — a `www` vs apex
   * mismatch is enough. The user then lands on the homepage carrying
   * `?code=…`, nothing exchanges it, and they stay signed out with no error
   * anywhere. Funnelling any stray code to the callback makes email links work
   * whichever allowed URL Supabase picks.
   */
  if (pathname !== "/auth/callback" && searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    if (!searchParams.has("next")) {
      url.searchParams.set("next", pathname === "/" ? "/account" : pathname);
    }
    return NextResponse.redirect(url);
  }

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
  // "/" is included so a stray auth code landing on the homepage gets rescued
  // by the block above.
  matcher: ["/", "/admin/:path*", "/account/:path*"],
};
