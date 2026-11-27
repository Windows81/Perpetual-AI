### scout (kilo)

Claim: A single fault in exactly one RSA-CRT half (not both) makes `gcd(faulty_signature, N)` a nontrivial factor of N with certainty; if zero or both halves are faulty, the gcd is 1 or N and no factor is recovered. Deciding measurement: whether `gcd(faulty_signature, N)` is a proper nontrivial divisor.

EXECUTE:
```bash
set -euo pipefail
mkdir -p "$SWARM_CACHE"
out="$SWARM_CACHE/rsa_crt_fault.out"
python3 swarm/benchmarks/rsa_crt_fault.py > "$out" 2>&1
grep -q 'RECOVERED_FACTOR' "$out" && grep -q 'RECOVERED_D' "$out" && echo "PASS: RECOVERED_FACTOR and RECOVERED_D verified" || { cat "$out"; exit 1; }
```
