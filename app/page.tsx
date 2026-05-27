import { redirect } from 'next/navigation'

// Root route: proxy.ts handles logged-in users → /dashboard.
// Logged-out users hitting / see the login page.
export default function Home() {
  redirect('/login')
}
