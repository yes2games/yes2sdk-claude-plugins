#!/usr/bin/env node
// Structural validation for the Yes2SDK Claude Code plugin.
// Dependency-free. Deliberately covers only what `claude plugin validate --strict`
// does NOT: cross-file agreement between the manifests, `.mcp.json` shape, SKILL.md
// `name`, and the agent-frontmatter traps the official validator passes with exit 0.
// CI runs both, so anything the official validator already catches is not repeated
// here. Fails (exit 1) on any problem — there is no build step to catch it later.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);

function readJson(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    fail(`missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(abs, "utf-8"));
  } catch (e) {
    fail(`invalid JSON in ${rel}: ${e.message}`);
    return null;
  }
}

/** Extract the leading `---` YAML frontmatter block as raw text, or null. */
function frontmatter(absFile) {
  const src = fs.readFileSync(absFile, "utf-8");
  // `\r?\n` so a CRLF working tree (Git for Windows defaults to core.autocrlf=true)
  // still matches. .gitattributes pins LF, but don't depend on the checkout.
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(src);
  return m ? m[1] : null;
}
const hasKey = (fm, key) => new RegExp(`^${key}\\s*:`, "m").test(fm);

// 1. plugin.json
const plugin = readJson(".claude-plugin/plugin.json");
if (plugin) {
  for (const k of ["name", "version", "description"]) {
    if (!plugin[k]) fail(`.claude-plugin/plugin.json: missing "${k}"`);
  }
}

// 1b. package.json is optional (this is a plugin, not an npm package) but if it is
// present it duplicates version/license, so pin the two together rather than letting
// them drift. It must also stay private — nothing here is publishable.
if (fs.existsSync(path.join(ROOT, "package.json"))) {
  const pkg = readJson("package.json");
  if (pkg && plugin) {
    if (pkg.private !== true) fail('package.json: must set "private": true');
    for (const k of ["version", "license"]) {
      if (!pkg[k]) fail(`package.json: missing "${k}"`);
    }
    if (pkg.version && pkg.version !== plugin.version) {
      fail(`package.json "version" (${pkg.version}) must equal .claude-plugin/plugin.json "version" (${plugin.version})`);
    }
    if (plugin.license && pkg.license && pkg.license !== plugin.license) {
      fail(`package.json "license" (${pkg.license}) must equal .claude-plugin/plugin.json "license" (${plugin.license})`);
    }
  }
}

// 2. marketplace.json — must list the plugin
const market = readJson(".claude-plugin/marketplace.json");
if (market) {
  if (!market.name) fail(".claude-plugin/marketplace.json: missing \"name\"");
  if (!Array.isArray(market.plugins) || market.plugins.length === 0) {
    fail(".claude-plugin/marketplace.json: \"plugins\" must be a non-empty array");
  } else {
    for (const p of market.plugins) {
      if (!p.name || !p.source) {
        fail(`.claude-plugin/marketplace.json: each plugin needs "name" and "source" (got ${JSON.stringify(p)})`);
      }
    }
    if (plugin && !market.plugins.some((p) => p.name === plugin.name)) {
      fail(`.claude-plugin/marketplace.json: no plugin entry named "${plugin.name}"`);
    }
    // The entry may carry its own "version"; the spec lets it, and Claude Code shows it
    // in the marketplace listing. Pin it to plugin.json so a release bump cannot leave
    // the listing advertising a version the plugin no longer is.
    const entry = plugin && market.plugins.find((p) => p.name === plugin.name);
    if (entry?.version && plugin.version && entry.version !== plugin.version) {
      fail(`.claude-plugin/marketplace.json plugin "${plugin.name}" "version" (${entry.version}) must equal .claude-plugin/plugin.json "version" (${plugin.version})`);
    }
  }
}

// 3. .mcp.json — the yes2sdk server with a transport + url
const mcp = readJson(".mcp.json");
if (mcp) {
  const srv = mcp.mcpServers?.yes2sdk;
  if (!srv) {
    fail(".mcp.json: missing mcpServers.yes2sdk");
  } else if (!srv.type || !srv.url) {
    fail(".mcp.json: mcpServers.yes2sdk needs \"type\" and \"url\"");
  }
}

// 4. commands/ must exist and hold something. Per-file `description` is NOT checked
// here: `claude plugin validate .claude-plugin/plugin.json --strict` already fails on a
// command with no description, and CI runs it. This is the one check that overlapped.
const cmdDir = path.join(ROOT, "commands");
if (!fs.existsSync(cmdDir)) {
  fail("missing commands/ directory");
} else if (fs.readdirSync(cmdDir).filter((f) => f.endsWith(".md")).length === 0) {
  fail("commands/ has no .md files");
}

// 5. every skill has name + description frontmatter
const skillsDir = path.join(ROOT, "skills");
if (fs.existsSync(skillsDir)) {
  for (const d of fs.readdirSync(skillsDir)) {
    const skillFile = path.join(skillsDir, d, "SKILL.md");
    if (!fs.existsSync(skillFile)) {
      fail(`skills/${d}: missing SKILL.md`);
      continue;
    }
    const fm = frontmatter(skillFile);
    if (!fm) fail(`skills/${d}/SKILL.md: missing --- frontmatter ---`);
    else {
      if (!hasKey(fm, "name")) fail(`skills/${d}/SKILL.md: frontmatter missing "name"`);
      if (!hasKey(fm, "description")) fail(`skills/${d}/SKILL.md: frontmatter missing "description"`);
    }
  }
}

// 6. agents — everything here is a documented blind spot of the official validator.
// Measured on Claude Code 2.1.224: a fixture with `name: bad:name` passes
// `claude plugin validate .claude-plugin/plugin.json --strict` with exit 0, while the
// agent silently never loads. This block is why the script stays.
const agentsDir = path.join(ROOT, "agents");
if (fs.existsSync(agentsDir)) {
  const agents = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
  if (agents.length === 0) fail("agents/ exists but has no .md files");
  for (const f of agents) {
    const fm = frontmatter(path.join(agentsDir, f));
    if (!fm) {
      fail(`agents/${f}: missing --- frontmatter ---`);
      continue;
    }
    if (!hasKey(fm, "description")) fail(`agents/${f}: frontmatter missing "description"`);
    // `[ \t]` not `\s`, or a bare `name:` swallows the following line and the error then
    // blames a colon that lives in some other key.
    const name = /^name[ \t]*:[ \t]*([^\r\n]*)/m
      .exec(fm)?.[1]
      .trim()
      .replace(/^["']|["']$/g, "")
      .trim();
    // A present-but-empty `name` is the same silent non-load as a missing one, and
    // --strict passes it, so check the value and not just the key.
    if (!name) {
      fail(`agents/${f}: frontmatter "name" is missing or empty`);
    } else if (name.includes(":")) {
      // `:` is reserved for plugin scoping (the UI shows `plugin-name:agent-name`), so an
      // agent whose own name contains one does not load at all.
      fail(`agents/${f}: "name" must not contain ":" — it is reserved for plugin scoping and the agent silently does not load (got "${name}")`);
    }
    // Silently ignored for plugin-shipped agents, for security. An agent relying on one
    // of these looks correct and does nothing.
    for (const k of ["hooks", "mcpServers", "permissionMode"]) {
      if (hasKey(fm, k)) {
        fail(`agents/${f}: "${k}" is silently ignored for plugin-shipped agents — remove it`);
      }
    }
  }
}

if (errors.length) {
  console.error(`Plugin validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("Plugin validation passed: manifests agree, skills and agents have required frontmatter.");
