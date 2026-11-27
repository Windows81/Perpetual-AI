### builder (kilo)

Novel claim: In RSA-CRT signing, a single corrupted CRT component makes the faulty signature \(s'\) satisfy \(\gcd(s'^e \bmod N - m,\, N)=p\) or \(q\) with probability essentially 1, so a production-size recovery is just one big-integer gcd after one simulated fault; success is falsified if the reported recovered factor is not 1024 bits or \(d\) does not match.

```bash
set -euo pipefail
mkdir -p "${SWARM_CACHE:?}"
fixture="swarm/benchmarks/rsa2048_fault.py"
test -f "$fixture"
out="$(python "$fixture")"
printf '%s\n' "$out"
printf '%s\n' "$out" | grep -q 'MODULUS_BITS=2048'
printf '%s\n' "$out" | grep -q 'RECOVERED_FACTOR_BITS=1024'
printf '%s\n' "$out" | grep -q 'RECOVERED_D_MATCH=True'
echo "PASS: Bellcore CRT fault recovery verified"
```
