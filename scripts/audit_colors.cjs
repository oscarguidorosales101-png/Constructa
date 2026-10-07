const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.css')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');
const hardcodedColorRegex = /color:\s*(['"]?)#(?:ffffff|fff)\b\1/i;
let count = 0;
const matches = [];
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (hardcodedColorRegex.test(line)) {
      matches.push({ file: f, line: idx + 1, text: line.trim() });
      count++;
    }
  });
});

console.log('Total matches found:', count);
matches.forEach(m => console.log(`${m.file}:${m.line}: ${m.text.substring(0, 100)}`));
