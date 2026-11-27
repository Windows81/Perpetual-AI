# Perpetual AI

An AI agent that runs without the phone. GitHub Actions starts it every five
minutes on GitHub's servers. Each run calls a free large-language-model endpoint,
writes a heartbeat to this repository, and exits. The next scheduled run starts
five minutes later, so the agent stays alive while the phone is off.

## What is where

- `agent.mjs` — the agent. It tries ten keyless model routes in order and stops
  at the first reply. It writes `state/latest.json` and appends to
  `state/log.jsonl`.
- `task.txt` — the prompt the agent answers each run. Edit this file in the
  repository to change what the agent does.
- `.github/workflows/perpetual.yml` — the cloud scheduler. The `cron` entry
  fires every five minutes; `workflow_dispatch` allows a manual run.
- `state/` — the proof that the agent ran. Commit these files; the log is the
  durable record.

## Why it does not stop

1. GitHub owns the computer, so the phone is never involved.
2. Public repositories have no monthly minute limit on GitHub Actions.
3. A failed model call is recorded, not fatal. The agent always exits with
   status 0, so the next scheduled run still happens.
4. The `concurrency` group prevents two runs from committing at the same time.

## Verify a run

```sh
gh workflow run perpetual.yml --repo Windows81/Perpetual-AI
gh run list --repo Windows81/Perpetual-AI --workflow perpetual.yml --limit 3
gh api repos/Windows81/Perpetual-AI/contents/state/latest.json --jq .content | base64 -d
```

The last command prints the heartbeat. `ok: true` means a model answered; `ok:
false` means every free route refused and the errors are listed.

## Limits and upgrade path

GitHub schedules can be delayed by a few minutes under load, and a scheduled
workflow is disabled after 60 days without a repository commit. Each heartbeat
commit counts as activity, so an actively logging agent stays enabled.

For a truly continuous process, deploy the same `agent.mjs` on an always-free
cloud VM under `systemd` with `Restart=always`. The local supervisor at
`../perpetual` and the unit in `../perpetual.service` are the pieces for that.
