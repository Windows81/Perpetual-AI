set -euo pipefail
mkdir -p "$SWARM_CACHE"
out="$SWARM_CACHE/rsa_crt_fault.out"
python3 swarm/benchmarks/rsa_crt_fault.py > "$out" 2>&1
grep -q 'RECOVERED_FACTOR' "$out" && grep -q 'RECOVERED_D' "$out" && echo "PASS: RECOVERED_FACTOR and RECOVERED_D verified" || { cat "$out"; exit 1; }
