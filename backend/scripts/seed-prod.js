#!/usr/bin/env node

/**
 * Production seed script wrapper
 * This script can be run in production without ts-node
 */

const { exec } = require('child_process');
const path = require('path');

const useFullData = process.env.USE_FULL_DATA === 'true';
const seedPath = path.join(__dirname, '..', 'dist', 'database', 'seed.js');

console.log(`Starting seed with ${useFullData ? 'FULL' : 'PARTIAL'} dataset...`);
console.log(`Executing: node ${seedPath}`);

const env = { ...process.env, USE_FULL_DATA: useFullData ? 'true' : 'false' };

const child = exec(`node ${seedPath}`, { env }, (error, stdout, stderr) => {
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);

  if (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } else {
    console.log('Seed completed successfully!');
    process.exit(0);
  }
});

// Forward output in real-time
child.stdout.on('data', (data) => process.stdout.write(data));
child.stderr.on('data', (data) => process.stderr.write(data));
