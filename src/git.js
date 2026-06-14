import { execFileSync } from 'node:child_process';

export function runGit(args, { cwd }) {
  return execFileSync('git', ['-c', 'core.quotePath=false', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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

export function getStagedFileContents({ cwd, files, showFile } = {}) {
  const read = showFile || ((file) => runGit(['show', `:${file}`], { cwd }));
  const contents = {};
  for (const rawFile of files || []) {
    const file = rawFile.replace(/\\/g, '/');
    try {
      contents[file] = read(file);
    } catch {
      // Deleted files do not have a staged blob to inspect.
    }
  }
  return contents;
}

export function parseChangedFiles(nameStatus) {
  return nameStatus
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split(/\t/).at(-1))
    .filter(Boolean)
    .map((file) => file.replace(/\\/g, '/'));
}

export function getStagedSnapshot(cwd) {
  const root = getGitRoot(cwd);
  const diff = getStagedDiff(root);
  const files = parseChangedFiles(getStagedNameStatus(root));
  const fileContents = getStagedFileContents({ cwd: root, files });
  return { root, diff, files, fileContents };
}
