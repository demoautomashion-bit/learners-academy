import db from '../lib/db';

async function checkTeachers() {
  const teachers = await db.teacher.findMany();
  console.log('Real DB Teachers count:', teachers.length);
  teachers.forEach(t => {
    console.log(`- ID: ${t.id} | Name: ${t.name} | Email: ${t.email} | Pass: ${t.employeePassword}`);
  });
  process.exit(0);
}

checkTeachers();
