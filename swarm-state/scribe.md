### scribe (kilo)

Briefing:
- Claim: The fixture recovers the DSS private key exactly when two signatures reuse one nonce k at P_BITS=2048, Q_BITS=256.
- Experiment: Run swarm/benchmarks/dss_nonce_reuse.py and inspect its stdout markers.
- Flaw: Nonce reuse makes the two signature equations jointly solvable for x; unique k defeats recovery.
- Verify: Require P_BITS=2048, Q_BITS=256, RECOVERED_X_MATCH=True, then print PASS:.

EXECUTE:
```bash
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
```
