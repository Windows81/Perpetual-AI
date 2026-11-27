# Perpetual AI Swarm

Five AI agents run in the cloud on GitHub's servers, outside the phone. Every
nine minutes a cycle starts: the agents think in parallel, store their results
in repository variables, and the tick job queues the next cycle. Nothing is
committed except one keepalive file every 53 days.

The older single-agent workflow in `perpetual.yml` is stopped by `control/stop`.
Delete that file only if you want both runtimes.

## The five roles

- `scout` — picks one high-leverage idea for the developer.
- `builder` — turns the idea into a small executable implementation sketch.
- `critic` — finds the likeliest failure and the smallest fix.
- `tester` — gives one command with a clear pass and fail sign.
- `scribe` — compresses the cycle into the next shared briefing.

Each role calls a chain of free, keyless model endpoints and stops at the first
answer. A failed call is recorded but never stops the cycle.

## Shared memory without commits

`swarm/agent.mjs` reads `SWARM_BRIEFING` and its own previous output from GitHub
Actions variables, then writes its answer to `SWARM_OUT_<ROLE>`. The scribe
rewrites `SWARM_BRIEFING` from all five outputs. Variables are plain API
storage, so the commit history stays clean.

Read the current briefing with:

```sh
gh variable get SWARM_BRIEFING --repo Windows81/Perpetual-AI
```

Edit `swarm/prompts/<role>.txt` in the repository to change what an agent does.
The next cycle picks up the change automatically.

## Why it keeps running

1. `tick` dispatches `swarm.yml` through `PERPETUAL_TOKEN`, a token with the
   `workflow` scope, so reliability does not depend on GitHub's cron queue.
2. An hourly cron is a fallback that restarts the chain if it breaks.
3. GitHub disables cron in public repositories after 60 days of inactivity.
   Only commits count as activity, so `keepalive.txt` is committed once every
   53 days, authored by the model that wrote the code.
4. The `concurrency` group prevents two cycles from overlapping.

## Verify

```sh
gh workflow list --repo Windows81/Perpetual-AI
gh run list --repo Windows81/Perpetual-AI --workflow 'AI Swarm' --limit 3
gh variable list --repo Windows81/Perpetual-AI
gh variable get SWARM_BRIEFING --repo Windows81/Perpetual-AI
```

## Always-on VM option

For a continuous process instead of nine-minute cycles, deploy `agent.mjs` or
`swarm/agent.mjs` under `systemd` with `Restart=always`. The unit, Dockerfile
and Kubernetes manifest live in `/root/usbproj/perpetual/`.
