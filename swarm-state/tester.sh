set -euo pipefail
mkdir -p "$SWARM_CACHE"
out="$SWARM_CACHE/rsa_crt_fault.out"
python3 swarm/benchmarks/rsa_crt_fault.py >"$out" 2>&1
if grep -q 'RECOVERED_FACTOR' "$out" && grep -q 'RECOVERED_D' "$out" && grep -Eq '(^|[[:space:]])PASS([[:space:]]|$)' "$out"; then
  cat "$out"
  echo "PASS: RSA-CRT Bellcore fault reproduced; factor and d recovered"
else
  cat "$out"
  echo "FAIL: missing RECOVERED_FACTOR/RECOVERED_D or final PASS"
  exit 1
fi
