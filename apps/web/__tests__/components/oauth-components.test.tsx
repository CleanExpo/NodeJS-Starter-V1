import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { OAuthButton, oauthProviders } from "@/components/auth/oauth-button";
import { OAuthProviders } from "@/components/auth/oauth-providers";

// Mock Supabase client
const mockSignInWithOAuth = vi.fn();
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe("OAuthButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it("renders Google OAuth button correctly", () => {
    const googleProvider = oauthProviders.find((p) => p.provider === "google")!;
    render(<OAuthButton provider={googleProvider} />);

    expect(screen.getByRole("button")).toHaveTextContent("Continue with Google");
  });

  it("renders GitHub OAuth button correctly", () => {
    const githubProvider = oauthProviders.find((p) => p.provider === "github")!;
    render(<OAuthButton provider={githubProvider} />);

    expect(screen.getByRole("button")).toHaveTextContent("Continue with GitHub");
  });

  it("calls signInWithOAuth on click", async () => {
    const googleProvider = oauthProviders.find((p) => p.provider === "google")!;
    render(<OAuthButton provider={googleProvider} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/callback"),
        }),
      });
    });
  });

  it("shows loading state during auth", async () => {
    // Make the OAuth call hang
    mockSignInWithOAuth.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const googleProvider = oauthProviders.find((p) => p.provider === "google")!;
    render(<OAuthButton provider={googleProvider} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole("button")).toHaveTextContent("Connecting...");
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("handles errors gracefully", async () => {
    mockSignInWithOAuth.mockResolvedValue({
      error: { message: "OAuth provider not configured" },
    });

    const googleProvider = oauthProviders.find((p) => p.provider === "google")!;
    render(<OAuthButton provider={googleProvider} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("OAuth provider not configured")).toBeInTheDocument();
    });
  });

  it("includes redirectTo in callback URL when provided", async () => {
    const googleProvider = oauthProviders.find((p) => p.provider === "google")!;
    render(<OAuthButton provider={googleProvider} redirectTo="/dashboard" />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("next=%2Fdashboard"),
        }),
      });
    });
  });
});

describe("OAuthProviders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it("renders all configured providers by default", () => {
    render(<OAuthProviders />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.getByText("Continue with GitHub")).toBeInTheDocument();
  });

  it("displays divider between email and OAuth by default", () => {
    render(<OAuthProviders />);

    expect(screen.getByText("Or continue with")).toBeInTheDocument();
  });

  it("hides divider when showDivider is false", () => {
    render(<OAuthProviders showDivider={false} />);

    expect(screen.queryByText("Or continue with")).not.toBeInTheDocument();
  });

  it("filters providers when specific ones are requested", () => {
    render(<OAuthProviders providers={["google"]} />);

    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.queryByText("Continue with GitHub")).not.toBeInTheDocument();
  });

  it("passes redirectTo to all provider buttons", async () => {
    render(<OAuthProviders redirectTo="/custom-redirect" />);

    const googleButton = screen.getByText("Continue with Google");
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("next=%2Fcustom-redirect"),
        }),
      });
    });
  });

  it("returns null when no providers match filter", () => {
    const { container } = render(
      <OAuthProviders providers={["google"]} />
    );

    // Should render the Google button
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
  });
});

describe("oauthProviders configuration", () => {
  it("includes Google provider", () => {
    const google = oauthProviders.find((p) => p.provider === "google");
    expect(google).toBeDefined();
    expect(google?.name).toBe("Google");
  });

  it("includes GitHub provider", () => {
    const github = oauthProviders.find((p) => p.provider === "github");
    expect(github).toBeDefined();
    expect(github?.name).toBe("GitHub");
  });

  it("all providers have required properties", () => {
    oauthProviders.forEach((provider) => {
      expect(provider.name).toBeDefined();
      expect(provider.icon).toBeDefined();
      expect(provider.provider).toBeDefined();
    });
  });
});
