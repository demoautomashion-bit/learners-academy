const { PrismaClient } = require('@prisma/client')

const secondaryUrl = "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
const thirdUrl = "postgresql://neondb_owner:npg_frCP0eoc5pDu@ep-autumn-dew-a59b4nu1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

const secondary = new PrismaClient({ datasources: { db: { url: secondaryUrl } } })
const third = new PrismaClient({ datasources: { db: { url: thirdUrl } } })

async function checkCounts() {
  const models = [
    'admin', 'systemSettings', 'announcement', 'cardTemplate', 'broadcastLog',
    'expenditure', 'activityLog', 'timeSlot', 'teacher', 'student', 'course',
    'teacherAttendance', 'audioFile', 'lessonSyllabus', 'payrollRecord',
    'evaluation', 'feePayment', 'question', 'assessmentTemplate', 'assignment', 'submission'
  ]

  console.log("==================================================")
  console.log("   RECORD COUNTS: SECONDARY (UPDATED) vs 3RD DB   ")
  console.log("==================================================")
  console.log(`Model               | Secondary (Source) | 3rd DB (Current)`)
  console.log("--------------------------------------------------")

  for (const m of models) {
    let countS = 0
    let countT = 0
    try { countS = await secondary[m].count() } catch (e) { countS = 'ERR' }
    try { countT = await third[m].count() } catch (e) { countT = 'ERR' }
    console.log(`${m.padEnd(19)} | ${String(countS).padEnd(18)} | ${countT}`)
  }

  await secondary.$disconnect()
  await third.$disconnect()
}

checkCounts()
