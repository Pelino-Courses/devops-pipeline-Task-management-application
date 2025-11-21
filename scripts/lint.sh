#!/usr/bin/env bash
set -euo pipefail

echo "Local lint helper — checks Dockerfiles, docker-compose, and Ansible (if present)."

MISSING=()
command -v hadolint >/dev/null 2>&1 || MISSING+=(hadolint)
command -v docker-compose >/dev/null 2>&1 || MISSING+=(docker-compose)
command -v yamllint >/dev/null 2>&1 || MISSING+=(yamllint)
command -v ansible-lint >/dev/null 2>&1 || MISSING+=(ansible-lint)

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "Missing tools: ${MISSING[*]}"
  echo "Install locally to run full checks. Example installs:"
  echo "  hadolint: https://github.com/hadolint/hadolint#installing"
  echo "  yamllint & ansible-lint: pip3 install yamllint ansible-lint"
  echo "  docker-compose: see https://docs.docker.com/compose/"
fi

if command -v hadolint >/dev/null 2>&1; then
  echo "Running hadolint on backend/Dockerfile and backend/Dockerfile.prod"
  hadolint backend/Dockerfile || true
  hadolint backend/Dockerfile.prod || true
fi

if command -v docker-compose >/dev/null 2>&1; then
  echo "Validating docker-compose.yml"
  docker-compose -f docker-compose.yml config || true
  echo "Validating docker-compose.prod.yml"
  docker-compose -f docker-compose.prod.yml config || true
fi

if command -v yamllint >/dev/null 2>&1; then
  echo "Running yamllint on repo"
  yamllint . || true
fi

# Run ansible-lint only if playbooks are present
playbooks=$(find . -type f -name "*.yml" -o -name "*.yaml" | xargs grep -l "hosts:\|tasks:\|roles:" || true)
if [ -n "$playbooks" ] && command -v ansible-lint >/dev/null 2>&1; then
  echo "Running ansible-lint on detected playbooks"
  ansible-lint $playbooks || true
else
  echo "No Ansible playbooks detected or ansible-lint missing; skipping"
fi

echo "Local lint helper finished."