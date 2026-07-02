import fs from 'node:fs';
import path from 'node:path';

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;
}

export function loadBdrContext(bdrRoot) {
  const pkg = readJsonIfExists(path.join(bdrRoot, 'package.json')) || {};
  const skillsRoot = path.join(bdrRoot, 'skills');
  const skills = [];

  if (fs.existsSync(skillsRoot)) {
    for (const name of fs.readdirSync(skillsRoot)) {
      if (!name.startsWith('bdr-') && !name.startsWith('openmole-')) continue;
      const skillPath = path.join(skillsRoot, name, 'SKILL.md');
      const content = readTextIfExists(skillPath);
      if (content) skills.push({ name, path: skillPath, content });
    }
  }

  const optionalFiles = [
    'templates/badsmells-entry.md',
    'templates/badsmells-header.md',
    'templates/analysis-header.md',
  ].map((relative) => {
    const filePath = path.join(bdrRoot, relative);
    return { relative, content: readTextIfExists(filePath) };
  }).filter((entry) => entry.content);

  const text = [
    `Bad-smell package: ${pkg.name || 'unknown'} ${pkg.version || 'unknown'}`,
    ...skills.map((skill) => `\n# ${skill.name}\n${skill.content}`),
    ...optionalFiles.map((file) => `\n# ${file.relative}\n${file.content}`),
  ].join('\n');

  return { package: pkg, skills, optionalFiles, text };
}
