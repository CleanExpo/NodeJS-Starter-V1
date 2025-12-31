import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * OAuth Callback Route Handler
 *
 * This route handles the callback from OAuth providers (Google, GitHub, etc.)
 * after the user has authenticated with the provider.
 *
 * Flow:
 * 1. User clicks "Sign in with Google"
 * 2. User is redirected to Google for authentication
 * 3. Google redirects back to this callback URL with a code
 * 4. This handler exchanges the code for a session
 * 5. User is redirected to the dashboard
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Successful authentication - redirect to the intended destination
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";

    if (isLocalEnv) {
      // In development, redirect to origin
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      // In production with a proxy, use the forwarded host
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      // Fallback to origin
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code provided - redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("No authorization code provided")}`
  );
}
