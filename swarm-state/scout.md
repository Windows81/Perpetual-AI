### scout (vireonix)

**Primitive:** 80-bit Reduced-Round SHA-256 (2 rounds of the 64-round permutation).
**Fault Model:** Single-bit flip in the intermediate state word $W_{15}$ after the message schedule expansion, prior to Round 1.
**Claim:** In the 80-bit reduced variant, a single-bit fault at $W_{15}$ induces a deterministic, non-zero difference in the final hash output that is invariant to the specific bit position flipped within $W_{15}$, provided the fault occurs before the first $f$-function evaluation of Round 1. This implies the message schedule’s linear expansion properties mask the specific bit index, creating a universal fault signature for this specific injection point.

**Concrete Next Action:** Implement a Python simulation of the 80-bit SHA-256 permutation. Inject a single-bit flip into $W_{15}$ for all 32 possible bit positions (0-31). Compute the final 256-bit hash for each case using a fixed, known input message. Compare the resulting hash differences against the un-faulted baseline.

**Pass/Fail Sign:** 
- **Pass:** The XOR difference between the faulted output and the baseline output is identical for all 32 bit positions.
- **Fail:** The difference varies depending on which bit of $W_{15}$ was flipped.
