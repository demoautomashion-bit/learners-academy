const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
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

const dirList = ['./app/admin', './app/teacher'];
let files = [];
dirList.forEach(d => {
    files = files.concat(walk(path.resolve(__dirname, '..', d)));
});

const reports = [];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Find all 'use client' or "use client" directives
    const directiveRegex = /^\s*['"]use client['"][;]?\s*[\r\n]*/gm;
    const matches = Array.from(content.matchAll(directiveRegex));
    
    if (matches.length > 0) {
        // Is it already the absolute first thing?
        // We can just clean it up universally.
        const originalTop5 = content.split('\n').slice(0, 5).join('\n');
        
        let newContent = content.replace(directiveRegex, '');
        newContent = newContent.replace(/^\s+/, ''); // remove any leading blank space
        newContent = `'use client'\n\n` + newContent;
        
        const newTop5 = newContent.split('\n').slice(0, 5).join('\n');
        
        if (originalTop5 !== newTop5) {
            fs.writeFileSync(file, newContent, 'utf8');
            reports.push({ 
                file: file.replace(path.resolve(__dirname, '..'), ''), 
                before: originalTop5, 
                after: newTop5 
            });
        }
    }
});

console.log(JSON.stringify(reports, null, 2));
