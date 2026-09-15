import { NextResponse, type NextRequest } from "next/server";

import { getSessionClient } from "@/lib/supabase/server";

/**
 * Where every email link lands: confirmation, magic link, and password reset.
 *
 * Supabase sends a one-time `code` that has to be exchanged for a session
 * before the cookie exists. Without this route those links appear to work and
 * then drop the user on a signed-out page, which is a confusing failure to
 * debug because nothing errors.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");

  // Same-origin relative paths only — this value comes from a URL.
  const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/account";

  // Supabase reports link problems here (expired, already used).
  const authError = searchParams.get("error_description") ?? searchParams.get("error");
  if (authError) {
    console.error("[auth/callback] link rejected:", authError);
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  const supabase = await getSessionClient();
  if (!supabase) {
    return NextResponse.redirect(`${origin}/login?error=config`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] code exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
