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
