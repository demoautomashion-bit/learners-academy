'use server'

import db from '@/lib/db'
import type { Course } from '@/lib/types'

export async function getCourses() {
  return db.course.findMany({ orderBy: { startDate: 'desc' } })
}

export async function addCourse(course: Omit<Course, 'enrolled'>) {
  return db.course.create({ 
    data: { 
      ...course, 
      enrolled: 0,
      startDate: new Date(course.startDate),
      endDate: new Date(course.endDate)
    } as any 
  })
}

export async function removeCourse(id: string) {
  return db.course.delete({ where: { id } })
}

export async function updateCourseStatus(id: string, status: string) {
  return db.course.update({ where: { id }, data: { status } })
}
