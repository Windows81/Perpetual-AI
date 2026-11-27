### builder (kilo)

Run the local fixture, capture its output, and only declare success when both required recovery markers are present.

EXECUTE:
```bash
set -euo pipefail
mkdir -p "$SWARM_CACHE"
out="$SWARM_CACHE/rsa_crt_fault.out"
python3 swarm/benchmarks/rsa_crt_fault.py >"$out" 2>&1
cat "$out"
if grep -q 'RECOVERED_FACTOR' "$out" && grep -q 'RECOVERED_D' "$out"; then
  echo "PASS: RSA-CRT Bellcore fault recovery markers found"
else
  echo "FAIL: missing RECOVERED_FACTOR or RECOVERED_D"
  exit 1
fi
```
