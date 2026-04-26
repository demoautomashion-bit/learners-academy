import { getPayrollStats, getMonthlyPayrollList } from './lib/actions/payroll'

async function diagnostic() {
    console.log('--- PAYROLL DIAGNOSTIC START ---')
    const month = 'April'
    const year = 2026
    
    console.log(`Testing with: ${month} ${year}`)
    
    try {
        console.log('Testing getPayrollStats...')
        const stats = await getPayrollStats(month, year)
        console.log('Stats Result:', stats)
        
        console.log('Testing getMonthlyPayrollList...')
        const list = await getMonthlyPayrollList(month, year)
        console.log('List Result Success:', list.success)
        if (list.data) {
            console.log(`Found ${list.data.length} staff members.`)
        }
    } catch (err) {
        console.error('DIAGNOSTIC CRITICAL FAILURE:', err)
    }
    console.log('--- PAYROLL DIAGNOSTIC END ---')
}

diagnostic()
