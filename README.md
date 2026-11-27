# Perpetual AI

An AI agent that runs without the phone. A GitHub Actions run performs one
inference, writes a heartbeat to this repository, waits about nine minutes,
then queues the next run through the GitHub API. The chain repeats on GitHub's
servers, so the agent keeps working while the phone is off. An hourly cron is a
fallback in case the chain is interrupted.

## What is where

- `agent.mjs` — the agent. It tries ten keyless model routes in order and stops
  at the first reply. It writes `state/latest.json` and appends to
  `state/log.jsonl`.
- `task.txt` — the prompt the agent answers each run. Edit this file in the
  repository to change what the agent does.
- `.github/workflows/perpetual.yml` — the cloud scheduler. A `workflow_dispatch`
  event starts a run; each run dispatches the next one. The `cron` entry is a
  fallback that starts a new chain if the old one dies.
- `control/stop` — create this file to halt the fast chain.
- `state/` — the proof that the agent ran. The log is the durable record.

## Why it does not stop

1. GitHub owns the computer, so the phone is never involved.
2. Public repositories have no monthly minute limit on GitHub Actions.
3. Each run calls the GitHub API to queue the next run, so reliability does not
   depend on GitHub's delayed cron queue.
4. A failed model call is recorded, not fatal. The agent always exits with
   status 0, so the next run is still queued.
5. The `concurrency` group prevents two runs from committing at the same time.

## Verify a run

```sh
gh workflow run perpetual.yml --repo Windows81/Perpetual-AI
gh run list --repo Windows81/Perpetual-AI --workflow perpetual.yml --limit 3
gh api repos/Windows81/Perpetual-AI/contents/state/latest.json --jq .content | base64 -d
```

The last command prints the heartbeat. `ok: true` means a model answered; `ok:
false` means every free route refused and the errors are listed.

## Limits and upgrade path

The dispatch chain needs the `PERPETUAL_TOKEN` repository secret, which holds a
token with the `workflow` scope. If that secret is removed, the chain stops and
the hourly fallback keeps the agent alive at a slower pace. Scheduled workflows
are also disabled after 60 days of repository inactivity; each heartbeat commit
counts as activity, so an actively logging agent stays enabled.

For a truly continuous process, deploy the same `agent.mjs` on an always-free
cloud VM under `systemd` with `Restart=always`. The local supervisor at
`../perpetual` and the unit in `../perpetual.service` are the pieces for that.
