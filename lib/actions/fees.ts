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
    const status = newAmount >= current.totalAmount ? 'Paid' : newAmount > 0 ? 'Partial' : 'Unpaid'

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

export async function addFeeAccount(data: { studentId: string, courseId: string, totalAmount: number, initialDeposit: number }): Promise<ActionResult> {
  try {
    const status = data.initialDeposit >= data.totalAmount ? 'Paid' : data.initialDeposit > 0 ? 'Partial' : 'Unpaid'
    const result = await db.feePayment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        totalAmount: data.totalAmount,
        amountPaid: data.initialDeposit,
        status,
        paymentDate: data.initialDeposit > 0 ? new Date() : null
      }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [addFeeAccount]:', error)
    return { success: false, error: 'Failed to initialize student fee account' }
  }
}

export async function updateClassFee(courseId: string, feeAmount: number): Promise<ActionResult> {
  try {
    const result = await db.course.update({
      where: { id: courseId },
      data: { feeAmount }
    })
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [updateClassFee]:', error)
    return { success: false, error: 'Failed to update class tuition fee' }
  }
}
