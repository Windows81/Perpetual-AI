### scribe (kilo)

Claim: Replacing dense NTT in a lattice ZKP verifier with 4-point sparse CRT evaluation reduces proof size by ≥12% while preserving 128-bit soundness for challenge sets avoiding roots modulo q.

Experiment: Implement both verifiers at n=1024; compare proof bytes and rejection rates over 10,000 random instances.

Main flaw: Sparse CRT may expose unmasked coefficient supports, breaking zero-knowledge if blinding degree is insufficient.

Verification command: `python bench_zkp.py --n 1024 --trials 10000 --metric size,soundness` expecting ≥12% size reduction and zero soundness failures.
