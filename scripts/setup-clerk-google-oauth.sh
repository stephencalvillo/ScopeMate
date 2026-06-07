#!/usr/bin/env bash
set -euo pipefail

# ScopeMate — Google OAuth credentials for Clerk production.
# Run: ./scripts/setup-clerk-google-oauth.sh [google-cloud-project-id]

REDIRECT_URI="https://clerk.myscopemate.ai/v1/oauth_callback"
APP_NAME="ScopeMate"
PROJECT_ID="${1:-}"

echo ""
echo "ScopeMate · Google OAuth for Clerk (production)"
echo "================================================"
echo ""
echo "Clerk redirect URI (paste this into Google exactly):"
echo "  ${REDIRECT_URI}"
echo ""

if [[ -n "${PROJECT_ID}" ]]; then
  CONSENT_URL="https://console.cloud.google.com/auth/branding?project=${PROJECT_ID}"
  CREATE_URL="https://console.cloud.google.com/auth/clients/create?project=${PROJECT_ID}"
  CREDENTIALS_URL="https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
else
  CONSENT_URL="https://console.cloud.google.com/auth/branding"
  CREATE_URL="https://console.cloud.google.com/auth/clients/create"
  CREDENTIALS_URL="https://console.cloud.google.com/apis/credentials"
fi

echo "Steps:"
echo "  1. OAuth consent screen → set app name to \"${APP_NAME}\""
echo "  2. Create OAuth client → Web application"
echo "  3. Add authorized redirect URI (above)"
echo "  4. Copy Client ID + Client secret into Clerk → Google → Custom credentials"
echo ""

if command -v pbcopy >/dev/null 2>&1; then
  printf '%s' "${REDIRECT_URI}" | pbcopy
  echo "Redirect URI copied to clipboard."
  echo ""
fi

read -r -p "Open Google OAuth consent screen in browser? [Y/n] " open_consent
open_consent="${open_consent:-Y}"
if [[ "${open_consent}" =~ ^[Yy]$ ]]; then
  open "${CONSENT_URL}"
  sleep 1
fi

read -r -p "Open Create OAuth client page in browser? [Y/n] " open_create
open_create="${open_create:-Y}"
if [[ "${open_create}" =~ ^[Yy]$ ]]; then
  open "${CREATE_URL}"
fi

echo ""
echo "When Google shows your new client:"
echo "  • Client ID     → Clerk \"Client ID\""
echo "  • Client secret → Clerk \"Client secret\""
echo ""
echo "Clerk scopes (leave as-is): openid, email, profile"
echo ""
read -r -p "Open credentials list (to copy ID/secret)? [Y/n] " open_creds
open_creds="${open_creds:-Y}"
if [[ "${open_creds}" =~ ^[Yy]$ ]]; then
  open "${CREDENTIALS_URL}"
fi

echo ""
echo "Done. Test \"Continue with Google\" on https://myscopemate.ai after saving in Clerk."
