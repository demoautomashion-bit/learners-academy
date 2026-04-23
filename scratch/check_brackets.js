
import fs from 'fs';

const content = fs.readFileSync('app/teacher/library/page.tsx', 'utf8');

function checkBrackets(str) {
    const stack = [];
    const open = '({[';
    const close = ')}]';
    const lines = str.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (open.includes(char)) {
                stack.push({ char, line: i + 1, col: j + 1 });
            } else if (close.includes(char)) {
                const last = stack.pop();
                if (!last || open.indexOf(last.char) !== close.indexOf(char)) {
                    console.log(`Unmatched closing ${char} at line ${i + 1}, col ${j + 1}`);
                }
            }
        }
    }
    
    while (stack.length > 0) {
        const last = stack.pop();
        console.log(`Unclosed opening ${last.char} at line ${last.line}, col ${last.col}`);
    }
}

checkBrackets(content);
