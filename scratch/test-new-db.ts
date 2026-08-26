import { PrismaClient } from '@prisma/client'

const newUrl = "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: newUrl
    }
  }
})

async function check() {
  console.log("Testing connection to NEW Neon DB...")
  try {
    const res = await prisma.$queryRaw`SELECT 1 as connected;`
    console.log("SUCCESS! Connected to new Neon DB:", res)
  } catch (err: any) {
    console.error("ERROR connecting to new Neon DB:", err.message || err)
  } finally {
    await prisma.$disconnect()
  }
}

check()
