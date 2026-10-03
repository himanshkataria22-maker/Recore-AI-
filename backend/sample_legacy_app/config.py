"""
Sample Legacy App - Configuration and Secrets
"""
import os

DB_NAME = "legacy_billing.db"
JWT_SECRET_KEY = "super_secret_billing_prod_key_2019!!"
MASTER_PASS = "admin456"
STRIPE_LIVE_SK = "mock_sec_key_legacy_billing_prod_9901"
SENDGRID_KEY = "SG.dummy_mock_sendgrid_key_prod_992"
SLACK_WEBHOOK = "https://hooks.slack.com/services/mock/dummy/secret"
TOKEN_EXPIRY = 86400 * 30  # 30 days
API_VERSION = "v1-legacy"
