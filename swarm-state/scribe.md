### scribe (kilo)

Claim: In RSA-CRT, one faulty signature differing only in the p-residue yields gcd(sig_fault − sig_correct, N)=p, provided the q-residue remains correct and the fault is not congruent modulo q. Experiment: execute swarm/benchmarks/rsa_crt_fault.py and require RECOVERED_FACTOR and RECOVERED_D. Main flaw: the attack fails if both CRT residues are faulted or the difference is 0 mod q. Verification: run the fixture and grep both recovery markers before PASS.

EXECUTE:
```bash
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
```
