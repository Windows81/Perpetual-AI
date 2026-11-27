// One swarm agent. Reads its role prompt, consults shared memory stored in
// repository variables (no commits), calls the keyless model chain, and writes
// its result back to shared memory and the Actions run summary.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"

const role = process.argv[2]
if (!role) {
  console.error("usage: node swarm/agent.mjs <role>")
  process.exit(64)
}

const ROUTES = [
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "kilo-auto/free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "nvidia/nemotron-3.5-lightning:free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "baidu/ernie-5.5-flash-preview:free" },
  { label: "kilo", base: "https://api.kilo.ai/api/gateway/v1", model: "reflection/beam-free" },
  { label: "blockrun", base: "https://blockrun.ai/api/v1", model: "nvidia/nemotron-3.5-lightning" },
  { label: "blockrun", base: "https://blockrun.ai/api/v1", model: "nvidia/minimax-m3.1-flash" },
  { label: "ovh", base: "https://oai.endpoints.kepler.ai.cloud.ovh.net/v1", model: "DeepSeek-V4.1-Flash-1017" },
  { label: "vireonix", base: "https://vireonix.ai/v1", model: "auto" },
]
const ROLES = ["scout", "builder", "critic", "tester", "scribe"]
const repo = process.env.GITHUB_REPOSITORY ?? "Windows81/Perpetual-AI"
const token = process.env.SWARM_API_TOKEN ?? process.env.GITHUB_TOKEN ?? ""
const apiHeaders = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
  "X-GitHub-Api-Version": "2022-11-28",
}

async function getVariable(name) {
  if (!token) return ""
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/actions/variables/${name}`,
      { headers: apiHeaders, signal: AbortSignal.timeout(15000) },
    )
    if (!response.ok) return ""
    return String((await response.json()).value ?? "")
  } catch {
    return ""
  }
}

async function setVariable(name, value) {
  if (!token) return false
  const body = JSON.stringify({ name, value: value.slice(0, 4000) })
  try {
    let response = await fetch(
      `https://api.github.com/repos/${repo}/actions/variables/${name}`,
      { method: "PUT", headers: apiHeaders, body, signal: AbortSignal.timeout(15000) },
    )
    if (response.status === 404) {
      response = await fetch(
        `https://api.github.com/repos/${repo}/actions/variables`,
        { method: "POST", headers: apiHeaders, body, signal: AbortSignal.timeout(15000) },
      )
    }
    return response.ok
  } catch {
    return false
  }
}

async function ask(prompt) {
  const errors = []
  for (const route of ROUTES) {
    try {
      const response = await fetch(`${route.base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
        body: JSON.stringify({
          model: route.model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 900,
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(45000),
      })
      if (!response.ok) throw new Error(`${route.label}: HTTP ${response.status}`)
      const data = await response.json()
      if (data?.error) throw new Error(`${route.label}: error`)
      const text = String(data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "").trim()
      if (!text || /internal guardrails|unable to answer question/i.test(text)) {
        throw new Error(`${route.label}: empty or refused`)
      }
      return { text, route: route.label, model: route.model }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error))
    }
  }
  return { text: "", route: "none", model: "none", errors }
}

const roleUpper = role.toUpperCase()
const briefing = await getVariable("SWARM_BRIEFING")
const previous = await getVariable(`SWARM_OUT_${roleUpper}`)
const rolePrompt = readFileSync(join(process.cwd(), "swarm", "prompts", `${role}.txt`), "utf8").trim()
const prompt = [
  rolePrompt,
  "",
  "Shared briefing from the swarm (may describe the previous cycle):",
  briefing || "(none yet)",
  "",
  "Your own previous output:",
  previous || "(none yet)",
  "",
  "Answer directly and keep it under 200 words.",
].join("\n")

const answer = await ask(prompt)
const record = {
  at: new Date().toISOString(),
  role,
  runId: process.env.GITHUB_RUN_ID ?? "local",
  route: answer.route,
  model: answer.model,
  ok: Boolean(answer.text),
  text: answer.text,
  errors: answer.errors ?? [],
}

const stateDir = join(process.cwd(), "swarm-state")
mkdirSync(stateDir, { recursive: true })
writeFileSync(join(stateDir, `${role}.json`), JSON.stringify(record, null, 2) + "\n")

const markdown = `### ${role} (${answer.route})\n\n${answer.text || "No answer; all routes failed."}\n`
writeFileSync(join(stateDir, `${role}.md`), markdown)
const summaryPath = process.env.GITHUB_STEP_SUMMARY
if (summaryPath) writeFileSync(summaryPath, `\n## Swarm agent: ${role}\n\n${markdown}`, { flag: "a" })
if (answer.text) {
  const stored = await setVariable(`SWARM_OUT_${roleUpper}`, answer.text)
  if (!stored) console.warn(`[swarm:${role}] could not store SWARM_OUT_${roleUpper}`)
}

if (role === "scribe" && answer.text) {
  const outputs = await Promise.all(ROLES.map((name) => getVariable(`SWARM_OUT_${name.toUpperCase()}`)))
  const digest = ROLES.map((name, index) => `${name}: ${outputs[index] || "(none)"}`).join("\n")
  await setVariable("SWARM_BRIEFING", `Latest cycle:\n${digest}`.slice(0, 4000))
}

console.log(`[swarm:${role}] ${record.at} ok=${record.ok} route=${answer.route}`)
