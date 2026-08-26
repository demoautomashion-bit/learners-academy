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

async function cleanupMockData() {
  console.log("==================================================")
  console.log("       MOCK DATA CLEANUP & PURGE ENGINE           ")
  console.log("==================================================\n")

  const mockTeacherIds = ['cmta04ugy0001tbbscg9jxotp']
  const mockCourseIds = ['course-ielts-1']
  const mockStudentIds = ['cmta04v8x0002tbbssfmvv7xw', 'cmta0hmtg0004tbvo0pbzf8oi']
  const mockAssessmentIds = ['assessment-term1-midterm']
  const mockQuestionIds = ['q-seed-grammar-1', 'q-seed-reading-1', 'q-seed-speaking-1']

  // 1. Delete dependent submissions, evaluations, fee payments, payroll for mock entities
  await prisma.submission.deleteMany({
    where: {
      OR: [
        { assignmentId: { in: mockAssessmentIds } },
        { studentId: { in: mockStudentIds } }
      ]
    }
  })

  await prisma.evaluation.deleteMany({
    where: {
      OR: [
        { courseId: { in: mockCourseIds } },
        { studentId: { in: mockStudentIds } }
      ]
    }
  })

  await prisma.feePayment.deleteMany({
    where: {
      OR: [
        { courseId: { in: mockCourseIds } },
        { studentId: { in: mockStudentIds } }
      ]
    }
  })

  await prisma.payrollRecord.deleteMany({
    where: { teacherId: { in: mockTeacherIds } }
  })

  // 2. Delete Mock Seed Questions
  const delQuestions = await prisma.question.deleteMany({
    where: { id: { in: mockQuestionIds } }
  })
  console.log(`- Deleted ${delQuestions.count} mock questions (${mockQuestionIds.join(', ')})`)

  // 3. Delete Mock Assessment
  const delAssessments = await prisma.assessmentTemplate.deleteMany({
    where: { id: { in: mockAssessmentIds } }
  })
  console.log(`- Deleted ${delAssessments.count} mock assessments (${mockAssessmentIds.join(', ')})`)

  // 4. Delete Mock Students
  const delStudents = await prisma.student.deleteMany({
    where: {
      OR: [
        { id: { in: mockStudentIds } },
        { studentId: { in: ['STU-1001', 'STU-1002'] } }
      ]
    }
  })
  console.log(`- Deleted ${delStudents.count} mock students (Alexander Wright, Emma Watson)`)

  // 5. Delete Mock Course
  const delCourses = await prisma.course.deleteMany({
    where: { id: { in: mockCourseIds } }
  })
  console.log(`- Deleted ${delCourses.count} mock courses (IELTS Intensive Masterclass)`)

  // 6. Delete Mock Teacher
  const delTeachers = await prisma.teacher.deleteMany({
    where: {
      OR: [
        { id: { in: mockTeacherIds } },
        { email: 'sarah.jenkins@learners-academy.edu' }
      ]
    }
  })
  console.log(`- Deleted ${delTeachers.count} mock teachers (Sarah Jenkins)`)

  console.log("\n==================================================")
  console.log(" SUCCESS: All Mock Data Successfully Purged!       ")
  console.log("==================================================")

  await prisma.$disconnect()
}

cleanupMockData().catch(err => {
  console.error("FATAL CLEANUP ERROR:", err)
  prisma.$disconnect()
})
