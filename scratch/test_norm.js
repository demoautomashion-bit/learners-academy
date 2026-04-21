
const normalizeAcademicLevel = (val) => {
  if (!val) return ''
  
  return val.toLowerCase()
    .replace(/level\s*/g, '') 
    .replace(/grade\s*/g, '') 
    .split(/\s+/)
    .map(word => {
      const numberMap = {
        'one': '1', 'two': '2', 'three': '3', 'four': '4',
        'five': '5', 'six': '6', 'seven': '7', 'eight': '8',
        'nine': '9', 'ten': '10'
      }
      if (numberMap[word]) return numberMap[word]
      return word.replace(/^(\d+)(st|nd|rd|th)$/, '$1')
    })
    .filter(Boolean)
    .join('')
    .replace(/[^a-z0-9]/g, '') 
    .trim()
}

const normalizeTiming = (t) => {
  if (!t) return ''
  let cleaned = t.toLowerCase().replace(/\s+/g, '').replace(/\./g, '')
  cleaned = cleaned.replace(/(^|[^0-9])0(\d:)/g, '$1$2')
  return cleaned
}

const testCases = [
    { student: 'Level One', course: 'Level One' },
    { student: 'Level One', course: 'beginner' },
    { student: 'Level One', course: 'Level 1' },
    { student: 'Foundation One', course: 'Foundation 1' },
    { student: 'Beginners', course: 'beginner' },
    { student: 'Level Five', course: '5' },
    { student: '04:00 PM - 05:00 PM', course: '04:00 PM - 05:00 PM' },
    { student: '04:00 PM - 05:00 PM', course: '4:00 PM - 5:00 PM' }
];

testCases.forEach(c => {
    const sl = normalizeAcademicLevel(c.student);
    const cl = normalizeAcademicLevel(c.course);
    const levelMatch = sl === cl || sl.includes(cl) || cl.includes(sl);
    
    const st = normalizeTiming(c.student.includes(':') ? c.student : '');
    const ct = normalizeTiming(c.course.includes(':') ? c.course : '');
    const timeMatch = st === ct || (st && ct && (st.includes(ct) || ct.includes(st)));

    console.log(`Student: "${c.student}" | Course: "${c.course}"`);
    console.log(`  Level Match: ${levelMatch} (${sl} vs ${cl})`);
    console.log(`  Time Match: ${timeMatch} (${st} vs ${ct})`);
});
