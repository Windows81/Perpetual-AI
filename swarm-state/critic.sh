set -u
mkdir -p "$SWARM_CACHE"
OUT="$SWARM_CACHE/dss_nonce_reuse.out"
BENCH="$(find . -path '*swarm/benchmarks/dss_nonce_reuse.py' -type f | head -n 1)"
if [ -z "$BENCH" ]; then
  echo "FAIL: benchmark not found"
  exit 1
fi
if python3 "$BENCH" >"$OUT" 2>&1; then
  if grep -Fq 'P_BITS=2048' "$OUT" && grep -Fq 'Q_BITS=256' "$OUT" && grep -Fq 'RECOVERED_X_MATCH=True' "$OUT"; then
    echo "PASS: DSS nonce-reuse recovery verified"
  else
    echo "FAIL: required markers missing"
    cat "$OUT"
  fi
else
  echo "FAIL: benchmark exited non-zero"
  cat "$OUT"
fi
