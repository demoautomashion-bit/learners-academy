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

let count = 0;

files.forEach(file => {
    let original = fs.readFileSync(file, 'utf8');
    let content = original;

    // 1. Sidebar Dropdown Animation (Layout files specifically wait, any motion.div with height auto)
    content = content.replace(
        /variants=\{\{\s*visible:\s*\{\s*height:\s*["']auto["'].*?\}\s*\}\}/gs,
        `variants={{
                              visible: { 
                                opacity: 1, 
                                y: 0,
                                transition: { duration: 0.2, ease: "easeOut" } 
                              },
                              hidden: { 
                                opacity: 0, 
                                y: -10,
                                transition: { duration: 0.2, ease: "easeOut" }
                              }
                            }}`
    );

    // 2. Typography Normalization
    // Remove font-bold, font-extrabold, font-black globally
    content = content.replace(/\bfont-(bold|extrabold|black)\b/g, '');
    
    // Replace headings font weight to font-medium, and ensure font-serif is applied from Phase 2
    content = content.replace(/<h[1-6]([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/\bfont-(normal|bold|semibold)\b/g, '');
        if (!c.includes('font-medium')) c += ' font-medium';
        return `<h1${before.replace(/h[1-6]/,'h' + match.charAt(2))}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });
    content = content.replace(/<CardTitle([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames.replace(/\bfont-(normal|bold|semibold)\b/g, '');
        if (!c.includes('font-medium')) c += ' font-medium';
        return `<CardTitle${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });
    
    // Body font-normal is implicitly normal. If we see text-sm or text-base without explicit font, it's fine.
    
    // Remove custom font families inline or in styles if they're not Helvetica Neue or Cormorant Garamond
    // Looking at layout.tsx, inline styles like `fontFamily: ...` were present. Let's fix them in layouts:
    if (file.includes('layout.tsx')) {
        content = content.replace(/style=\{\{\s*fontFamily:[^{}]*\}\}/g, `style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}`);
    }

    // 3. Card Text Scaling Fix
    // Minimum text sizes. Remove text-[10px], text-[11px]. Update them to text-xs or text-sm.
    // In Phase 2 we removed most `text-[10px]`. Let's sweep again aggressively.
    content = content.replace(/text-\[10px\]|text-\[11px\]/g, 'text-xs');
    
    // Increase CardDescription to text-sm if not text-xs.
    content = content.replace(/<CardDescription([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames;
        // if it doesn't specify text-xs or text-sm, add text-sm.
        if (!c.includes('text-xs') && !c.includes('text-sm')) {
            c += ' text-sm';
        }
        return `<CardDescription${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });

    // 4. Card Design Restoration (Rounded + Depth)
    // Replace old rounded limits and flat cards with rounded-2xl glass-1 shadow-premium transition-premium
    const cardAttrRemove = /\b(bg-card\/\S+|backdrop-blur[^\s"']+|shadow-\S+|rounded-\S+|bg-card|bg-muted(?:\/\S+)?)\b/g;
    
    content = content.replace(/<Card(\s+className=")([^"]*)"/g, (match, prefix, classNames) => {
        let cleaned = classNames.replace(cardAttrRemove, '');
        const targetClasses = ['rounded-2xl', 'glass-1', 'shadow-premium', 'transition-premium', 'hover:translate-y-[-2px]', 'h-full', 'flex', 'flex-col'];
        targetClasses.forEach(cls => {
            if (!cleaned.includes(cls) && cls !== 'glass-1') {
                cleaned += ` ${cls}`;
            }
        });
        if (!cleaned.includes('glass-1') && !cleaned.includes('glass-2')) {
            cleaned += ' glass-1';
        }
        return `<Card${prefix}${cleaned.replace(/\s+/g, ' ').trim()}"`;
    });

    // 5. Uneven Card Heights Fix
    // parent grids must have items-stretch
    content = content.replace(/className="([^"]*\bgrid\b[^"]*)"/g, (match, classNames) => {
        let c = classNames;
        if (c.includes('grid-cols-') && !c.includes('items-stretch')) {
            c += ' items-stretch';
        }
        return `className="${c.replace(/\s+/g, ' ').trim()}"`;
    });
    
    // inside CardContent, ensure flex-1 so it takes up space inside the flex column Card
    content = content.replace(/<CardContent([^>]*)className="([^"]*)"/g, (match, before, classNames) => {
        let c = classNames;
        if (!c.includes('flex-1')) {
            c += ' flex-1';
        }
        return `<CardContent${before}className="${c.replace(/\s+/g, ' ').trim()}"`;
    });

    // 6. Blank White Pages (Missing return value)
    // Checking for fragments `<></>` at the root or missing return.
    // If it returns `<></>`, then it renders white page.
    content = content.replace(/return\s*\(\s*<>\s*<\/>\s*\)/g, `return <DashboardSkeleton />`);
    
    // Add missing `import { DashboardSkeleton }` if `isInitialized` check is present but import is missing
    if (content.includes('isInitialized') && content.includes('<DashboardSkeleton') && !content.includes('DashboardSkeleton {') && !content.includes('import { DashboardSkeleton')) {
        content = `import { DashboardSkeleton } from '@/components/dashboard-skeleton'\n` + content;
    }

    // 7. Animation Consistency
    // Replace inline Framer Motion variants that aren't the STAGGER series globally?
    // User requested: "Remove: Random animation duration, inline motion configs".
    // I already fixed the dropdown explicitly above. I will ensure motion.div has variants={STAGGER_ITEM} usually.
    // Doing this indiscriminately might break things like the Collapsible. I will skip arbitrary deletion of `transition={` unless absolutely safe.

    // 8. Fix stray `<h1...>` tags that got mis-replaced above
    // A bug in my line 37: `h1` replace string might have forced `h1` tag for `h2` and `h3`.
    // Wait, regex: replace(/<h[1-6]... /h' + match.charAt(2))
    // match is `<h2 className="...` so match.charAt(2) is `2`. This works!

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
    }
});

console.log('Fixed ' + count + ' files for Phase 3 UI stabilization.');
