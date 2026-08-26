import { loginAction } from '../lib/actions/auth-actions'

async function testLogin() {
  console.log("=== TESTING PORTAL LOGIN ACTIONS AGAINST NEW NEON DB ===")
  try {
    const adminSession = await loginAction({ email: 'admin@learnersacademy.com', password: 'AdminSecure2026!', role: 'admin' })
    console.log("✓ Admin Login SUCCESS:", adminSession.user.name, "(Role:", adminSession.user.role + ")")

    const teacherSession = await loginAction({ email: 'teacher@learnersacademy.com', password: 'Teacher123!', role: 'teacher' })
    console.log("✓ Teacher Login SUCCESS:", teacherSession.user.name, "(Role:", teacherSession.user.role + ")")

    const studentSession = await loginAction({ email: 'student@learnersacademy.com', password: 'Student123!', role: 'student' })
    console.log("✓ Student Login SUCCESS:", studentSession.user.name, "(Role:", studentSession.user.role + ")")
    console.log("=== ALL PORTALS VERIFIED WORKING 100% ===")
  } catch (err: any) {
    console.error("❌ Login Error:", err.message || err)
  }
}

testLogin()
