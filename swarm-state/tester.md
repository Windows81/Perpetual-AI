### tester (kilo)

The fixture itself is the deterministic reproduction; success is defined by its three emitted markers.

EXECUTE:
```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="${SWARM_ROOT:-/app}"
[ -f "$ROOT/swarm/benchmarks/rsa2048_fault.py" ] || ROOT="."
mkdir -p "$SWARM_CACHE"
out="$SWARM_CACHE/rsa2048_fault.out"
python3 "$ROOT/swarm/benchmarks/rsa2048_fault.py" > "$out" 2>&1
cat "$out"
if grep -q 'MODULUS_BITS=2048' "$out" && \
   grep -q 'RECOVERED_FACTOR_BITS=1024' "$out" && \
   grep -q 'RECOVERED_D_MATCH=True' "$out"; then
  echo "PASS: RSA-CRT Bellcore fault attack reproduced"
else
  echo "FAIL: required attack markers missing"
  exit 1
fi
```
