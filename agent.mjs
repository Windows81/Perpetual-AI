// Cloud agent: one inference unit per run, with keyless fallback routes.
// No dependencies, no secrets. Node 20+ (uses fetch and AbortSignal.timeout).
// Writes state/latest.json and state/log.jsonl so the run is verifiable.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const STATE_DIR = process.env.PERPETUAL_STATE_DIR ?? join(process.cwd(), "state")
mkdirSync(STATE_DIR, { recursive: true })

const ROUTES = [
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "kilo-auto/free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "nvidia/nemotron-3.5-lightning:free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "baidu/ernie-5.5-flash-preview:free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "nvidia/nemotron-3.5-super-vl:free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "reflection/beam-free" },
  { label: "blockrun", base: "https://blockrun.ai/api/v1", model: "nvidia/nemotron-3.5-lightning" },
  { label: "blockrun", base: "https://blockrun.ai/api/v1", model: "nvidia/minimax-m3.1-flash" },
  { label: "blockrun", base: "https://blockrun.ai/api/v1", model: "nvidia/nemotron-3-ultra-550b" },
  { label: "ovh", base: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1", model: "DeepSeek-V4.1-Flash-1017" },
  { label: "vireonix", base: "https://vireonix.ai/v1", model: "auto" },
]

function taskPrompt() {
  try {
    const value = readFileSync(join(process.cwd(), "task.txt"), "utf8").trim()
    if (value) return value
  } catch { /* fall through */ }
  return "Reply with exactly: OK"
}

async function askRoute(route, prompt) {
  const response = await fetch(`${route.base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify({
      model: route.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!response.ok) throw new Error(`${route.label}: HTTP ${response.status}`)
  const data = await response.json()
  if (data?.error) throw new Error(`${route.label}: ${data.error.message ?? "error"}`)
  const text = String(data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "").trim()
  if (!text || /internal guardrails|unable to answer question/i.test(text)) {
    throw new Error(`${route.label}: empty or refused`)
  }
  return text
}

const prompt = taskPrompt()
const errors = []
let result = null

for (const route of ROUTES) {
  try {
    const text = await askRoute(route, prompt)
    result = { route: route.label, model: route.model, text: text.slice(0, 4000) }
    break
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error))
  }
}

const record = {
  at: new Date().toISOString(),
  runId: process.env.GITHUB_RUN_ID ?? "local",
  runNumber: process.env.GITHUB_RUN_NUMBER ?? "0",
  repository: process.env.GITHUB_REPOSITORY ?? "local",
  alive: true,
  ok: Boolean(result),
  prompt: prompt.slice(0, 500),
  result,
  errors: result ? [] : errors,
}

writeFileSync(join(STATE_DIR, "latest.json"), JSON.stringify(record, null, 2) + "\n")
appendFileSync(
  join(STATE_DIR, "log.jsonl"),
  JSON.stringify({ at: record.at, runId: record.runId, ok: record.ok, route: result?.route ?? null }) + "\n",
)

console.log(`[perpetual-agent] ${record.at} ok=${record.ok} route=${result?.route ?? "none"}`)
if (!result) console.log(`[perpetual-agent] all routes failed: ${errors.join(" | ")}`)
// Always exit 0: a failed inference must not stop the perpetual schedule.
