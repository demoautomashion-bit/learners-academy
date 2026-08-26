import { PrismaClient } from '@prisma/client'

const dbUrl = (process.env.DATABASE_URL || '').replace('&channel_binding=require', '').replace('?channel_binding=require', '')
console.log("Testing with URL (sanitized):", dbUrl.replace(/:[^:@]+@/, ':****@'))

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
})

async function testConnection() {
  try {
    const adminCount = await prisma.admin.count()
    const teacherCount = await prisma.teacher.count()
    const studentCount = await prisma.student.count()
    console.log("DB CONNECTION SUCCESSFUL!")
    console.log(`Admins in DB: ${adminCount}`)
    console.log(`Teachers in DB: ${teacherCount}`)
    console.log(`Students in DB: ${studentCount}`)

    if (adminCount > 0) {
      const admins = await prisma.admin.findMany({ select: { id: true, email: true, name: true, role: true } })
      console.log("Admins:", JSON.stringify(admins))
    } else {
      console.log("NO ADMIN ACCOUNTS FOUND IN DB!")
    }

    if (teacherCount > 0) {
      const teachers = await prisma.teacher.findMany({ select: { id: true, email: true, employeeId: true, name: true } })
      console.log("Teachers count:", teachers.length, "Sample:", JSON.stringify(teachers.slice(0, 2)))
    } else {
      console.log("NO TEACHER ACCOUNTS FOUND IN DB!")
    }

    if (studentCount > 0) {
      const students = await prisma.student.findMany({ select: { id: true, email: true, studentId: true, name: true } })
      console.log("Students count:", students.length, "Sample:", JSON.stringify(students.slice(0, 2)))
    } else {
      console.log("NO STUDENT ACCOUNTS FOUND IN DB!")
    }
  } catch (err: any) {
    console.error("DB CONNECTION ERROR:", err.message || err)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
