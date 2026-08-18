'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addTimeSlot(data: { startTime: string, endTime: string, label?: string }) {
  try {
    const slot = await db.timeSlot.create({
      data: {
        startTime: data.startTime,
        endTime: data.endTime,
        label: data.label
      }
    })
    revalidatePath('/admin')
    return { success: true, data: slot }
  } catch (error) {
    console.error('Failed to create time slot:', error)
    return { success: false, error: 'Could not create time slot' }
  }
}

export async function removeTimeSlot(id: string) {
  try {
    // Unset timeSlotId and clear timing string for courses mapped to this slot
    await db.course.updateMany({
      where: { timeSlotId: id },
      data: { timeSlotId: null, timing: "" }
    })
    
    await db.timeSlot.delete({
      where: { id }
    })
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete time slot:', error)
    return { success: false, error: 'Could not delete time slot' }
  }
}

export async function addCourseToSlot(courseId: string, slotId: string) {
  try {
    // If we bind to a time slot, sync its timing string
    const slot = await db.timeSlot.findUnique({ where: { id: slotId } })
    
    const timeString = slot ? `${slot.startTime} - ${slot.endTime}` : ''

    const course = await db.course.update({
      where: { id: courseId },
      data: { 
        timeSlotId: slotId,
        timing: slot ? timeString : undefined 
      }
    })
    revalidatePath('/admin')
    return { success: true, data: course }
  } catch (error) {
    console.error('Failed to assign course to slot:', error)
    return { success: false, error: 'Could not assign course to slot' }
  }
}

export async function removeCourseFromSlot(courseId: string) {
  try {
    const course = await db.course.update({
      where: { id: courseId },
      data: { timeSlotId: null, timing: "" }
    })
    revalidatePath('/admin')
    return { success: true, data: course }
  } catch (error) {
    console.error('Failed to remove course from slot:', error)
    return { success: false, error: 'Could not remove course from slot' }
  }
}

export async function deleteAllTimeSlots() {
  try {
    await db.$transaction([
      db.course.updateMany({ data: { timeSlotId: null } }),
      db.timeSlot.deleteMany({})
    ])
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete all time slots:', error)
    return { success: false, error: 'Could not delete all time slots' }
  }
}
