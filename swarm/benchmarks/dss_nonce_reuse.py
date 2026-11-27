#!/usr/bin/env python3
# Real 2048-bit DSA key, two signatures that reuse the same nonce.
# Recovers the private exponent from public signatures only. No network.
import hashlib
import sys

from cryptography.hazmat.primitives.asymmetric import dsa


def make_key():
    private = dsa.generate_private_key(key_size=2048)
    numbers = private.private_numbers()
    public = numbers.public_numbers
    return {
        "p": public.parameter_numbers.p,
        "q": public.parameter_numbers.q,
        "g": public.parameter_numbers.g,
        "x": numbers.x,
    }


def sign(key, message, nonce):
    h = int.from_bytes(hashlib.sha256(message).digest(), "big") % key["q"]
    r = pow(key["g"], nonce, key["p"]) % key["q"]
    s = (pow(nonce, -1, key["q"]) * (h + key["x"] * r)) % key["q"]
    return r, s, h


def recover(key, first, second):
    r1, s1, h1 = first
    r2, s2, h2 = second
    if r1 != r2:
        return None, "nonces differ"
    nonce = ((h1 - h2) * pow(s1 - s2, -1, key["q"])) % key["q"]
    recovered_x = ((s1 * nonce - h1) * pow(r1, -1, key["q"])) % key["q"]
    return recovered_x, nonce


def main():
    key = make_key()
    nonce = 0xC0FFEE % key["q"]
    first = sign(key, b"first message", nonce)
    second = sign(key, b"second message", nonce)
    recovered_x, used_nonce = recover(key, first, second)
    print(f"Q_BITS={key['q'].bit_length()}")
    print(f"P_BITS={key['p'].bit_length()}")
    print(f"NONCE_MATCH={used_nonce == nonce}")
    print(f"RECOVERED_X_MATCH={recovered_x == key['x']}")
    if recovered_x == key["x"]:
        print("PASS: DSA private key recovered from two signatures with a reused nonce")
        return 0
    print("FAIL: private key not recovered")
    return 1


if __name__ == "__main__":
    sys.exit(main())
