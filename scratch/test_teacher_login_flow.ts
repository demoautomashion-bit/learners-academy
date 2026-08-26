import { loginAction } from '../lib/actions/auth-actions';
import { getInitialData } from '../lib/actions/get-data';
import { getTeacherAudioFiles } from '../lib/actions/audio';

async function testTeacherFlow() {
  console.log('--- Step 1: Login ---');
  console.time('loginAction');
  const session = await loginAction({ email: 'teacher@learnersacademy.com', password: 'Teacher123!', role: 'teacher' });
  console.timeEnd('loginAction');
  console.log('Logged in user:', session.user);

  console.log('\n--- Step 2: Data Refresh ---');
  console.time('getInitialData');
  const initRes = await getInitialData(session.user.id, session.user.role as any);
  console.timeEnd('getInitialData');
  console.log('initRes success:', initRes.success);

  console.time('getTeacherAudioFiles');
  const audioRes = await getTeacherAudioFiles(session.user.id);
  console.timeEnd('getTeacherAudioFiles');
  console.log('audioRes success:', audioRes.success);
}

testTeacherFlow();
