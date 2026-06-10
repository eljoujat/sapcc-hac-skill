#!/usr/bin/env node
'use strict';

/**
 * sapcc-hac-skill – execute.js
 *
 * CLI entry point for the SAP Commerce Cloud HAC skill.
 * Delegates to sapcc-hac-client for Groovy or FlexibleSearch execution.
 *
 * Usage:
 *   node execute.js --type flexsearch --query "SELECT {pk} FROM {Product}"
 *   node execute.js --type groovy --script "return spring.getBean('productService').toString()"
 *   node execute.js --type groovy --file /path/to/script.groovy [--commit]
 *   node execute.js --health-check
 *
 * Options:
 *   --type           groovy | flexsearch  (required unless --health-check)
 *   --query          FlexibleSearch query string
 *   --script         Inline Groovy script
 *   --file           Path to a .groovy file
 *   --commit         Commit DB transaction (Groovy only, default: false)
 *   --max-count N    Max rows for FlexSearch (default: 200)
 *   --locale LOCALE  Locale for FlexSearch (default: en)
 *   --user USER      SAP CC user context for FlexSearch (default: admin)
 *   --json           Force raw JSON output
 *   --env-file PATH  Explicit path to .env file
 *   --health-check   Authenticate and print connection info
 */

const path  = require('path');
const fs    = require('fs');

// ─── Auto-install dependencies on first use ────────────────────────────────
// Runs npm install once (stamp file prevents repeat installs).
// The agent never needs to call npm install manually.

(function ensureDeps() {
  const skillDir  = path.join(__dirname, '..');
  const nmDir     = path.join(skillDir, 'node_modules');
  const stampFile = path.join(skillDir, 'node_modules', '.sapcc-hac-installed');

  // Already installed? Skip immediately.
  if (fs.existsSync(stampFile)) return;
  // node_modules exists but no stamp (manual install) – write stamp and skip.
  if (fs.existsSync(path.join(nmDir, 'sapcc-hac-client'))) {
    try { fs.writeFileSync(stampFile, new Date().toISOString()); } catch (_) {}
    return;
  }

  process.stderr.write('[sapcc-hac-skill] First run – installing dependencies...\n');
  try {
    const { execSync } = require('child_process');
    execSync('npm install --prefer-offline --no-audit --no-fund --loglevel=error', {
      cwd: skillDir,
      stdio: ['ignore', 'ignore', 'pipe'],
      timeout: 90_000,
    });
    try { fs.writeFileSync(stampFile, new Date().toISOString()); } catch (_) {}
    process.stderr.write('[sapcc-hac-skill] Dependencies installed.\n');
  } catch (e) {
    process.stderr.write(`[sapcc-hac-skill] npm install failed: ${e.message}\n`);
  }
}());

// ─── Argument parsing (no extra deps) ──────────────────────────────────────

const args = process.argv.slice(2);

function getArg(flag, defaultValue = null) {
  const idx = args.indexOf(flag);
  if (idx === -1) return defaultValue;
  return args[idx + 1] || defaultValue;
}

function hasFlag(flag) {
  return args.includes(flag);
}

const type        = getArg('--type');
const queryArg    = getArg('--query');
const scriptArg   = getArg('--script');
const fileArg     = getArg('--file');
const commit      = hasFlag('--commit');
const maxCount    = parseInt(getArg('--max-count', '200'), 10);
const locale      = getArg('--locale', 'en');
const user        = getArg('--user', 'admin');
const jsonOutput  = hasFlag('--json');
const envFilePath = getArg('--env-file');
const healthCheck = hasFlag('--health-check');
const scriptType  = getArg('--script-type', 'groovy'); // groovy | beanshell

// ─── Load sapcc-hac-client (local or global) ───────────────────────────────

let createClient;
try {
  const clientPath = require.resolve('sapcc-hac-client', {
    paths: [__dirname, path.join(__dirname, '..'), process.cwd()],
  });
  ({ createClient } = require(clientPath));
} catch (e) {
  // Should never happen after ensureDeps() – surface a clear message just in case.
  console.log(JSON.stringify({
    success: false,
    error: 'sapcc-hac-client not found after auto-install attempt.',
    hint: `Run manually: cd ${path.join(__dirname, '..')} && npm install`,
  }, null, 2));
  process.exit(1);
}

// ─── Output helpers ────────────────────────────────────────────────────────

function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

function outputError(msg, detail = null) {
  output({ success: false, error: msg, ...(detail ? { detail } : {}) });
  process.exit(1);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // Resolve .env: explicit arg → cwd/.env → skill/../.env → env vars
  const envPaths = [
    envFilePath,
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '.env'),
  ].filter(Boolean);

  let envLoaded = false;
  const dotenv = require('dotenv');
  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      envLoaded = true;
      if (process.env.HAC_DEBUG === 'true') {
        process.stderr.write(`[sapcc-hac-skill] Loaded .env from: ${p}\n`);
      }
      break;
    }
  }

  // Build client
  let client;
  try {
    client = createClient();
  } catch (e) {
    outputError(e.message, 'Set HAC_URL, HAC_USERNAME and HAC_PASSWORD in your .env file.');
  }

  // ── Health check ──────────────────────────────────────────────────────────
  if (healthCheck) {
    try {
      await client.authenticate();
      output({
        success: true,
        message: 'Authentication successful',
        hacUrl: process.env.HAC_URL,
        username: process.env.HAC_USERNAME,
        envLoaded,
      });
    } catch (e) {
      outputError(`Health check failed: ${e.message}`);
    }
    return;
  }

  // ── Validate inputs ───────────────────────────────────────────────────────
  if (!type) {
    outputError('Missing --type argument. Use: --type groovy | --type flexsearch');
  }

  if (type !== 'groovy' && type !== 'flexsearch') {
    outputError(`Invalid --type "${type}". Must be "groovy" or "flexsearch".`);
  }

  // ── FlexibleSearch ────────────────────────────────────────────────────────
  if (type === 'flexsearch') {
    if (!queryArg) {
      outputError('Missing --query argument for flexsearch.');
    }

    let result;
    try {
      result = await client.executeFlexSearch(queryArg, { maxCount, user, locale });
    } catch (e) {
      outputError(`FlexSearch execution error: ${e.message}`);
    }

    output(result);
    return;
  }

  // ── Groovy ─────────────────────────────────────────────────────────────────
  if (type === 'groovy') {
    let script = scriptArg;

    if (!script && fileArg) {
      const resolved = path.resolve(fileArg);
      if (!fs.existsSync(resolved)) {
        outputError(`Groovy file not found: ${resolved}`);
      }
      script = fs.readFileSync(resolved, 'utf-8');
    }

    if (!script) {
      outputError('Missing --script or --file argument for groovy.');
    }

    let result;
    try {
      result = await client.executeGroovy(script, { commit, scriptType });
    } catch (e) {
      outputError(`Groovy execution error: ${e.message}`);
    }

    output(result);
    return;
  }
}

main().catch((err) => {
  outputError(`Unexpected error: ${err.message}`, err.stack);
});
