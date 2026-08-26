const fs = require('fs')
const path = require('path')

// Parse .env manually
try {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    for (const line of envConfig.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valParts] = trimmed.split('=')
        const val = valParts.join('=').replace(/^["']|["']$/g, '').trim()
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val
        }
      }
    }
  }
} catch (e) {}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function inspectData() {
  const teachers = await prisma.teacher.findMany()
  const students = await prisma.student.findMany()
  const courses = await prisma.course.findMany()
  const questions = await prisma.question.findMany()
  const assessments = await prisma.assessmentTemplate.findMany()

  console.log('=== TEACHERS (' + teachers.length + ') ===')
  teachers.forEach(t => console.log(`- [${t.id}] ${t.name} (${t.email}) | EmployeeID: ${t.employeeId}`))

  console.log('\n=== COURSES / CLASSES (' + courses.length + ') ===')
  courses.forEach(c => console.log(`- [${c.id}] ${c.title} | Level: ${c.level} | Teacher: ${c.teacherName} (${c.teacherId})`))

  console.log('\n=== SAMPLE STUDENTS (Total: ' + students.length + ') ===')
  students.slice(0, 15).forEach(s => console.log(`- [${s.id}] ${s.name} | Roll: ${s.studentId} | Grade: ${s.grade} | Enrolled: ${JSON.stringify(s.enrolledCourses)}`))

  console.log('\n=== ASSESSMENTS / TESTS (Total: ' + assessments.length + ') ===')
  assessments.forEach(a => console.log(`- [${a.id}] "${a.title}" | Token: ${a.accessCode} | TeacherId: ${a.submittedByTeacherId} | Levels: ${JSON.stringify(a.classLevels)}`))

  console.log('\n=== SAMPLE QUESTIONS (Total: ' + questions.length + ') ===')
  questions.slice(0, 10).forEach(q => console.log(`- [${q.id}] ${q.type} | Level: ${q.classLevel} | TeacherId: ${q.teacherId} | Content: "${q.content.slice(0, 45)}..."`))

  await prisma.$disconnect()
}

inspectData().catch(err => {
  console.error(err)
  prisma.$disconnect()
})
