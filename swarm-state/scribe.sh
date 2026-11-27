#!/usr/bin/env bash
set -u
CACHE="${SWARM_CACHE:-/tmp/swarm_cache}"
mkdir -p "$CACHE"
out="$CACHE/dss_nonce_reuse.out"
if python3 swarm/benchmarks/dss_nonce_reuse.py >"$out" 2>&1; then
  if grep -q 'P_BITS=2048' "$out" && grep -q 'Q_BITS=256' "$out" && grep -q 'RECOVERED_X_MATCH=True' "$out"; then
    echo "PASS: DSS nonce-reuse recovery verified"
  else
    echo "FAIL: required markers missing"
    cat "$out"
    exit 1
  fi
else
  echo "FAIL: fixture exited non-zero"
  cat "$out"
  exit 1
fi
