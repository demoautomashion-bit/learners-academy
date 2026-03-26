import db from './lib/db.js'

async function test() {
  try {
    console.log('Testing DB connection...')
    const count = await db.teacher.count()
    console.log('Success! Teacher count:', count)
    process.exit(0)
  } catch (err) {
    console.error('DB Connection Failed:', err)
    process.exit(1)
  }
}

test()
