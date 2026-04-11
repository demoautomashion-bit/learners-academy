'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '../types'

export async function getEconomicStats(): Promise<ActionResult> {
  try {
    const expenditures = await db.expenditure.findMany({ orderBy: { date: 'desc' } })
    const feePayments = await db.feePayment.findMany({ include: { student: true, course: true } })

    const totalExpenditure = expenditures.reduce((acc, exp) => acc + exp.amount, 0)
    const actualRevenue = feePayments.reduce((acc, pay) => acc + pay.amountPaid, 0)
    const projectedRevenue = feePayments.reduce((acc, pay) => acc + pay.totalAmount, 0)
    
    // Automation: Calculate Payroll Liabilities
    const activeTeachers = await db.teacher.findMany({ where: { status: 'active' } })
    const totalPayroll = activeTeachers.reduce((acc, t: any) => acc + (t.salary || 0), 0)
    
    // The "Bottom Line"
    const netMargin = actualRevenue - totalExpenditure

    // Category breakdown
    const categoryBreakdown = expenditures.reduce((acc: any, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    // Historical Trend (Last 6 months)
    const now = new Date()
    const historicalData = Array.from({ length: 6 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthYear = monthDate.getFullYear()
      const month = monthDate.getMonth()
      
      const monthExp = expenditures
        .filter(exp => {
          const d = new Date(exp.date)
          return d.getFullYear() === monthYear && d.getMonth() === month
        })
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        expenditure: monthExp
      }
    })

    // Unified Transaction Stream (Combine Expenditures and Paid Fees)
    const transactions = [
      ...expenditures.map(e => ({
        id: e.id,
        amount: e.amount,
        type: 'Debit' as const,
        category: e.category,
        description: e.description,
        date: e.date,
        person: 'Institutional Outflow'
      })),
      ...feePayments
        .filter(pay => pay && pay.amountPaid > 0 && pay.student && pay.course)
        .map(pay => ({
          id: pay.id,
          amount: pay.amountPaid,
          type: 'Credit' as const,
          category: 'Tuition Fee',
          description: `Fee Payment for ${pay.course?.title || 'Unknown Class'}`,
          date: pay.paymentDate || pay.updatedAt,
          person: pay.student?.name || 'Anonymous Student'
        }))
    ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Growth Metrics: New enrollments last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const students = await db.student.findMany({
      where: {
        enrolledAt: { gte: thirtyDaysAgo }
      }
    })
    const newEnrollments = students.length

    return {
      success: true,
      data: {
        totalExpenditure,
        actualRevenue,
        projectedRevenue,
        totalPayroll,
        netMargin,
        newEnrollments,
        categoryBreakdown,
        historicalData,
        expenditures,
        feePayments,
        transactions
      }
    }
  } catch (error) {
    console.error('DATABASE_ERROR [getEconomicStats]:', error)
    return { success: false, error: 'Institutional fiscal transparency layer failed' }
  }
}

export async function addExpenditure(data: { amount: number, category: string, description: string, date?: Date }): Promise<ActionResult> {
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
    return { success: true, data: result }
  } catch (error) {
    console.error('DATABASE_ERROR [addExpenditure]:', error)
    return { success: false, error: 'Fiscal record creation failed' }
  }
}
