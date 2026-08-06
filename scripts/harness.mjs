#!/usr/bin/env node
// Harness de engenharia: cruza histórico do Git com specs/ e reporta o estado do projeto.
// Uso:
//   npm run harness            → relatório (git x specs)
//   npm run harness new <nome> → scaffold da spec + time de agentes (spec antes do código)
import { execSync } from "node:child_process";
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const MODULES_DIR = join(root, "specs", "modules");

// ── Roteamento por complexidade (Codex = Tech Lead coordena) ──────────────
// Tech Lead (Codex) lê a spec, classifica a tarefa e delega ao agente/modelo.
const ROUTING = [
  ["Arquitetura / contrato entre módulos", "software-architect + tech-lead", "opus"],
  ["Segurança / auth / LGPD", "security-engineer", "opus"],
  ["Backend / API / Prisma", "backend-engineer", "sonnet"],
  ["Frontend / UI / UX", "frontend-engineer + uiux-designer", "sonnet"],
  ["Banco / migração / índices", "database-engineer", "sonnet"],
  ["IA / RAG / prompts", "ai-engineer", "sonnet/opus (se crítico)"],
  ["Testes / QA", "qa-engineer", "sonnet"],
  ["Infra / deploy", "devops-engineer", "sonnet"],
];

function printTeam() {
  console.log("\nTech Lead: Codex (coordena, revisa, aprova antes de integrar).");
  console.log("Delegação por complexidade da tarefa:");
  for (const [area, agent, model] of ROUTING) {
    console.log(`   • ${area.padEnd(38)} → ${agent}  [${model}]`);
  }
}

function specTemplate(name) {
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  return `# Spec — Módulo ${title} (${name})

**Fase:** ? · **Depende de:** ? · **Status:** 🚧 em spec (não implementado)

## Objetivo

<descreva o problema e o resultado esperado em 2-3 linhas>

## Schema

\`\`\`prisma
// modelos Prisma novos/alterados (ou "sem mudança de schema")
\`\`\`

## API

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| GET | \`/api/...\` | sessão | ... |

## UI

- <páginas/componentes afetados>

## Verificação

- **Unit:** <o que testar>
- **Live:** <fluxo end-to-end a exercitar>
`;
}

function scaffold(rawName) {
  if (!rawName) {
    console.error("Uso: npm run harness new <nome-do-modulo>");
    process.exit(1);
  }
  const name = rawName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const dir = join(MODULES_DIR, name);
  const spec = join(dir, "spec.md");
  if (existsSync(spec)) {
    console.error(`✗ Já existe: ${spec}\n  Edite a spec existente em vez de sobrescrever.`);
    process.exit(1);
  }
  mkdirSync(dir, { recursive: true });
  writeFileSync(spec, specTemplate(name));
  console.log(`\n✓ Spec criada: specs/modules/${name}/spec.md`);
  console.log("\nPróximos passos (fluxo obrigatório — HARNESS.md):");
  console.log("  1. Preencher a spec (Objetivo/Schema/API/UI/Verificação). PM/Architect aprovam.");
  console.log(`  2. Registrar no índice: adicionar linha em specs/README.md.`);
  console.log("  3. ADR em specs/decisions/ se houver decisão arquitetural nova.");
  console.log("  4. Só então implementar.");
  printTeam();
  console.log("");
}

// Subcomando: scaffold de feature nova (spec antes do código).
if (process.argv[2] === "new") {
  scaffold(process.argv[3]);
  process.exit(0);
}

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
