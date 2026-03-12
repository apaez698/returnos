import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/server";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { getRedirectPathForMembershipStatus } from "@/lib/auth/membership-types";

/**
 * Handles both Supabase auth flows:
 * - PKCE (magic link / OAuth): ?code=xxx  → exchangeCodeForSession
 * - Email OTP: ?token_hash=xxx&type=xxx  → verifyOtp
 *
 * After exchanging, cookies are set by @supabase/ssr and the user is
 * redirected to the intended destination (default: /dashboard).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "magiclink"
    | "signup"
    | "email"
    | "recovery"
    | null;
  const nextValue = searchParams.get("next") ?? "/dashboard";
  const next = nextValue.startsWith("/") ? nextValue : "/dashboard";

  const supabase = await createServerAuthClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && type) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  }

  if (type === "signup") {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/login?confirmed=1`);
  }

  const resolution = await getCurrentMembershipResolution();
  const membershipRedirect = getRedirectPathForMembershipStatus(
    resolution.status,
  );

  if (membershipRedirect && membershipRedirect !== "/login") {
    return NextResponse.redirect(`${origin}${membershipRedirect}`);
  }

  if (membershipRedirect === "/login") {
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
