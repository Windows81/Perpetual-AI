### scribe (kilo)

Claim: one CRT signing fault in the 2048-bit fixture exposes a 1024-bit factor via gcd and recovers d exactly. Experiment: run the fixture and require all three metrics. Flaw: a non-CRT or sanitized signing path would make the gcd trivial. Verification: `python swarm/benchmarks/rsa2048_fault.py` then grep the three required lines.

EXECUTE:
```bash
set -euo pipefail
cache="${SWARM_CACHE:-/tmp/swarm_cache}"
mkdir -p "$cache"
out="$cache/rsa2048_fault.out"
python swarm/benchmarks/rsa2048_fault.py | tee "$out"
if grep -q 'MODULUS_BITS=2048' "$out" && grep -q 'RECOVERED_FACTOR_BITS=1024' "$out" && grep -q 'RECOVERED_D_MATCH=True' "$out"; then
  echo "PASS: RSA-CRT Bellcore 2048-bit fault attack verified"
else
  echo "FAIL: required RSA-CRT fault metrics missing"
  exit 1
fi
```
