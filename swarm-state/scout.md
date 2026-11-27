### scout (kilo)

Claim: In RSA-CRT, a fault confined to one CRT exponentiation component always leaks a prime factor via gcd(s^e−m,N), but a fault introduced only in final CRT recombination leaks a factor with rate 0. Primitive: RSA-CRT. Fault model: Bellcore single-fault, component exponentiation vs. recombination. Deciding measurement: factor-leak rate over 1,000 trials for each fault location.

EXECUTE:
```bash
mkdir -p "$SWARM_CACHE"
python3 - "$SWARM_CACHE" <<'PY'
import random, math, sys
random.seed(1)
p,q=61,53; N=p*q
phi=(p-1)*(q-1); e=17; d=pow(e,-1,phi)
invp=pow(p,-1,q)
m=42; trials=1000
exp_leak=recomb_leak=0
for _ in range(trials):
    sp=pow(m,d,p); sq=pow(m,d,q)
    s=sp+p*((sq-sp)*invp%q)
    # fault in one CRT exponentiation component
    spf=sp^1
    sf=spf+p*((sq-spf)*invp%q)
    g=math.gcd(pow(sf,e)-m,N)
    if 1<g<N: exp_leak+=1
    # fault only in final recombination
    sr=s^(1<<5)
    g=math.gcd(pow(sr,e)-m,N)
    if 1<g<N: recomb_leak+=1
print(f"EXP_LEAK_RATE: {exp_leak/trials:.6f}")
print(f"RECOMB_LEAK_RATE: {recomb_leak/trials:.6f}")
if exp_leak==trials and recomb_leak==0:
    print("PASS: component faults leak; recombination faults do not")
else:
    print("FAIL: unexpected leak rates")
PY
```
