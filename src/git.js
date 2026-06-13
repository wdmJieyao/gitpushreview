import { execFileSync } from 'node:child_process';

export function runGit(args, { cwd }) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

export function getGitRoot(cwd) {
  return runGit(['rev-parse', '--show-toplevel'], { cwd }).trim();
}

export function getStagedDiff(cwd) {
  return runGit(['diff', '--cached', '--unified=80', '--no-ext-diff'], { cwd });
}

export function getStagedNameStatus(cwd) {
  return runGit(['diff', '--cached', '--name-status'], { cwd });
}

export function parseChangedFiles(nameStatus) {
  return nameStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/\t/).at(-1))
    .filter(Boolean);
}

export function getStagedSnapshot(cwd) {
  const root = getGitRoot(cwd);
  const diff = getStagedDiff(root);
  const files = parseChangedFiles(getStagedNameStatus(root));
  return { root, diff, files };
}
