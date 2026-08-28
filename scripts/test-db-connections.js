const { PrismaClient } = require('@prisma/client')

const primaryUrl = "postgresql://neondb_owner:npg_Ck5ASZcOEI3m@ep-rapid-king-amp4tewt-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
const thirdUrl = "postgresql://neondb_owner:npg_frCP0eoc5pDu@ep-autumn-dew-a59b4nu1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const primary = new PrismaClient({ datasources: { db: { url: primaryUrl } } })
const third = new PrismaClient({ datasources: { db: { url: thirdUrl } } })

async function checkCounts() {
  const models = [
    'admin', 'systemSettings', 'announcement', 'cardTemplate', 'broadcastLog',
    'expenditure', 'activityLog', 'timeSlot', 'teacher', 'student', 'course',
    'teacherAttendance', 'audioFile', 'lessonSyllabus', 'payrollRecord',
    'evaluation', 'feePayment', 'question', 'assessmentTemplate', 'assignment', 'submission'
  ]

  console.log("==================================================")
  console.log("   RECORD COUNTS: ORIGINAL PRIMARY vs 3RD DB      ")
  console.log("==================================================")
  console.log(`Model               | Primary DB | 3rd DB`)
  console.log("--------------------------------------------------")

  for (const m of models) {
    let countP = 0
    let countT = 0
    try { countP = await primary[m].count() } catch (e) { countP = 'ERR' }
    try { countT = await third[m].count() } catch (e) { countT = 'ERR' }
    console.log(`${m.padEnd(19)} | ${String(countP).padEnd(10)} | ${countT}`)
  }

  await primary.$disconnect()
  await third.$disconnect()
}

checkCounts()
