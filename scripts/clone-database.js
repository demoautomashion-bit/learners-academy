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

const primaryUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_Ck5ASZcOEI3m@ep-rapid-king-amp4tewt-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
const secondaryUrl = process.env.DATABASE_URL_SECONDARY || "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"

if (!primaryUrl) {
  console.error("FATAL: DATABASE_URL is missing in environment.")
  process.exit(1)
}

console.log("==================================================")
console.log("      INSTITUTIONAL DATABASE CLONING ENGINE       ")
console.log("==================================================")
console.log(`SOURCE (Primary DB):   ${primaryUrl.split('@')[1] || 'Primary Neon Cluster'}`)
console.log(`TARGET (Secondary DB): ${secondaryUrl.split('@')[1] || 'Secondary Neon Cluster'}`)
console.log("==================================================\n")

const primary = new PrismaClient({ datasources: { db: { url: primaryUrl } } })
const secondary = new PrismaClient({ datasources: { db: { url: secondaryUrl } } })

async function cloneTable(tableName, fetchFn, insertFn) {
  try {
    process.stdout.write(`Fetching ${tableName} from Primary DB... `)
    const records = await fetchFn()
    console.log(`(${records.length} records)`)

    if (records.length > 0) {
      process.stdout.write(`Transferring ${records.length} ${tableName} to Secondary DB... `)
      let count = 0
      for (const record of records) {
        await insertFn(record)
        count++
      }
      console.log(`[DONE ${count}/${records.length}]`)
    } else {
      console.log(`Skipping ${tableName} (0 records found)`)
    }
  } catch (err) {
    console.error(`\n[ERROR] Failed to clone ${tableName}:`, err.message)
  }
}

async function main() {
  try {
    console.log("STEP 1: Reading Primary Database Records...\n")

    // Order matters for foreign key dependencies
    await cloneTable('Admin', () => primary.admin.findMany(), (r) => secondary.admin.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('SystemSettings', () => primary.systemSettings.findMany(), (r) => secondary.systemSettings.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('Announcement', () => primary.announcement.findMany(), (r) => secondary.announcement.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('CardTemplate', () => primary.cardTemplate.findMany(), (r) => secondary.cardTemplate.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('BroadcastLog', () => primary.broadcastLog.findMany(), (r) => secondary.broadcastLog.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('Expenditure', () => primary.expenditure.findMany(), (r) => secondary.expenditure.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('ActivityLog', () => primary.activityLog.findMany(), (r) => secondary.activityLog.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('TimeSlot', () => primary.timeSlot.findMany(), (r) => secondary.timeSlot.upsert({ where: { id: r.id }, create: r, update: r }))

    // Faculty & Students
    await cloneTable('Teacher', () => primary.teacher.findMany(), (r) => secondary.teacher.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('Student', () => primary.student.findMany(), (r) => secondary.student.upsert({ where: { id: r.id }, create: r, update: r }))

    // Courses (depends on Teacher & TimeSlot)
    await cloneTable('Course', () => primary.course.findMany(), (r) => secondary.course.upsert({ where: { id: r.id }, create: r, update: r }))

    // Teacher Relations (Attendance, Audio, Syllabus, Payroll)
    await cloneTable('TeacherAttendance', () => primary.teacherAttendance.findMany(), (r) => secondary.teacherAttendance.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('AudioFile', () => primary.audioFile.findMany(), (r) => secondary.audioFile.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('LessonSyllabus', () => primary.lessonSyllabus.findMany(), (r) => secondary.lessonSyllabus.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('PayrollRecord', () => primary.payrollRecord.findMany(), (r) => secondary.payrollRecord.upsert({ where: { id: r.id }, create: r, update: r }))

    // Student & Course Relations (Evaluation, FeePayment)
    await cloneTable('Evaluation', () => primary.evaluation.findMany(), (r) => secondary.evaluation.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('FeePayment', () => primary.feePayment.findMany(), (r) => secondary.feePayment.upsert({ where: { id: r.id }, create: r, update: r }))

    // Assessments & Questions
    await cloneTable('Question', () => primary.question.findMany(), (r) => secondary.question.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('AssessmentTemplate', () => primary.assessmentTemplate.findMany(), (r) => secondary.assessmentTemplate.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('Assignment', () => primary.assignment.findMany(), (r) => secondary.assignment.upsert({ where: { id: r.id }, create: r, update: r }))
    await cloneTable('Submission', () => primary.submission.findMany(), (r) => secondary.submission.upsert({ where: { id: r.id }, create: r, update: r }))

    console.log("\n==================================================")
    console.log(" SUCCESS: Complete Database Backup Clone Finished! ")
    console.log("==================================================")
  } catch (error) {
    console.error("\nFATAL CLONING ERROR:", error)
  } finally {
    await primary.$disconnect()
    await secondary.$disconnect()
  }
}

main()
