set -euo pipefail
mkdir -p "${SWARM_CACHE:?}/rsa_crt"
out="${SWARM_CACHE}/rsa_crt/run.log"
python3 swarm/benchmarks/rsa_crt_fault.py > "$out" 2>&1
if grep -q 'RECOVERED_FACTOR' "$out" && grep -q 'RECOVERED_D' "$out"; then
  tail -n 20 "$out"
  echo "PASS: recovered factor and d"
else
  cat "$out"
  echo "FAIL: missing recovery markers"
  exit 1
fi
