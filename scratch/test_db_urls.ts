import { PrismaClient } from '@prisma/client';

async function testDbs() {
  const url1 = "postgresql://neondb_owner:npg_Ck5ASZcOEI3m@ep-rapid-king-amp4tewt-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const url2 = "postgresql://neondb_owner:npg_RgfXHC5sDt4B@ep-nameless-hat-ayt8ljjn.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require";

  console.log('Testing DB 1 (Primary - ep-rapid-king)...');
  const p1 = new PrismaClient({ datasources: { db: { url: url1 } } });
  console.time('DB1');
  try {
    const res1 = await p1.teacher.findMany({ take: 1 });
    console.timeEnd('DB1');
    console.log('DB1 success, count:', res1.length);
  } catch (e: any) {
    console.timeEnd('DB1');
    console.error('DB1 failed:', e.message);
  } finally {
    await p1.$disconnect();
  }

  console.log('\nTesting DB 2 (Secondary - ep-nameless-hat)...');
  const p2 = new PrismaClient({ datasources: { db: { url: url2 } } });
  console.time('DB2');
  try {
    const res2 = await p2.teacher.findMany({ take: 1 });
    console.timeEnd('DB2');
    console.log('DB2 success, count:', res2.length);
  } catch (e: any) {
    console.timeEnd('DB2');
    console.error('DB2 failed:', e.message);
  } finally {
    await p2.$disconnect();
  }
}

testDbs();
