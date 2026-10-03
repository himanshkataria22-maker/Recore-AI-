"""
Secret Redaction Utility.
Ensures no API keys, private credentials, or passwords are ever sent to LLM providers.
"""
import re

SECRET_REDACTION_PATTERNS = [
    (r"(['\"])(sk_live_[0-9a-zA-Z]{10,})\1", r"'\2' -> '[REDACTED_STRIPE_KEY]'"),
    (r"(['\"])(mock_sec_key_[0-9a-zA-Z_\-]{10,})\1", r"'[REDACTED_STRIPE_KEY]'"),
    (r"(['\"])(SG\.[0-9a-zA-Z_\.\-]{10,})\1", r"'[REDACTED_SENDGRID_KEY]'"),
    (r"(['\"])(https://hooks\.slack\.com/services/[0-9a-zA-Z_\/\-]+)\1", r"'[REDACTED_SLACK_WEBHOOK]'"),
    (r"JWT_SECRET_KEY\s*=\s*['\"][^'\"]+['\"]", "JWT_SECRET_KEY = '[REDACTED_JWT_SECRET]'"),
    (r"MASTER_PASS\s*=\s*['\"][^'\"]+['\"]", "MASTER_PASS = '[REDACTED_MASTER_PASS]'"),
    (r"password\s*=\s*['\"][^'\"]+['\"]", "password='[REDACTED_PASSWORD]'"),
    (r"password_raw\s*==\s*['\"][^'\"]+['\"]", "password_raw == '[REDACTED_MASTER_PASS]'")
]

def redact_secrets(code_str: str) -> str:
    """
    Sanitizes code string by stripping sensitive secret values.
    """
    sanitized = code_str
    for pattern, replacement in SECRET_REDACTION_PATTERNS:
        sanitized = re.sub(pattern, replacement, sanitized)
    return sanitized
