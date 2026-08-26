import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
  console.log("Verifying Live Neon Database Contents...")
  try {
    const adminCount = await prisma.admin.count()
    const teacherCount = await prisma.teacher.count()
    const studentCount = await prisma.student.count()
    
    console.log("=== LIVE NEON DB STATUS ===")
    console.log(`Admins in DB: ${adminCount}`)
    console.log(`Teachers in DB: ${teacherCount}`)
    console.log(`Students in DB: ${studentCount}`)

    const admins = await prisma.admin.findMany()
    console.log("Admin Users:", JSON.stringify(admins))

    const teachers = await prisma.teacher.findMany()
    console.log("Teacher Users:", JSON.stringify(teachers))

    const students = await prisma.student.findMany()
    console.log("Student Users:", JSON.stringify(students))
  } catch (err: any) {
    console.error("Verification Error:", err.message || err)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
