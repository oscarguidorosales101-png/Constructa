const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') res = res.concat(walk(full));
    } else if (f.endsWith('.jsx')) res.push(full);
  });
  return res;
}

const darkRegex = /color:\s*['"]#(?:000000|000|111111|111|0a0a0a|0f172a|1e293b|334155)['"]/i;
const matches = [];

walk('./src').forEach(f => {
  fs.readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
    if (darkRegex.test(l)) matches.push(`${f}:${i+1}: ${l.trim()}`);
  });
});

console.log('Total matches with dark hardcoded text color:', matches.length);
matches.forEach(m => console.log(m));
