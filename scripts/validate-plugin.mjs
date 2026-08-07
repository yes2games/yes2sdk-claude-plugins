#!/usr/bin/env node
// Structural validation for the Yes2SDK Claude Code plugin.
// Dependency-free: parses the JSON manifests and checks that every command and
// skill carries the frontmatter Claude Code requires. Fails (exit 1) on any
// problem so a broken manifest can't land — there is no build step to catch it.

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

// 4. every command has a description frontmatter
const cmdDir = path.join(ROOT, "commands");
if (!fs.existsSync(cmdDir)) {
  fail("missing commands/ directory");
} else {
  const cmds = fs.readdirSync(cmdDir).filter((f) => f.endsWith(".md"));
  if (cmds.length === 0) fail("commands/ has no .md files");
  for (const f of cmds) {
    const fm = frontmatter(path.join(cmdDir, f));
    if (!fm) fail(`commands/${f}: missing --- frontmatter ---`);
    else if (!hasKey(fm, "description")) fail(`commands/${f}: frontmatter missing "description"`);
  }
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

if (errors.length) {
  console.error(`Plugin validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("Plugin validation passed: manifests parse, commands and skills have required frontmatter.");
