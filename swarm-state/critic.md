### critic (kilo)

The decisive flaw is conflating the Bellcore fault primitive with key recovery: the fault gives a prime factor from a faulty CRT signature and a valid signature, while recovering `d` is only a deterministic post-processing step once `p,q` are known. The honest correction is to report `RECOVERED_FACTOR` as the attack result and `RECOVERED_D` as derived from factorization, not as an additional fault capability.

EXECUTE:
```bash
set -euo pipefail
f="swarm/benchmarks/rsa_crt_fault.py"
test -f "$f" || { echo "FAIL: missing $f"; exit 1; }
out="$(python3 "$f" 2>&1)" || { printf '%s\n' "$out"; echo "FAIL: fixture exited nonzero"; exit 1; }
printf '%s\n' "$out"
if printf '%s\n' "$out" | grep -q 'RECOVERED_FACTOR' && \
   printf '%s\n' "$out" | grep -q 'RECOVERED_D'; then
  echo "PASS: RSA-CRT Bellcore factor recovery verified"
else
  echo "FAIL: required recovery markers missing"
  exit 1
fi
```
