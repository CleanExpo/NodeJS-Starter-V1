"use client";

import { OAuthButton, oauthProviders } from "./oauth-button";

interface OAuthProvidersProps {
  /**
   * URL to redirect to after successful authentication
   */
  redirectTo?: string;
  /**
   * Whether to show only specific providers
   * If not provided, shows all available providers
   */
  providers?: ("google" | "github")[];
  /**
   * Whether to show the divider with "or continue with" text
   */
  showDivider?: boolean;
}

/**
 * OAuth Providers Container
 *
 * Displays OAuth authentication buttons for configured providers.
 * Can be used in login and registration forms.
 */
export function OAuthProviders({
  redirectTo,
  providers,
  showDivider = true,
}: OAuthProvidersProps) {
  // Filter providers if specific ones are requested
  const displayProviders = providers
    ? oauthProviders.filter((p) =>
        providers.includes(p.provider as "google" | "github")
      )
    : oauthProviders;

  if (displayProviders.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {showDivider && (
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {displayProviders.map((provider) => (
          <OAuthButton
            key={provider.provider}
            provider={provider}
            redirectTo={redirectTo}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Default export for convenience
 */
export default OAuthProviders;
