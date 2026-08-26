import { loginAction } from '../lib/actions/auth-actions';
import { getInitialData } from '../lib/actions/get-data';
import { getTeacherAudioFiles } from '../lib/actions/audio';

async function testRealTeacher() {
  console.log('--- Step 1: Real Teacher Login (marzia@tla.com) ---');
  console.time('login_real');
  const session = await loginAction({ email: 'marzia@tla.com', password: 'marzia@Tla1', role: 'teacher' });
  console.timeEnd('login_real');
  console.log('Real Teacher User ID:', session.user.id, session.user.name);

  console.log('\n--- Step 2: Data Sync for Real Teacher ---');
  console.time('data_real');
  const initRes = await getInitialData(session.user.id, session.user.role as any);
  console.timeEnd('data_real');
  console.log('initRes success:', initRes.success);

  console.time('audio_real');
  const audioRes = await getTeacherAudioFiles(session.user.id);
  console.timeEnd('audio_real');
  console.log('audioRes count:', audioRes.data?.length);

  process.exit(0);
}

testRealTeacher();
