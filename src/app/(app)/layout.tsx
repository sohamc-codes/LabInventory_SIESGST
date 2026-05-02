import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { AIAssistant } from '@/components/features/ai-assistant'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background max-w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 w-full">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-3 sm:p-4 md:p-5 min-w-0">
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  )
}
