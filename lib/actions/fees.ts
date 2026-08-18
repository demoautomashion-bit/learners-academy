'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '../types'

export async function getFeePayments(): Promise<ActionResult<any[]>> {
  try {
    const data = await db.feePayment.findMany({
      include: {
        student: true,
        course: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return { success: true, data }
  } catch (error) {
    console.error('DATABASE_ERROR [getFeePayments]:', error)
    return { success: false, error: 'Failed to fetch fee registry' }
  }
}

export async function recordPayment(paymentId: string, amount: number): Promise<ActionResult> {
  try {
    const current = await db.feePayment.findUnique({
      where: { id: paymentId }
    })
    if (!current) return { success: false, error: 'Payment record not found' }

    const newAmount = current.amountPaid + amount
    const netDue = current.totalAmount - (current.discount || 0)
    const status = newAmount >= netDue ? 'Paid' : newAmount > 0 ? 'Partial' : 'Unpaid'

    const result = await db.feePayment.update({
      where: { id: paymentId },
      data: {
        amountPaid: newAmount,
        status,
        paymentDate: new Date()
      }
    })
    
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [recordPayment]:', error)
    return { success: false, error: 'Failed to record student payment' }
  }
}

export async function addFeeAccount(data: { studentId: string, courseId: string, totalAmount: number, discount: number, initialDeposit: number, amountPaid?: number }): Promise<ActionResult> {
  try {
    const netDue = data.totalAmount - data.discount
    const paid = data.amountPaid !== undefined ? data.amountPaid : data.initialDeposit
    const status = paid >= netDue ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'
    
    // Attempt to find existing record for upsert
    const existing = await db.feePayment.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.studentId,
          courseId: data.courseId
        }
      }
    })

    let result;
    if (existing) {
      result = await db.feePayment.update({
        where: { id: existing.id },
        data: {
          totalAmount: data.totalAmount,
          discount: data.discount,
          amountPaid: paid,
          status,
          paymentDate: paid > (existing.amountPaid || 0) ? new Date() : existing.paymentDate
        }
      })
    } else {
      result = await db.feePayment.create({
        data: {
          studentId: data.studentId,
          courseId: data.courseId,
          totalAmount: data.totalAmount,
          discount: data.discount,
          amountPaid: paid,
          status,
          paymentDate: paid > 0 ? new Date() : null
        }
      })
    }

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [addFeeAccount]:', error)
    return { success: false, error: 'Failed to synchronize student fee account' }
  }
}


export async function updateClassFee(courseId: string, feeAmount: number): Promise<ActionResult> {
  try {
    const result = await db.course.update({
      where: { id: courseId },
      data: { feeAmount }
    })

    // Sync existing FeePayment records for this course
    const existingPayments = await db.feePayment.findMany({
      where: { courseId }
    })

    for (const payment of existingPayments) {
      const netDue = feeAmount - (payment.discount || 0)
      const status = payment.amountPaid >= netDue ? 'Paid' : payment.amountPaid > 0 ? 'Partial' : 'Unpaid'
      
      await db.feePayment.update({
        where: { id: payment.id },
        data: {
          totalAmount: feeAmount,
          status
        }
      })
    }

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateClassFee]:', error)
    return { success: false, error: 'Failed to update class tuition fee' }
  }
}

export async function deleteAllFeePayments(startDate?: Date, endDate?: Date): Promise<ActionResult> {
  try {
    if (startDate && endDate) {
      // Delete only payments whose paymentDate falls within the selected term.
      // Records with paymentDate = null (unpaid, never paid) are intentionally preserved.
      await db.feePayment.deleteMany({
        where: {
          paymentDate: {
            gte: startDate,
            lte: endDate,
          }
        }
      })
    } else {
      // No range provided — full wipe (used only from system-level reset)
      await db.feePayment.deleteMany({})
    }
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('DATABASE_ERROR [deleteAllFeePayments]:', error)
    return { success: false, error: 'Failed to clear fee logs' }
  }
}
