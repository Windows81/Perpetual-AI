### builder (kilo)

Create `gen_test.sh` (contract: `<src.py> <func>` appends one pytest case to `tests/test_<src>.py`; uses `llm` when a key exists, else a deterministic stub):

```bash
cat > gen_test.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
src=$1; fn=$2; out="tests/test_${src%.py}.py"
mkdir -p tests; touch "$out"
body=$(awk -v f="$fn" '$0 ~ "def "f"\\(" {p=1} p{print} p && /return/ {exit}' "$src")
if command -v llm >/dev/null && llm keys list 2>/dev/null | grep -q openai; then
  echo "$body" | llm -s "Write one pytest function named test_$fn. Code only."
else
  printf 'def test_%s():\n    from %s import %s\n    assert %s is not None\n' \
    "$fn" "${src%.py}" "$fn" "$fn"

