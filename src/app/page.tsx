import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function HomePage() {
  const session = await auth()

  // If logged in, redirect to app
  if (session) {
    switch (session.user.role) {
      case 'STUDENT':
        redirect('/dashboard/student')
      case 'LAB_ASSISTANT':
        redirect('/dashboard/lab-assistant')
      case 'HOD':
        redirect('/dashboard/hod')
      case 'ADMIN':
        redirect('/dashboard/admin')
      default:
        redirect('/dashboard/student')
    }
  }

  // Show marketing landing page
  redirect('/landing')
}