import { PrismaClient } from '@prisma/client'

const directUrl = "postgresql://neondb_owner:npg_Ck5ASZcOEI3m@ep-rapid-king-amp4tewt.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
})

async function testConnection() {
  console.log("Testing direct Neon connection (without pooler)...")
  try {
    const adminCount = await prisma.admin.count()
    const teacherCount = await prisma.teacher.count()
    const studentCount = await prisma.student.count()
    console.log("=== DB CONNECTION SUCCESSFUL! ===")
    console.log(`Admins in DB: ${adminCount}`)
    console.log(`Teachers in DB: ${teacherCount}`)
    console.log(`Students in DB: ${studentCount}`)

    if (adminCount > 0) {
      const admins = await prisma.admin.findMany({ select: { id: true, email: true, name: true, role: true } })
      console.log("Admins:", JSON.stringify(admins))
    }
    if (teacherCount > 0) {
      const teachers = await prisma.teacher.findMany({ select: { id: true, email: true, employeeId: true } })
      console.log("Teachers:", JSON.stringify(teachers))
    }
    if (studentCount > 0) {
      const students = await prisma.student.findMany({ select: { id: true, email: true, studentId: true } })
      console.log("Students:", JSON.stringify(students))
    }
  } catch (err: any) {
    console.error("DIRECT CONNECTION ERROR:", err.message || err)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
