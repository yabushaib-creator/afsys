#!/usr/bin/env bash
# First-time local development setup script.
# Run once after cloning: bash scripts/setup.sh

set -euo pipefail

echo "==> Setting up AFSYS development environment"

# --- Check prerequisites ---
echo "--> Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker is not installed."; exit 1; }
command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1 || { echo "ERROR: docker compose is not available."; exit 1; }

# --- Environment config ---
if [ ! -f "config/.env" ]; then
  echo "--> Copying example.env to config/.env ..."
  cp config/example.env config/.env
  echo "    IMPORTANT: Edit config/.env and fill in required values before continuing."
else
  echo "--> config/.env already exists, skipping copy."
fi

# --- Install dependencies ---
echo "--> Installing dependencies..."
# TODO: replace with your package manager install command
# npm install / pip install -r requirements.txt / etc.

# --- Start services ---
echo "--> Starting Docker services (database, cache, etc.)..."
docker compose up -d

echo "--> Waiting for database to be ready..."
sleep 3

# --- Migrations ---
echo "--> Running database migrations..."
# TODO: replace with your migration command

# --- Seed (optional) ---
# echo "--> Seeding development data..."
# TODO: replace with your seed command

echo ""
echo "==> Setup complete."
echo "    Start the app with: [your dev start command]"
echo "    App will be available at: http://localhost:3000"
