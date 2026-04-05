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
    let original = fs.readFileSync(file, 'utf8');
    let content = original;

    // Remove text-[...px] and tracking hacks globally
    content = content.replace(/text-\[\d+px\]/g, 'text-xs');
    content = content.replace(/tracking-\w+|tracking-\[[^\]]+\]/g, '');
    content = content.replace(/uppercase/g, '');

    // Card normalizations
    // Replacing bg-card/xx, backdrop-blur-xx, etc with glass-1
    const cardAttrRemove = /bg-card\/\S+|backdrop-blur\S+|shadow-premium|shadow-massive|rounded-\S+|border-primary\S+/g;
    content = content.replace(cardAttrRemove, '');
    
    // Add glass-1 to <Card className="...">
    content = content.replace(/<Card(\s+className=")([^"]*)"/g, (match, prefix, classNames) => {
        let cleaned = classNames.replace(cardAttrRemove, '');
        if (!cleaned.includes('glass-1') && !cleaned.includes('glass-2')) {
            cleaned = 'glass-1 ' + cleaned;
        }
        return `<Card${prefix}${cleaned.replace(/\s+/g, ' ').trim()}"`;
    });

    // Replace Card Padding (p-6 or p-8 normally done by defaults, but they explicitly asked to remove inconsistent padding)
    // Actually, just removing custom p-xx and returning to p-6/8 standard. <CardContent className="p-10"> -> <CardContent className="p-6">
    content = content.replace(/<CardContent([^>]*)className="([^"]*p-\d+[^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/p-\d+/g, 'p-6');
        return `<CardContent${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });

    // Typography standardization
    content = content.replace(/<h1([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/text-(4xl|5xl|6xl|2xl|xl|lg|sm)\w*/g, '').replace(/font-normal/g, '');
        if (!c.includes('text-3xl')) c += ' text-3xl font-serif';
        return `<h1${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });
    content = content.replace(/<h2([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/text-(4xl|5xl|6xl|3xl|xl|lg|sm)\w*/g, '').replace(/font-normal/g, '');
        if (!c.includes('text-2xl')) c += ' text-2xl font-serif';
        return `<h2${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });
    content = content.replace(/<CardTitle([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/text-(4xl|5xl|3xl|2xl|lg|base|sm|xs)\w*/g, '').replace(/font-normal/g, '');
        if (!c.includes('text-xl')) c += ' text-xl font-serif';
        return `<CardTitle${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });

    // Buttons standardization
    content = content.replace(/<Button([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/h-\d+|h-\[[^\]]+\]|px-\d+|py-\d+|text-\S+/g, '');
        // make sure Button isn't bulky
        return `<Button${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });
    
    // Spacing normalization
    // Replace custom big gaps
    content = content.replace(/space-y-\d+/g, (match) => {
        const num = parseInt(match.split('-')[2]);
        if (num > 6) return 'space-y-6';
        if (num === 8 || num === 10) return 'space-y-6';
        return match;
    });

    content = content.replace(/ className=" "/g, ' className=""');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        reports.push(file.replace(path.resolve(__dirname, '..'), ''));
    }
});

console.log(JSON.stringify(reports, null, 2));
