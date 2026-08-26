import { Client } from 'pg'

const connectionString = "postgresql://neondb_owner:npg_Ck5ASZcOEI3m@ep-rapid-king-amp4tewt-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

const client = new Client({ connectionString })

async function run() {
  console.log("Connecting via pg Client...")
  try {
    await client.connect()
    console.log("PG CLIENT CONNECTED SUCCESSFULLY!")
    const res = await client.query("SELECT current_database(), current_user;")
    console.log("Query result:", res.rows)
    
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    console.log("Tables in public schema:", tables.rows.map(r => r.table_name))
  } catch (err: any) {
    console.error("PG CLIENT ERROR:", err.message, err.code, err.detail)
  } finally {
    await client.end()
  }
}

run()
