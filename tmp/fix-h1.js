const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules')) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = [...walk('./app/admin'), ...walk('./app/teacher')];

let totalFixes = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  // Replace <h1 ...> ... </hX> with <hX ...> ... </hX>
  // Note: we can't just replace h1 at start, we must find the tag used at the end and fix the start tag.
  // My previous fix used capture groups. Let's do it right.
  content = content.replace(/<(h1)([^>]*)>([\s\S]*?)<\/(h[2-6])>/gi, (match, opentag, prefix, inner, closetag) => {
      totalFixes++;
      return `<${closetag.toLowerCase()}${prefix}>${inner}</${closetag.toLowerCase()}>`;
  });

  if (content !== original) {
      fs.writeFileSync(f, content, 'utf8');
  }
});

console.log(`Fixed ${totalFixes} mismatched heading tags across the entire portal tree.`);
