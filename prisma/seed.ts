import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('=== SEEDING COMPREHENSIVE INSTITUTIONAL DATA TO NEW NEON DB ===')

  // 1. System Settings
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {
      academyName: 'The Learners Academy',
      tagline: 'Premium English Language Education',
      missionStatement: 'Empowering learners with world-class language education through specialized faculty and audited curricula.',
      termLabel: 'Term 2 Registration',
    },
    create: {
      id: 'singleton',
      academyName: 'The Learners Academy',
      tagline: 'Premium English Language Education',
      missionStatement: 'Empowering learners with world-class language education through specialized faculty and audited curricula.',
      termLabel: 'Term 2 Registration',
    }
  })
  console.log('✓ System Settings created:', settings.academyName)

  // 2. Admin Account
  const adminEmail = 'admin@learnersacademy.com'
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: 'AdminSecure2026!', name: 'Academy Admin', role: 'admin' },
    create: { email: adminEmail, password: 'AdminSecure2026!', name: 'Academy Admin', role: 'admin' }
  })
  console.log('✓ Admin Account ready:', admin.email)

  // 3. Teachers
  const teacher1 = await prisma.teacher.upsert({
    where: { email: 'teacher@learnersacademy.com' },
    update: {
      name: 'Sarah Jenkins',
      employeeId: 'EMP-1001',
      employeePassword: 'Teacher123!',
      phone: '+1 (555) 234-5678',
      subjects: ['Advanced Grammar', 'IELTS Preparation', 'Academic Writing'],
      qualifications: ['MA Applied Linguistics', 'CELTA Certified'],
      status: 'active',
      salary: 4500
    },
    create: {
      name: 'Sarah Jenkins',
      email: 'teacher@learnersacademy.com',
      employeeId: 'EMP-1001',
      employeePassword: 'Teacher123!',
      phone: '+1 (555) 234-5678',
      subjects: ['Advanced Grammar', 'IELTS Preparation', 'Academic Writing'],
      qualifications: ['MA Applied Linguistics', 'CELTA Certified'],
      status: 'active',
      salary: 4500
    }
  })

  const teacher2 = await prisma.teacher.upsert({
    where: { email: 'm.david@learnersacademy.com' },
    update: {
      name: 'Michael David',
      employeeId: 'EMP-1002',
      employeePassword: 'Teacher123!',
      phone: '+1 (555) 345-6789',
      subjects: ['Spoken English', 'Pronunciation', 'Business English'],
      qualifications: ['BA English Literature', 'TEFL Certified'],
      status: 'active',
      salary: 4200
    },
    create: {
      name: 'Michael David',
      email: 'm.david@learnersacademy.com',
      employeeId: 'EMP-1002',
      employeePassword: 'Teacher123!',
      phone: '+1 (555) 345-6789',
      subjects: ['Spoken English', 'Pronunciation', 'Business English'],
      qualifications: ['BA English Literature', 'TEFL Certified'],
      status: 'active',
      salary: 4200
    }
  })
  console.log('✓ Teachers created:', teacher1.name, teacher2.name)

  // 4. Students
  const student1 = await prisma.student.upsert({
    where: { studentId: 'STU-1001' },
    update: {
      name: 'Alexander Wright',
      email: 'student@learnersacademy.com',
      password: 'Student123!',
      phone: '+1 (555) 987-6543',
      guardianName: 'Robert Wright',
      status: 'active',
      progress: 85,
      grade: 'Level 5 - Advanced',
      enrolledCourses: ['IELTS Intensive Masterclass']
    },
    create: {
      name: 'Alexander Wright',
      email: 'student@learnersacademy.com',
      studentId: 'STU-1001',
      password: 'Student123!',
      phone: '+1 (555) 987-6543',
      guardianName: 'Robert Wright',
      status: 'active',
      progress: 85,
      grade: 'Level 5 - Advanced',
      enrolledCourses: ['IELTS Intensive Masterclass']
    }
  })

  const student2 = await prisma.student.upsert({
    where: { studentId: 'STU-1002' },
    update: {
      name: 'Emma Watson',
      email: 'emma.w@learnersacademy.com',
      password: 'Student123!',
      phone: '+1 (555) 876-5432',
      guardianName: 'Elena Watson',
      status: 'active',
      progress: 92,
      grade: 'Level 6 - Advanced',
      enrolledCourses: ['Professional Business English']
    },
    create: {
      name: 'Emma Watson',
      email: 'emma.w@learnersacademy.com',
      studentId: 'STU-1002',
      password: 'Student123!',
      phone: '+1 (555) 876-5432',
      guardianName: 'Elena Watson',
      status: 'active',
      progress: 92,
      grade: 'Level 6 - Advanced',
      enrolledCourses: ['Professional Business English']
    }
  })
  console.log('✓ Students created:', student1.name, student2.name)

  // 5. TimeSlots & Courses
  const timeSlot1 = await prisma.timeSlot.upsert({
    where: { id: 'slot-morning-1' },
    update: { startTime: '09:00 AM', endTime: '11:00 AM', label: 'Morning Slot A' },
    create: { id: 'slot-morning-1', startTime: '09:00 AM', endTime: '11:00 AM', label: 'Morning Slot A' }
  })

  const course1 = await prisma.course.upsert({
    where: { id: 'course-ielts-1' },
    update: {
      title: 'IELTS Intensive Masterclass',
      description: 'Comprehensive preparation covering Academic Reading, Writing Task 1 & 2, Listening strategies, and Speaking fluency.',
      level: 'Level 5 - Advanced',
      teacherId: teacher1.id,
      teacherName: teacher1.name,
      capacity: 25,
      enrolled: 18,
      duration: '12 Weeks',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-30'),
      roomNumber: 'Room 302',
      feeAmount: 350,
      timing: '09:00 AM - 11:00 AM',
      timeSlotId: timeSlot1.id
    },
    create: {
      id: 'course-ielts-1',
      title: 'IELTS Intensive Masterclass',
      description: 'Comprehensive preparation covering Academic Reading, Writing Task 1 & 2, Listening strategies, and Speaking fluency.',
      level: 'Level 5 - Advanced',
      teacherId: teacher1.id,
      teacherName: teacher1.name,
      capacity: 25,
      enrolled: 18,
      duration: '12 Weeks',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-30'),
      roomNumber: 'Room 302',
      feeAmount: 350,
      timing: '09:00 AM - 11:00 AM',
      timeSlotId: timeSlot1.id
    }
  })
  console.log('✓ TimeSlots & Courses created:', course1.title)

  // 6. Test Questions Bank (Grammar, Vocabulary, Reading, Listening, Speaking)
  const q1 = await prisma.question.upsert({
    where: { id: 'q-seed-grammar-1' },
    update: {},
    create: {
      id: 'q-seed-grammar-1',
      category: 'Grammar',
      type: 'Multiple Choice',
      content: 'Identify the correct conditional sentence for hypothetical past situations:',
      options: [
        'If I study harder, I would pass the test.',
        'If I had studied harder, I would have passed the test.',
        'If I studied harder, I will pass the test.',
        'If I have studied harder, I passed the test.'
      ],
      correctAnswer: 'If I had studied harder, I would have passed the test.',
      phase: 'First Test',
      difficulty: 'Hard',
      isApproved: true,
      classLevel: 'Level 5 - Advanced',
      teacherId: teacher1.id
    }
  })

  const q2 = await prisma.question.upsert({
    where: { id: 'q-seed-reading-1' },
    update: {},
    create: {
      id: 'q-seed-reading-1',
      category: 'Reading',
      type: 'Reading Comprehension',
      passageTitle: 'The Evolution of Modern Linguistics',
      passageText: 'Linguistics is the scientific study of language and its structure. It involves analyzing language form, language meaning, and language in context. Early modern linguistic analysis began with Ferdinand de Saussure in the early 20th century.',
      content: 'According to the passage, when did early modern linguistic analysis begin?',
      options: ['In the 18th century', 'In the early 20th century', 'In the late 19th century', 'In the 21st century'],
      correctAnswer: 'In the early 20th century',
      phase: 'First Test',
      difficulty: 'Medium',
      isApproved: true,
      classLevel: 'Level 5 - Advanced',
      teacherId: teacher1.id
    }
  })

  const q3 = await prisma.question.upsert({
    where: { id: 'q-seed-speaking-1' },
    update: {},
    create: {
      id: 'q-seed-speaking-1',
      category: 'Speaking',
      type: 'Speaking Task',
      speakingTitle: 'Describe a memorable educational experience you had.',
      content: 'Speak clearly into your microphone about a lesson or lecture that inspired you.',
      prepTimeSeconds: 30,
      speakingMinTimeSeconds: 60,
      speakingTimeSeconds: 120,
      phase: 'First Test',
      difficulty: 'Medium',
      isApproved: true,
      classLevel: 'Level 5 - Advanced',
      teacherId: teacher1.id
    }
  })
  console.log('✓ Sample Test Question Bank seeded.')

  // 7. Assessment Templates
  const assessment1 = await prisma.assessmentTemplate.upsert({
    where: { id: 'assessment-term1-midterm' },
    update: {
      status: 'active',
      accessCode: 'TLA-MID2026'
    },
    create: {
      id: 'assessment-term1-midterm',
      title: 'Term 1 Advanced Academic English Assessment',
      phase: 'First Test',
      classLevels: ['Level 5 - Advanced', 'Level 6 - Advanced'],
      courseIds: [course1.id],
      nature: 'Graded Assessment',
      totalMarks: 100,
      markAllocation: { grammar: 30, reading: 30, listening: 20, speaking: 20 },
      durationMinutes: 60,
      questionCount: 15,
      accessCode: 'TLA-MID2026',
      status: 'active',
      submittedByTeacherId: teacher1.id,
      submittedByTeacherName: teacher1.name,
      isAdaptive: false
    }
  })
  console.log('✓ Assessment Template created:', assessment1.title, '(Code:', assessment1.accessCode, ')')

  // 8. Evaluations
  await prisma.evaluation.upsert({
    where: {
      studentId_courseId_term: {
        studentId: student1.id,
        courseId: course1.id,
        term: 'Term 1'
      }
    },
    update: { midterm: 88, final: 92, attendance: 95, participation: 90, discipline: 100 },
    create: {
      studentId: student1.id,
      courseId: course1.id,
      term: 'Term 1',
      midterm: 88,
      final: 92,
      attendance: 95,
      participation: 90,
      discipline: 100
    }
  })
  console.log('✓ Student Evaluations seeded.')

  // 9. Card Template (Result Card Design Layout)
  await prisma.cardTemplate.upsert({
    where: { level: 'Level 5 - Advanced' },
    update: {},
    create: {
      level: 'Level 5 - Advanced',
      backgroundUrl: '/Result Card Final A5-1.png',
      coordinates: {
        studentName: { top: 120, left: 180, fontSize: 18 },
        level: { top: 160, left: 180, fontSize: 16 },
        midtermObtained: { top: 220, left: 240, fontSize: 16 },
        finalObtained: { top: 260, left: 240, fontSize: 16 }
      }
    }
  })
  console.log('✓ Certificate & Card Templates seeded.')

  console.log('=== COMPLETE INSTITUTIONAL DATA SEEDING SUCCESSFUL! ===')
}

main()
  .catch((e) => {
    console.error('Seeding Failure:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
