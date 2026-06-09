#!/usr/bin/env node
'use strict';

/**
 * sapcc-hac-skill – setup.js
 * Checks that all dependencies are installed and the .env is configured.
 */

const path = require('path');
const fs   = require('fs');

const skillDir = path.dirname(__dirname);

console.log('\n🔍  Checking sapcc-hac-skill setup...\n');

let allOk = true;

// ─── 1. Node version ──────────────────────────────────────────────────────
const [major] = process.versions.node.split('.').map(Number);
if (major < 18) {
  console.error(`  ✘  Node.js >= 18 required (found ${process.version})`);
  allOk = false;
} else {
  console.log(`  ✔  Node.js ${process.version}`);
}

// ─── 2. sapcc-hac-client ─────────────────────────────────────────────────
try {
  require.resolve('sapcc-hac-client', { paths: [skillDir, process.cwd()] });
  const pkg = require(require.resolve('sapcc-hac-client/package.json', { paths: [skillDir, process.cwd()] }));
  console.log(`  ✔  sapcc-hac-client v${pkg.version}`);
} catch {
  console.error(`  ✘  sapcc-hac-client not found → run: cd ${skillDir} && npm install`);
  allOk = false;
}

// ─── 3. dotenv ───────────────────────────────────────────────────────────
try {
  require.resolve('dotenv', { paths: [skillDir, process.cwd()] });
  console.log('  ✔  dotenv');
} catch {
  console.error(`  ✘  dotenv not found → run: cd ${skillDir} && npm install`);
  allOk = false;
}

// ─── 4. .env file ────────────────────────────────────────────────────────
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(skillDir, '.env'),
];

let envFile = envPaths.find(p => fs.existsSync(p));
if (envFile) {
  console.log(`  ✔  .env found at ${envFile}`);

  // Check required vars
  require('dotenv').config({ path: envFile });
  const missing = ['HAC_URL', 'HAC_USERNAME', 'HAC_PASSWORD'].filter(k => !process.env[k]);
  if (missing.length > 0) {
    console.error(`  ✘  Missing required vars in .env: ${missing.join(', ')}`);
    allOk = false;
  } else {
    console.log(`  ✔  HAC_URL = ${process.env.HAC_URL}`);
    console.log(`  ✔  HAC_USERNAME = ${process.env.HAC_USERNAME}`);
    console.log('  ✔  HAC_PASSWORD = ***');
  }
} else {
  console.error('  ✘  No .env file found');
  console.error(`     Copy the example: cp ${path.join(skillDir, '.env.example')} ${path.join(process.cwd(), '.env')}`);
  allOk = false;
}

// ─── Summary ─────────────────────────────────────────────────────────────
console.log('');
if (allOk) {
  console.log('✅  All checks passed. Run a health check:');
  console.log(`   node ${path.join(skillDir, 'scripts/execute.js')} --health-check\n`);
} else {
  console.error('❌  Some checks failed. Fix the issues above and re-run.\n');
  process.exit(1);
}
