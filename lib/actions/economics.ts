'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getEconomicStats() {
  try {
    const expenditures = await db.expenditure.findMany({ orderBy: { date: 'desc' } })
    const feePayments = await db.feePayment.findMany({ include: { student: true, course: true } })

    const totalExpenditure = expenditures.reduce((acc, exp) => acc + exp.amount, 0)
    const actualRevenue = feePayments.reduce((acc, pay) => acc + pay.amountPaid, 0)
    const projectedRevenue = feePayments.reduce((acc, pay) => acc + pay.totalAmount, 0)

    // Category breakdown
    const categoryBreakdown = expenditures.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    return {
      totalExpenditure,
      actualRevenue,
      projectedRevenue,
      categoryBreakdown,
      expenditures,
      feePayments
    }
  } catch (error) {
    console.error('DATABASE_ERROR [getEconomicStats]:', error)
    throw new Error('Failed to fetch institutional economics')
  }
}

export async function addExpenditure(data: { amount: number, category: string, description: string, date?: Date }) {
  try {
    const result = await db.expenditure.create({
      data: {
        amount: data.amount,
        category: data.category,
        description: data.description,
        date: data.date || new Date()
      }
    })
    revalidatePath('/')
    return result
  } catch (error) {
    console.error('DATABASE_ERROR [addExpenditure]:', error)
    throw new Error('Failed to record expenditure')
  }
}
