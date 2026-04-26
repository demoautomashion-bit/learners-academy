'use server'

import db from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { ActionResult } from '../types'

export async function getPayrollStats(month: string, year: number): Promise<ActionResult> {
    try {
        console.time('db-stats-query')
        const teachers = await db.teacher.findMany({ where: { status: 'active' } })
        const records = await db.payrollRecord.findMany({
            where: { month, year }
        })
        console.timeEnd('db-stats-query')

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
        console.time('db-staff-list-query')
        const [teachers, students] = await Promise.all([
            db.teacher.findMany({ 
                where: { status: 'active' },
                include: {
                    payrollRecords: {
                        where: { month, year }
                    },
                    courses: {
                        where: { status: 'active' }
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
            }),
            db.student.findMany({ where: { status: 'active' } })
        ])
        console.timeEnd('db-staff-list-query')

        return {
            success: true,
            data: teachers.map(t => {
                const teacherCourseIds = t.courses.map(c => c.id)
                // Count students who have any of this teacher's courses in their enrolledCourses list
                const enrolledStudents = students.filter(s => 
                    s.enrolledCourses.some(id => teacherCourseIds.includes(id))
                )
                
                const totalStudents = enrolledStudents.length
                const totalRevenue = t.courses.reduce((acc, c) => {
                    const studentCountInCourse = enrolledStudents.filter(s => s.enrolledCourses.includes(c.id)).length
                    return acc + (studentCountInCourse * (c.feeAmount || 0))
                }, 0)
                
                return {
                    id: t.id,
                    name: t.name,
                    employeeId: t.employeeId,
                    avatar: t.avatar,
                    baseSalary: t.salary || 0,
                    commissionRate: t.commissionRate || 0.2,
                    totalStudents,
                    totalRevenue,
                    courses: t.courses.map(c => ({ 
                        title: c.title, 
                        enrolled: enrolledStudents.filter(s => s.enrolledCourses.includes(c.id)).length 
                    })),
                    record: t.payrollRecords[0] || null,
                    absentCount: t.attendance.filter(a => a.status === 'Absent').length
                }
            })
        }
    } catch (error: any) {
        console.error('PAYROLL_LIST_ERROR:', error)
        return { success: false, error: `Staff registry sync failed: ${error?.message || 'Internal DB Error'}` }
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
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    const index = months.indexOf(month.toLowerCase())
    return index === -1 ? 0 : index // Fallback to January if invalid
}
