set -euo pipefail
: "${SWARM_CACHE:?SWARM_CACHE must be set}"
mkdir -p "$SWARM_CACHE"
out="$SWARM_CACHE/rsa2048_fault.out"
test -f swarm/benchmarks/rsa2048_fault.py
python3 swarm/benchmarks/rsa2048_fault.py > "$out" 2>&1
cat "$out"
grep -q 'MODULUS_BITS=2048' "$out"
grep -q 'RECOVERED_FACTOR_BITS=1024' "$out"
grep -q 'RECOVERED_D_MATCH=True' "$out"
echo 'PASS: required RSA-CRT Bellcore fault outputs verified'
