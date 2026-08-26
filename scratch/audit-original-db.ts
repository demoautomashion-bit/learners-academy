import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function auditOriginalDatabase() {
  console.log("=== AUDITING LIVE ORIGINAL NEON DATABASE (ep-rapid-king-amp4tewt) ===")
  try {
    const adminCount = await prisma.admin.count()
    const teacherCount = await prisma.teacher.count()
    const studentCount = await prisma.student.count()
    const courseCount = await prisma.course.count()
    const questionCount = await prisma.question.count()
    const assessmentCount = await prisma.assessmentTemplate.count()
    const evaluationCount = await prisma.evaluation.count()
    const cardTemplateCount = await prisma.cardTemplate.count()

    console.log("---------------------------------------------------------")
    console.log(`✓ Original Admin Accounts:          ${adminCount}`)
    console.log(`✓ Original Teacher Accounts:        ${teacherCount}`)
    console.log(`✓ Original Student Accounts:        ${studentCount}`)
    console.log(`✓ Original Courses / Classes:       ${courseCount}`)
    console.log(`✓ Custom Test Questions:            ${questionCount}`)
    console.log(`✓ Custom Assessment Templates:      ${assessmentCount}`)
    console.log(`✓ Student Evaluation Records:       ${evaluationCount}`)
    console.log(`✓ Certificate / Card Templates:     ${cardTemplateCount}`)
    console.log("---------------------------------------------------------")

    if (adminCount > 0) {
      const admins = await prisma.admin.findMany({ select: { email: true, name: true, role: true } })
      console.log("Admins:", JSON.stringify(admins))
    }
    if (teacherCount > 0) {
      const teachers = await prisma.teacher.findMany({ select: { email: true, name: true, employeeId: true } })
      console.log("Teachers:", JSON.stringify(teachers))
    }
    if (studentCount > 0) {
      const students = await prisma.student.findMany({ select: { email: true, name: true, studentId: true } })
      console.log("Students:", JSON.stringify(students))
    }
    if (questionCount > 0) {
      const questions = await prisma.question.findMany({ select: { id: true, category: true, type: true, content: true }, take: 5 })
      console.log("Sample Questions:", JSON.stringify(questions))
    }
    if (assessmentCount > 0) {
      const assessments = await prisma.assessmentTemplate.findMany({ select: { id: true, title: true, accessCode: true, status: true } })
      console.log("Assessments:", JSON.stringify(assessments))
    }
  } catch (err: any) {
    console.error("Audit Error:", err.message || err)
  } finally {
    await prisma.$disconnect()
  }
}

auditOriginalDatabase()
