#!/usr/bin/env python3
# Local Bellcore fault-attack fixture for RSA-CRT. No network, no real keys.
# Prints PASS only when the attack recovers a factor of the modulus.
import math
import random
import sys


def make_key(seed=1):
    rng = random.Random(seed)
    primes = [61, 53, 59, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113]
    p, q = rng.sample(primes, 2)
    n = p * q
    phi = (p - 1) * (q - 1)
    e = 17 if math.gcd(17, phi) == 1 else 3
    d = pow(e, -1, phi)
    return {
        "p": p, "q": q, "n": n, "e": e, "d": d,
        "dp": d % (p - 1), "dq": d % (q - 1), "qinv": pow(q, -1, p),
    }


def sign(key, message, fault_bit=None):
    sp = pow(message, key["dp"], key["p"])
    sq = pow(message, key["dq"], key["q"])
    if fault_bit is not None:
        sp ^= 1 << fault_bit
    h = key["qinv"] * (sp - sq) % key["p"]
    return sq + key["q"] * h


def recover(key, good, faulty):
    factor = math.gcd(good - faulty, key["n"])
    if 1 < factor < key["n"]:
        return factor
    return None


def main():
    key = make_key()
    message = 42
    good = sign(key, message)
    faulty = sign(key, message, fault_bit=3)
    factor = recover(key, good, faulty)
    print(f"N={key['n']} P={key['p']} Q={key['q']}")
    print(f"GOOD={good} FAULTY={faulty}")
    if factor == key["p"] or factor == key["q"]:
        recovered_q = key["n"] // factor
        recovered_d = pow(key["e"], -1, (factor - 1) * (recovered_q - 1))
        print(f"RECOVERED_FACTOR={factor}")
        print(f"RECOVERED_D={recovered_d}")
        print("PASS: Bellcore fault recovered the RSA private key")
        return 0
    print(f"FAIL: recovered {factor}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
