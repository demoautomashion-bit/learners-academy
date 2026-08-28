const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

// Connection strings: Secondary DB (Source) -> 3rd DB (Destination)
const sourceUrl = "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"
const targetUrl = "postgresql://neondb_owner:npg_frCP0eoc5pDu@ep-autumn-dew-a59b4nu1-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

console.log("==================================================")
console.log("  DATA TRANSFER: SECONDARY DB -> 3RD DATABASE     ")
console.log("==================================================")
console.log(`SOURCE DB (Secondary): ${sourceUrl.split('@')[1]}`)
console.log(`TARGET DB (3rd DB):    ${targetUrl.split('@')[1]}`)
console.log("==================================================\n")

const source = new PrismaClient({ datasources: { db: { url: sourceUrl } } })
const target = new PrismaClient({ datasources: { db: { url: targetUrl } } })

async function transferTable(tableName, fetchFn, insertFn) {
  try {
    process.stdout.write(`Fetching ${tableName} from Secondary DB... `)
    const records = await fetchFn()
    console.log(`(${records.length} records)`)

    if (records.length > 0) {
      process.stdout.write(`Transferring ${records.length} ${tableName} records to 3rd DB... `)
      let count = 0
      for (const record of records) {
        await insertFn(record)
        count++
      }
      console.log(`[COMPLETED ${count}/${records.length}]`)
    } else {
      console.log(`Skipping ${tableName} (0 records found)`)
    }
  } catch (err) {
    console.error(`\n[ERROR] Failed to transfer ${tableName}:`, err.message)
  }
}

async function main() {
  try {
    console.log("Starting 1:1 Upsert Transfer in Dependency Order...\n")

    // Independent tables
    await transferTable('Admin', () => source.admin.findMany(), (r) => target.admin.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('SystemSettings', () => source.systemSettings.findMany(), (r) => target.systemSettings.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('Announcement', () => source.announcement.findMany(), (r) => target.announcement.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('CardTemplate', () => source.cardTemplate.findMany(), (r) => target.cardTemplate.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('BroadcastLog', () => source.broadcastLog.findMany(), (r) => target.broadcastLog.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('Expenditure', () => source.expenditure.findMany(), (r) => target.expenditure.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('ActivityLog', () => source.activityLog.findMany(), (r) => target.activityLog.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('TimeSlot', () => source.timeSlot.findMany(), (r) => target.timeSlot.upsert({ where: { id: r.id }, create: r, update: r }))

    // Faculty & Students
    await transferTable('Teacher', () => source.teacher.findMany(), (r) => target.teacher.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('Student', () => source.student.findMany(), (r) => target.student.upsert({ where: { id: r.id }, create: r, update: r }))

    // Courses (depends on Teacher & TimeSlot)
    await transferTable('Course', () => source.course.findMany(), (r) => target.course.upsert({ where: { id: r.id }, create: r, update: r }))

    // Teacher Relations
    await transferTable('TeacherAttendance', () => source.teacherAttendance.findMany(), (r) => target.teacherAttendance.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('AudioFile', () => source.audioFile.findMany(), (r) => target.audioFile.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('LessonSyllabus', () => source.lessonSyllabus.findMany(), (r) => target.lessonSyllabus.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('PayrollRecord', () => source.payrollRecord.findMany(), (r) => target.payrollRecord.upsert({ where: { id: r.id }, create: r, update: r }))

    // Student & Course Relations
    await transferTable('Evaluation', () => source.evaluation.findMany(), (r) => target.evaluation.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('FeePayment', () => source.feePayment.findMany(), (r) => target.feePayment.upsert({ where: { id: r.id }, create: r, update: r }))

    // Assessments & Questions
    await transferTable('Question', () => source.question.findMany(), (r) => target.question.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('AssessmentTemplate', () => source.assessmentTemplate.findMany(), (r) => target.assessmentTemplate.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('Assignment', () => source.assignment.findMany(), (r) => target.assignment.upsert({ where: { id: r.id }, create: r, update: r }))
    await transferTable('Submission', () => source.submission.findMany(), (r) => target.submission.upsert({ where: { id: r.id }, create: r, update: r }))

    console.log("\n==================================================")
    console.log(" SUCCESS: Transfer from Secondary to 3rd DB Done! ")
    console.log("==================================================")
  } catch (error) {
    console.error("\nFATAL TRANSFER ERROR:", error)
  } finally {
    await source.$disconnect()
    await target.$disconnect()
  }
}

main()
