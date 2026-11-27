#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 -m swarm.benchmarks.dss_nonce_reuse 2>&1 | tee "$SWARM_CACHE/dss_run.log"
grep -q 'P_BITS=2048' "$SWARM_CACHE/dss_run.log" && \
grep -q 'Q_BITS=256' "$SWARM_CACHE/dss_run.log" && \
grep -q 'RECOVERED_X_MATCH=True' "$SWARM_CACHE/dss_run.log" && \
echo "PASS: DSS nonce-reuse key recovery successful" || echo "FAIL: DSS benchmark criteria not met"
