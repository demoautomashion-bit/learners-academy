const { PrismaClient } = require('@prisma/client')

const urls = [
  { name: "Secondary Direct (.us-east-2)", url: "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.us-east-2.aws.neon.tech/neondb?sslmode=require" },
  { name: "Secondary Pooled (.us-east-2)", url: "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" },
  { name: "Secondary Direct (.c-5.us-east-2)", url: "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require" },
  { name: "Secondary Pooled (.c-5.us-east-2)", url: "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require" },
]

async function testAll() {
  console.log("Testing Secondary DB URL variations...\n")
  for (const item of urls) {
    console.log(`Checking ${item.name}...`)
    const client = new PrismaClient({ datasources: { db: { url: item.url } } })
    try {
      const studentCount = await client.student.count()
      const teacherCount = await client.teacher.count()
      const courseCount = await client.course.count()
      const submissionCount = await client.submission.count()
      const questionCount = await client.question.count()
      console.log(`>>> SUCCESS on ${item.name}!`)
      console.log(`    Students: ${studentCount}`)
      console.log(`    Teachers: ${teacherCount}`)
      console.log(`    Courses: ${courseCount}`)
      console.log(`    Submissions: ${submissionCount}`)
      console.log(`    Questions: ${questionCount}`)
    } catch (err) {
      console.log(`    FAILED (${item.name}):`, err.message)
    } finally {
      await client.$disconnect()
    }
  }
}

testAll()
