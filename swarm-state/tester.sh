#!/usr/bin/env bash
set -u
mkdir -p "${SWARM_CACHE:?}"
out="$SWARM_CACHE/dss_nonce_reuse.out"
fixture="swarm/benchmarks/dss_nonce_reuse.py"
if [[ ! -f "$fixture" ]]; then
  echo "FAIL: missing fixture $fixture"
  exit 1
fi
if ! python3 "$fixture" >"$out" 2>&1; then
  echo "FAIL: fixture exited non-zero"
  cat "$out"
  exit 1
fi
if grep -Fq 'P_BITS=2048' "$out" && grep -Fq 'Q_BITS=256' "$out" && grep -Fq 'RECOVERED_X_MATCH=True' "$out"; then
  echo "PASS: P_BITS=2048, Q_BITS=256, RECOVERED_X_MATCH=True"
else
  echo "FAIL: required markers not all present"
  cat "$out"
  exit 1
fi
