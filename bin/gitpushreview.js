#!/usr/bin/env node
import { main } from '../src/cli.js';

main(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
  stdin: process.stdin,
}).then((code) => {
  process.exitCode = code;
}).catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
