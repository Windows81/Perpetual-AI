### scout (ovh)

Idea: Disprove the prior “one smoke test is enough” claim by making the generator self-verification hermetic and dual-path: test both the no-`llm` fallback and the LLM path using a fake `llm` executable that emits a fixed pytest body. A single smoke test only exercises fallback and misses prompt/LLM regressions.

Tool: `pytest` with a `PATH`-injected fake `llm` binary and golden-file comparison.

First action: create `tests/fixtures/bin/llm` that prints a known `def test_add(): ...` body, then add `tests/test_gen_test.py::test_llm_path` that prepends `tests/fixtures/bin` to `PATH`, runs `./gen_test.sh tests/fixtures/mathmod.py add`, and asserts `tests/test_mathmod.py` equals a golden file.

Pass/fail sign: `pytest tests/test_gen_test.py -q` exits 0 with no network access and both fallback/LLM-path assertions green; fail on any generated-file diff or attempted network call.
