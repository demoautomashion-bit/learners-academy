import { loginAction } from '../lib/actions/auth-actions';
import { getInitialData } from '../lib/actions/get-data';

async function testPerformance() {
  console.time('loginAction');
  try {
    const session = await loginAction({ email: 'teacher@learnersacademy.com', password: 'Teacher123!', role: 'teacher' });
    console.timeEnd('loginAction');
    console.log('Login result user:', session.user.id, session.user.name, session.user.role);

    console.time('getInitialData');
    const data = await getInitialData(session.user.id, 'teacher');
    console.timeEnd('getInitialData');
    console.log('getInitialData success:', data.success);
    if (data.data) {
      console.log('Teachers count:', data.data.teachers.length);
      console.log('Students count:', data.data.students.length);
      console.log('Courses count:', data.data.courses.length);
      console.log('Submissions count:', data.data.submissions.length);
      console.log('Questions count:', data.data.questions.length);
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

testPerformance();
