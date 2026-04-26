'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '../types'

export async function getPayrollStats(month: string, year: number): Promise<ActionResult> {
    try {
        const teachers = await db.teacher.findMany({ where: { status: 'active' } })
        const records = await db.payrollRecord.findMany({
            where: { month, year }
        })

        const totalLiability = teachers.reduce((acc, t) => acc + (t.salary || 0), 0)
        const distributed = records.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0)
        const pendingCount = teachers.length - records.filter(r => r.status === 'Paid').length

        return {
            success: true,
            data: {
                totalLiability,
                distributed,
                pendingCount,
                totalStaff: teachers.length
            }
        }
    } catch (error) {
        console.error('PAYROLL_STATS_ERROR:', error)
        return { success: false, error: 'Failed to fetch payroll intelligence' }
    }
}

export async function getMonthlyPayrollList(month: string, year: number): Promise<ActionResult> {
    try {
        const teachers = await db.teacher.findMany({ 
            where: { status: 'active' },
            include: {
                payrollRecords: {
                    where: { month, year }
                },
                attendance: {
                    where: {
                        date: {
                            gte: new Date(year, getMonthIndex(month), 1),
                            lt: new Date(year, getMonthIndex(month) + 1, 1)
                        }
                    }
                }
            }
        })

        return {
            success: true,
            data: teachers.map(t => ({
                id: t.id,
                name: t.name,
                employeeId: t.employeeId,
                avatar: t.avatar,
                baseSalary: t.salary || 0,
                record: t.payrollRecords[0] || null,
                absentCount: t.attendance.filter(a => a.status === 'Absent').length
            }))
        }
    } catch (error) {
        console.error('PAYROLL_LIST_ERROR:', error)
        return { success: false, error: 'Failed to synchronize staff payroll ledger' }
    }
}

export async function processPayroll(data: {
    teacherId: string,
    month: string,
    year: number,
    amount: number,
    bonus?: number,
    deductions?: number,
    note?: string
}): Promise<ActionResult> {
    try {
        const { teacherId, month, year, amount, bonus = 0, deductions = 0 } = data

        const result = await db.$transaction(async (tx) => {
            // 1. Create/Update Payroll Record
            const record = await tx.payrollRecord.upsert({
                where: {
                    teacherId_month_year: { teacherId, month, year }
                },
                update: {
                    amount,
                    bonus,
                    deductions,
                    status: 'Paid',
                    paidAt: new Date()
                },
                create: {
                    teacherId,
                    month,
                    year,
                    amount,
                    bonus,
                    deductions,
                    status: 'Paid',
                    paidAt: new Date()
                },
                include: { teacher: true }
            })

            // 2. Create Institutional Expenditure
            await tx.expenditure.create({
                data: {
                    amount: amount + bonus - deductions,
                    category: 'Salary',
                    description: `Payroll disbursement for ${record.teacher.name} (${month} ${year})`,
                    date: new Date()
                }
            })

            return record
        })

        revalidatePath('/admin/teachers/payroll')
        revalidatePath('/admin/economics')
        
        return { success: true, data: result }
    } catch (error) {
        console.error('PAYROLL_PROCESS_ERROR:', error)
        return { success: false, error: 'Payroll disbursement protocol failed' }
    }
}

function getMonthIndex(month: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months.indexOf(month)
}
