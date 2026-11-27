#!/usr/bin/env python3
# Production-size RSA-CRT Bellcore fault attack on a locally generated 2048-bit
# key. No network, no third-party system. PASS requires full private-key recovery.
import math
import sys

from cryptography.hazmat.primitives.asymmetric import rsa


def make_key():
    private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    numbers = private.private_numbers()
    public = numbers.public_numbers
    return {
        "p": numbers.p, "q": numbers.q, "n": public.n,
        "e": public.e, "d": numbers.d,
        "dmp1": numbers.dmp1, "dmq1": numbers.dmq1, "iqmp": numbers.iqmp,
    }


def crt_sign(key, message, fault_bit=None):
    sp = pow(message, key["dmp1"], key["p"])
    sq = pow(message, key["dmq1"], key["q"])
    if fault_bit is not None:
        sp ^= 1 << fault_bit
    return sq + key["q"] * ((sp - sq) * key["iqmp"] % key["p"])


def main():
    key = make_key()
    message = 0xC0FFEE
    good = crt_sign(key, message)
    assert good == pow(message, key["d"], key["n"]), "CRT signing mismatch"

    faulty = crt_sign(key, message, fault_bit=7)
    factor = math.gcd(good - faulty, key["n"])
    if not (1 < factor < key["n"]):
        print(f"FAIL: gcd did not reveal a factor ({factor})")
        return 1

    other = key["n"] // factor
    recovered_d = pow(key["e"], -1, math.lcm(factor - 1, other - 1))
    ok_factor = factor in (key["p"], key["q"])
    ok_d = recovered_d == key["d"]
    print(f"MODULUS_BITS={key['n'].bit_length()}")
    print(f"RECOVERED_FACTOR_BITS={factor.bit_length()}")
    print(f"RECOVERED_D_MATCH={ok_d}")
    if ok_factor and ok_d:
        print("PASS: 2048-bit RSA-CRT private key recovered from one faulty signature")
        return 0
    print("FAIL: recovered key did not match")
    return 1


if __name__ == "__main__":
    sys.exit(main())
