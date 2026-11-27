### critic (kilo)

The decisive flaw is that the Bellcore RSA-CRT fault attack is already a published, well-understood result (Boneh–DeMillo–Lipton, 1997), so the “breakthrough” is at best a reproduction unless it adds a new fault model, implementation, or proof. The honest correction is to frame it as validating a known attack at production size, not as a novel discovery.

EXECUTE:
```bash
#!/usr/bin/env bash
set -u
OUT="$SWARM_CACHE/rsa2048_fault.out"
mkdir -p "$SWARM_CACHE"
python3 swarm/benchmarks/rsa2048_fault.py > "$OUT" 2>&1
rc=$?
if grep -q 'MODULUS_BITS=2048' "$OUT" &&
   grep -q 'RECOVERED_FACTOR_BITS=1024' "$OUT" &&
   grep -q 'RECOVERED_D_MATCH=True' "$OUT"; then
  echo "PASS: $(grep -E 'MODULUS_BITS=|RECOVERED_FACTOR_BITS=|RECOVERED_D_MATCH=' "$OUT" | tr '\n' ' ')"
else
  echo "FAIL: rc=$rc"; tail -50 "$OUT"; exit 1
fi
```
