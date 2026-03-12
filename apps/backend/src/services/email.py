"""
Email Service — Transactional emails via Resend.

Falls back to logging the email content when RESEND_API_KEY is not configured,
so local development works without an email provider.
"""

from __future__ import annotations

from src.config.settings import get_settings
from src.utils import get_logger

logger = get_logger(__name__)


def _get_reset_html(reset_url: str) -> str:
    """Simple HTML template for password reset emails."""
    return f"""\
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #333;">
  <h2>Reset your password</h2>
  <p>We received a request to reset your password. Click the button below to set a new one:</p>
  <p style="margin: 24px 0;">
    <a href="{reset_url}"
       style="background: #0070f3; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
      Reset password
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">
    This link expires in 60 minutes. If you didn&rsquo;t request this, you can safely ignore this email.
  </p>
</body>
</html>"""


async def send_password_reset_email(*, to_email: str, reset_token: str) -> bool:
    """
    Send a password reset email.

    Returns True if the email was sent (or logged in dev), False on failure.
    """
    settings = get_settings()
    reset_url = f"{settings.app_url}/reset-password?token={reset_token}"

    # If no Resend API key, log instead of sending
    if not settings.resend_api_key:
        logger.warning(
            "No RESEND_API_KEY configured — logging reset email instead of sending",
            to=to_email,
            reset_url=reset_url,
        )
        return True

    try:
        import resend

        resend.api_key = settings.resend_api_key

        resend.Emails.send(
            {
                "from": settings.email_from,
                "to": [to_email],
                "subject": "Reset your password",
                "html": _get_reset_html(reset_url),
            }
        )

        logger.info("Password reset email sent", to=to_email)
        return True

    except Exception:
        logger.exception("Failed to send password reset email", to=to_email)
        return False
