import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { getSessionClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/utils";

/**
 * Verifies an emailed one-time token and signs the visitor in.
 *
 * Why this exists alongside /auth/callback: emails started *by the visitor* —
 * sign-up, magic link, password reset — go through PKCE, which returns a
 * `?code=` that /auth/callback exchanges. An admin **invitation** is started by
 * us, from the server, so there is no PKCE verifier; Supabase falls back to the
 * implicit flow and puts the session in the URL fragment (`#access_token=…`).
 * Browsers never send the fragment to the server, so a cookie-based app can't
 * see it: the invitee lands on the home page signed out, with an account that
 * is confirmed but has no password.
 *
 * The fix is Supabase's documented pattern for server-rendered apps. The email
 * template links here with `?token_hash=…&type=…`, and this route verifies the
 * hash server-side with `verifyOtp`, which sets the session cookie directly.
 */
const ALLOWED: EmailOtpType[] = ["invite", "signup", "magiclink", "recovery", "email_change", "email"];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(searchParams.get("next"));

  if (!tokenHash || !type || !ALLOWED.includes(type)) {
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  const supabase = await getSessionClient();
  if (!supabase) return NextResponse.redirect(`${origin}/login?error=config`);

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) {
    // Expired, already used, or tampered with. Same outcome as a bad callback.
    console.error("[auth/confirm] verifyOtp failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
