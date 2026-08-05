#!/usr/bin/env node
// Harness de engenharia: cruza histórico do Git com specs/ e reporta o estado do projeto.
// Uso: npm run harness   (ou node scripts/harness.mjs)
import { execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const MODULES_DIR = join(root, "specs", "modules");

// Aliases: scope do commit -> diretório do módulo (quando diferem).
const SCOPE_ALIAS = {
  auth: "authentication",
  register: "authentication",
  middleware: "authentication",
  stack: "authentication", // migração de stack
  knowledge: "knowledge-base",
  search: "semantic-search",
  tutor: "tutor-ia",
  "ai-chat": "tutor-ia",
  transcripts: "transcripts",
  // Transversais (sem módulo próprio):
  ui: null, design: null, style: null, theme: null, api: null, seed: null,
  "admin-settings": null, security: null,
  scaffold: null, harness: null, test: null, chore: null, fix: null,
};

function sh(cmd) {
  try { return execSync(cmd, { cwd: root, encoding: "utf8" }).trim(); }
  catch { return ""; }
}

function listModules() {
  if (!existsSync(MODULES_DIR)) return [];
  return readdirSync(MODULES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => ({
      name: d.name,
      hasSpec: existsSync(join(MODULES_DIR, d.name, "spec.md")),
    }));
}

function parseCommits(n = 40) {
  const log = sh(`git log --oneline -n ${n}`);
  if (!log) return [];
  return log.split("\n").map((line) => {
    const [, hash, msg] = line.match(/^(\w+)\s+(.*)$/) ?? [];
    const m = (msg ?? "").match(/^(\w+)(?:\(([^)]+)\))?:/);
    return { hash, msg, type: m?.[1] ?? null, scope: m?.[2] ?? null };
  });
}

const modules = listModules();
const modNames = new Set(modules.map((m) => m.name));
const commits = parseCommits(40);
const branch = sh("git rev-parse --abbrev-ref HEAD");
const unpushed = sh("git log --oneline @{u}..HEAD 2>/dev/null").split("\n").filter(Boolean).length;

// Features (feat/fix) cujo scope não bate com módulo documentado nem alias conhecido.
const undocumented = [];
for (const c of commits) {
  if (!["feat", "fix"].includes(c.type) || !c.scope) continue;
  const alias = SCOPE_ALIAS[c.scope];
  if (alias === null) continue; // transversal
  const target = alias ?? c.scope;
  if (!modNames.has(target)) undocumented.push(c);
}

const withSpec = modules.filter((m) => m.hasSpec).length;

console.log("\n═══ ANP LMS — Harness de Engenharia ═══\n");
console.log(`Branch: ${branch}   Commits não enviados: ${unpushed}`);
console.log(`Módulos documentados: ${withSpec}/${modules.length}`);

const missing = modules.filter((m) => !m.hasSpec);
if (missing.length) {
  console.log(`\n⚠ Módulos SEM spec.md: ${missing.map((m) => m.name).join(", ")}`);
} else {
  console.log("✓ Todos os módulos têm spec.md");
}

if (undocumented.length) {
  console.log(`\n⚠ Commits feat/fix com escopo sem módulo em specs/modules/:`);
  for (const c of undocumented) console.log(`   ${c.hash} (${c.scope}) ${c.msg}`);
  console.log("   → Criar spec do módulo antes de evoluir (ver HARNESS.md).");
} else {
  console.log("✓ Nenhuma feature recente sem módulo correspondente");
}

console.log(`\nÚltimos commits:`);
for (const c of commits.slice(0, 8)) console.log(`   ${c.hash} ${c.msg}`);

console.log(`\nMódulos:`);
for (const m of modules.sort((a, b) => a.name.localeCompare(b.name))) {
  console.log(`   ${m.hasSpec ? "✓" : "✗"} ${m.name}`);
}
console.log("\nFluxo obrigatório: ver HARNESS.md. Índice: specs/README.md\n");
