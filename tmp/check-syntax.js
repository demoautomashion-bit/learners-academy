const fs = require('fs');

const files = [
  'app/admin/attendance/page.tsx',
  'app/admin/classes/page.tsx',
  'app/admin/classes/schedule/page.tsx',
  'app/admin/economics/page.tsx',
  'app/admin/fee-registry/page.tsx'
];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let errs = [];
  
  // 1. Missing closing quotes in className="..." that span the line end
  const lines = content.split('\n');
  lines.forEach((l, i) => {
    // Basic heuristic: check if there is an odd number of quotes on the line,
    // roughly isolated around className
    let classIndex = l.indexOf('className="');
    if (classIndex !== -1 && !l.includes('`')) {
      let quoteCount = 0;
      for (let j = classIndex + 10; j < l.length; j++) {
        if (l[j] === '"') quoteCount++;
      }
      if (quoteCount % 2 !== 0) {
         errs.push(`Line ${i+1}: Missing quote in -> ${l.trim()}`);
      }
    }
  });

  // 2. Mismatched headings
  let h1Match = content.match(/<h1[^>]*>[\s\S]*?<\/[hH][2-6]>/g);
  if (h1Match) {
    errs.push(`Mismatched <h1... closed by </hX>: ${h1Match.length} found`);
  }

  if (errs.length) {
    console.log('--- ' + f + ' ---');
    console.log(errs.join('\n'));
  }
});
