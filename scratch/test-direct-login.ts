import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDirectLogin() {
  console.log("=== TESTING DIRECT DATABASE AUTH LOOKUP ===")
  try {
    const admin = await prisma.admin.findUnique({ where: { email: 'admin@learnersacademy.com' } })
    console.log("✓ Admin DB Query Result:", admin ? `Found (${admin.name})` : "Not found")

    const teacher = await prisma.teacher.findUnique({ where: { email: 'teacher@learnersacademy.com' } })
    console.log("✓ Teacher DB Query Result:", teacher ? `Found (${teacher.name}, EMP-ID: ${teacher.employeeId})` : "Not found")

    const student = await prisma.student.findFirst({ where: { email: 'student@learnersacademy.com' } })
    console.log("✓ Student DB Query Result:", student ? `Found (${student.name}, STU-ID: ${student.studentId})` : "Not found")
  } catch (e: any) {
    console.error("❌ DB Query Error:", e.message || e)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectLogin()
