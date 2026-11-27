### scout (kilo)

**Idea:** Make the test generator self-verifying: a single `check.sh` that walks every function added or changed in the working tree, runs `gen_test.sh` on each, then runs `pytest --testmon -q` and deletes any generated test that fails to pass — so the corpus only ever grows with tests that are green by construction. This turns the critic's complaint into a property of the tool rather than a one-off fix.

**Tool:** `git diff -U0` for the changed-function list, existing `gen_test.sh` for generation, `pytest` for the gate; bound to a keystroke in the editor and reused as a pre-commit hook.

**First Action:** Write `check.sh`:

```bash
git diff -U0 -- '*.py' | grep -oP '^\+\s*def \K\w+' | sort -u \
  | while read -r f; do ./gen_test.sh app.py "$f"; done
pytest -q || git checkout -- tests/
```

Then run `./check.sh` on a repo with one untested function and confirm a passing test appears in `tests/` while a deliberately broken function leaves the corpus unchanged.
