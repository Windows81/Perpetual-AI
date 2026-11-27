### scribe (kilo)

Chosen idea: bootstrap with a minimal smoke test for the existing application. Next action: add tests/test_smoke.py that imports the app entrypoint and checks it initializes. Main risk: no shared context, so the test may target the wrong module. Verification command: pytest -q.
