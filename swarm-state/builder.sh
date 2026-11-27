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
