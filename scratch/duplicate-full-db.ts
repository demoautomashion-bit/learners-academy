import { PrismaClient } from '@prisma/client'

const oldDbUrl = "postgresql://neondb_owner:npg_Ck5ASZcOEI3m@ep-rapid-king-amp4tewt.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"
const newDbUrl = "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"

const oldPrisma = new PrismaClient({ datasources: { db: { url: oldDbUrl } } })
const newPrisma = new PrismaClient({ datasources: { db: { url: newDbUrl } } })

async function duplicate() {
  console.log('=== STARTING SAFE NON-DESTRUCTIVE DATA DUPLICATION ===')
  console.log('Reading from OLD DB:', oldDbUrl.replace(/:[^:@]+@/, ':****@'))
  console.log('Writing to NEW DB:', newDbUrl.replace(/:[^:@]+@/, ':****@'))

  try {
    // 1. System Settings
    try {
      const settings = await oldPrisma.systemSettings.findMany()
      console.log(`Found ${settings.length} SystemSettings in old DB. Copying...`)
      for (const item of settings) {
        await newPrisma.systemSettings.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ SystemSettings duplicated.')
    } catch (e: any) {
      console.warn('SystemSettings copy warning (old DB unreachable/empty):', e.message || e)
    }

    // 2. Card Templates
    try {
      const cardTemplates = await oldPrisma.cardTemplate.findMany()
      console.log(`Found ${cardTemplates.length} CardTemplates in old DB. Copying...`)
      for (const item of cardTemplates) {
        await newPrisma.cardTemplate.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ CardTemplates duplicated.')
    } catch (e: any) {
      console.warn('CardTemplates copy warning:', e.message || e)
    }

    // 3. Questions
    try {
      const questions = await oldPrisma.question.findMany()
      console.log(`Found ${questions.length} Questions in old DB. Copying...`)
      for (const item of questions) {
        await newPrisma.question.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ Questions duplicated.')
    } catch (e: any) {
      console.warn('Questions copy warning:', e.message || e)
    }

    // 4. Assessment Templates
    try {
      const templates = await oldPrisma.assessmentTemplate.findMany()
      console.log(`Found ${templates.length} AssessmentTemplates in old DB. Copying...`)
      for (const item of templates) {
        await newPrisma.assessmentTemplate.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ AssessmentTemplates duplicated.')
    } catch (e: any) {
      console.warn('AssessmentTemplates copy warning:', e.message || e)
    }

    // 5. Teachers
    try {
      const teachers = await oldPrisma.teacher.findMany()
      console.log(`Found ${teachers.length} Teachers in old DB. Copying...`)
      for (const item of teachers) {
        await newPrisma.teacher.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ Teachers duplicated.')
    } catch (e: any) {
      console.warn('Teachers copy warning:', e.message || e)
    }

    // 6. Students
    try {
      const students = await oldPrisma.student.findMany()
      console.log(`Found ${students.length} Students in old DB. Copying...`)
      for (const item of students) {
        await newPrisma.student.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ Students duplicated.')
    } catch (e: any) {
      console.warn('Students copy warning:', e.message || e)
    }

    // 7. TimeSlots
    try {
      const slots = await oldPrisma.timeSlot.findMany()
      console.log(`Found ${slots.length} TimeSlots in old DB. Copying...`)
      for (const item of slots) {
        await newPrisma.timeSlot.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ TimeSlots duplicated.')
    } catch (e: any) {
      console.warn('TimeSlots copy warning:', e.message || e)
    }

    // 8. Courses
    try {
      const courses = await oldPrisma.course.findMany()
      console.log(`Found ${courses.length} Courses in old DB. Copying...`)
      for (const item of courses) {
        await newPrisma.course.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ Courses duplicated.')
    } catch (e: any) {
      console.warn('Courses copy warning:', e.message || e)
    }

    // 9. Evaluations
    try {
      const evaluations = await oldPrisma.evaluation.findMany()
      console.log(`Found ${evaluations.length} Evaluations in old DB. Copying...`)
      for (const item of evaluations) {
        await newPrisma.evaluation.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ Evaluations duplicated.')
    } catch (e: any) {
      console.warn('Evaluations copy warning:', e.message || e)
    }

    // 10. Fee Payments
    try {
      const feePayments = await oldPrisma.feePayment.findMany()
      console.log(`Found ${feePayments.length} FeePayments in old DB. Copying...`)
      for (const item of feePayments) {
        await newPrisma.feePayment.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ FeePayments duplicated.')
    } catch (e: any) {
      console.warn('FeePayments copy warning:', e.message || e)
    }

    // 11. Announcements
    try {
      const announcements = await oldPrisma.announcement.findMany()
      console.log(`Found ${announcements.length} Announcements in old DB. Copying...`)
      for (const item of announcements) {
        await newPrisma.announcement.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ Announcements duplicated.')
    } catch (e: any) {
      console.warn('Announcements copy warning:', e.message || e)
    }

    // 12. Syllabi
    try {
      const syllabi = await oldPrisma.lessonSyllabus.findMany()
      console.log(`Found ${syllabi.length} LessonSyllabi in old DB. Copying...`)
      for (const item of syllabi) {
        await newPrisma.lessonSyllabus.upsert({
          where: { id: item.id },
          update: item,
          create: item
        })
      }
      console.log('✓ LessonSyllabi duplicated.')
    } catch (e: any) {
      console.warn('LessonSyllabi copy warning:', e.message || e)
    }

    console.log('=== DATA DUPLICATION ATTEMPT FINISHED ===')
  } catch (globalErr: any) {
    console.error('Global Duplication Error:', globalErr.message || globalErr)
  } finally {
    await oldPrisma.$disconnect()
    await newPrisma.$disconnect()
  }
}

duplicate()
