### builder (kilo)

The reused DSS nonce makes the private key recoverable algebraically: with two signatures sharing `k`, solve `x = (s1*m2 - s2*m1) * inv(r*(s2-s1), q) mod q`. The production-size claim is that the fixture's 2048/256-bit path performs this recovery correctly and sets `RECOVERED_X_MATCH=True`.

EXECUTE:
```bash
set -eu
mkdir -p "$SWARM_CACHE"
python - <<'PY' > "$SWARM_CACHE/dss.out" 2>&1
import runpy
p = "swarm/benchmarks/dss_nonce_reuse.py"
ns = runpy.run_path(p)
if callable(ns.get("main")):
    ns["main"]()
for key in ("P_BITS", "Q_BITS", "RECOVERED_X_MATCH"):
    print(f"{key}={ns.get(key)}")
PY
cat "$SWARM_CACHE/dss.out"
grep -q 'P_BITS=2048' "$SWARM_CACHE/dss.out"
grep -q 'Q_BITS=256' "$SWARM_CACHE/dss.out"
grep -q 'RECOVERED_X_MATCH=True' "$SWARM_CACHE/dss.out"
echo "PASS: P_BITS=2048 Q_BITS=256 RECOVERED_X_MATCH=True"
```
