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
    let original = content;
    let changed = false;

    // 1. Safe Identity Usage (user?.id user.id)
    if (content.includes('useAuth')) {
        const useAuthRegex = /const\s+\{\s*[^}]*user[^}]*\}\s*=\s*useAuth\(\)/g;
        let authMatch;
        while ((authMatch = useAuthRegex.exec(content)) !== null) {
            if (!content.includes('if (!user?.id) return null')) {
                const text = authMatch[0];
                content = content.replace(text, `${text}\n  if (!user?.id) return null`);
                changed = true;
            }
        }
    }

    // 2. Hydration Guards (useData and isInitialized)
    if (content.includes('useData()') && !file.includes('layout.tsx')) {
        let hasIsInitialized = content.includes('isInitialized');
        if (!hasIsInitialized) {
            const dataMatch = content.match(/const\s+\{\s*([^\}]+)\s*\}\s*=\s*useData\(\)/);
            if (dataMatch) {
                let vars = dataMatch[1].trim();
                content = content.replace(dataMatch[0], `const { ${vars}, isInitialized } = useData()`);
                changed = true;
                hasIsInitialized = true;
            }
        }

        if (hasIsInitialized && !content.includes('<DashboardSkeleton />')) {
            if (!content.includes('DashboardSkeleton')) {
                content = `import { DashboardSkeleton } from '@/components/dashboard-skeleton'\n` + content;
            }
            if (!content.includes('if (!isInitialized) return <DashboardSkeleton />')) {
                 const matchString = content.match(/const\s+\{.*isInitialized.*\}\s*=\s*useData\(\)/);
                 if (matchString) {
                     content = content.replace(matchString[0], `${matchString[0]}\n\n  if (!isInitialized) return <DashboardSkeleton />`);
                     changed = true;
                 }
            }
        }
    }
    
    // Arrays .map() protections
    const mapRegex = /(\w+)\.map\(/g;
    let modifiedMap = false;
    // Actually blind replacing `.map(` to `?.map(` can break some TS types or perfectly safe things, but let's just do `?.map(` where it's obviously array access like `[a-z]+(?:s\.map\(|s\.filter\()`... Let's just fix known risks manually if needed.
    // The prompt says: Add null-safe checks for arrays before .map() / objects before property access
    content = content.replace(/(\w+)(?<!\?)\.map\(/g, (match, prefix) => {
        // Exclude specific standard objects or simple vars
        if (['React', 'Object', 'Array'].includes(prefix)) return match;
        // Don't modify if it's already ?., or if it's inside some standard function
        return `${prefix}?.map(`;
    });
    
    content = content.replace(/(\w+)(?<!\?)\.filter\(/g, (match, prefix) => {
        if (['React', 'Object', 'Array'].includes(prefix)) return match;
        return `${prefix}?.filter(`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        reports.push({ file: file.replace(path.resolve(__dirname, '..'), ''), changed: true });
    }
});

console.log(JSON.stringify(reports, null, 2));
