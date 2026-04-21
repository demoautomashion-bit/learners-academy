import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const courses = await prisma.course.findMany()
  
  for (const course of courses) {
    if (course.title.includes(' - ')) {
      const parts = course.title.split(' - ')
      if (parts.length > 1) {
        // e.g. "Foundation One - 04:00 PM - 05:00 PM"
        const titleWithoutTiming = parts[0].trim()
        const timingSub = parts.slice(1).join(' - ').trim()
        
        console.log(`Updating Course "${course.title}"`)
        console.log(`  -> Title: "${titleWithoutTiming}"\n  -> Timing: "${timingSub}"`)
        
        await prisma.course.update({
          where: { id: course.id },
          data: {
            title: titleWithoutTiming,
            timing: timingSub !== '' ? timingSub : course.timing
          }
        })
      }
    }
  }

  console.log('Finished updating course titles and timings.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
