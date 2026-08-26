import { loginAction } from '../lib/actions/auth-actions';
import { getInitialData } from '../lib/actions/get-data';

async function comparePortals() {
  console.log('=== TESTING ADMIN ===');
  console.time('admin_login');
  try {
    const adminSession = await loginAction({ email: 'admin@learnersacademy.com', password: 'AdminSecure2026!', role: 'admin' });
    console.timeEnd('admin_login');
    console.time('admin_data');
    await getInitialData(adminSession.user.id, 'admin');
    console.timeEnd('admin_data');
  } catch (e) {
    console.error('Admin error:', e);
  }

  console.log('\n=== TESTING TEACHER ===');
  console.time('teacher_login');
  try {
    const teacherSession = await loginAction({ email: 'teacher@learnersacademy.com', password: 'Teacher123!', role: 'teacher' });
    console.timeEnd('teacher_login');
    console.time('teacher_data');
    await getInitialData(teacherSession.user.id, 'teacher');
    console.timeEnd('teacher_data');
  } catch (e) {
    console.error('Teacher error:', e);
  }
}

comparePortals();
