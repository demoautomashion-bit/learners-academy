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
    
    // Correct mismatched heading tags: <hX ...> </hY> becomes <hY ...> </hY>
    content = content.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/(h[1-6])>/gi, (match, openTag, prefix, inner, closeTag) => {
        if (openTag.toLowerCase() !== closeTag.toLowerCase()) {
            totalFixes++;
            return `<${closeTag.toLowerCase()}${prefix}>${inner}</${closeTag.toLowerCase()}>`;
        }
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
    }
});

console.log(`Successfully normalized ${totalFixes} mismatched JSX heading boundaries.`);
