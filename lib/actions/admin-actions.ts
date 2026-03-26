'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import type { Student, Teacher, Course, Schedule } from '@/lib/types'

// Students
export async function enrollStudentAction(student: Student) {
  try {
    const newStudent = await db.student.create({
      data: {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrolledCourses: student.enrolledCourses,
        status: student.status,
        avatar: student.avatar,
        guardianName: student.guardianName,
        studentId: student.studentId,
        enrolledAt: new Date(student.enrolledAt),
        progress: student.progress,
        grade: student.grade,
        classTiming: student.classTiming,
      }
    })
    revalidatePath('/admin/students')
    return { success: true, data: newStudent }
  } catch (error) {
    console.error('Failed to enroll student:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function removeStudentAction(id: string) {
  try {
    await db.student.delete({
      where: { id }
    })
    revalidatePath('/admin/students')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove student:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function updateStudentStatusAction(id: string, status: string) {
  try {
    await db.student.update({
      where: { id },
      data: { status: status as any }
    })
    revalidatePath('/admin/students')
    return { success: true }
  } catch (error) {
    console.error('Failed to update student status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

// Teachers
export async function addTeacherAction(teacher: Teacher) {
  try {
    const newTeacher = await db.teacher.create({
      data: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        employeeId: teacher.employeeId,
        subjects: teacher.subjects,
        qualifications: teacher.qualifications,
        status: teacher.status,
        avatar: teacher.avatar,
        joinedAt: new Date(teacher.joinedAt),
        assignedClass: teacher.assignedClass,
        employeePassword: teacher.employeePassword,
      }
    })
    revalidatePath('/admin/teachers')
    return { success: true, data: newTeacher }
  } catch (error) {
    console.error('Failed to add teacher:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function removeTeacherAction(id: string) {
  try {
    await db.teacher.delete({
      where: { id }
    })
    revalidatePath('/admin/teachers')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove teacher:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

// Courses
export async function addCourseAction(course: Course) {
  try {
    const newCourse = await db.course.create({
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        teacherId: course.teacherId,
        teacherName: course.teacherName,
        capacity: course.capacity,
        enrolled: course.enrolled,
        status: course.status,
        schedule: course.schedule,
        duration: course.duration,
        startDate: new Date(course.startDate),
        endDate: new Date(course.endDate),
        roomNumber: course.roomNumber,
        thumbnail: course.thumbnail,
      }
    })
    revalidatePath('/admin/courses')
    return { success: true, data: newCourse }
  } catch (error) {
    console.error('Failed to add course:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function removeCourseAction(id: string) {
  try {
    await db.course.delete({
      where: { id }
    })
    revalidatePath('/admin/courses')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove course:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

// Schedules
export async function addScheduleAction(schedule: Schedule) {
  try {
    const newSchedule = await db.schedule.create({
      data: {
        id: schedule.id,
        classTitle: schedule.classTitle,
        teacherName: schedule.teacherName,
        timing: schedule.timing,
        roomNumber: schedule.roomNumber,
        days: schedule.days,
        slotId: schedule.slotId,
      }
    })
    revalidatePath('/admin/schedule')
    return { success: true, data: newSchedule }
  } catch (error) {
    console.error('Failed to add schedule:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}

export async function removeScheduleAction(id: string) {
  try {
    await db.schedule.delete({
      where: { id }
    })
    revalidatePath('/admin/schedule')
    return { success: true }
  } catch (error) {
    console.error('Failed to remove schedule:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Database error' }
  }
}
