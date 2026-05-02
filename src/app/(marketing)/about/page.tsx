import { Card } from '@/components/ui/card'
import { Users, Target, Award, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About LabInventory
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We're on a mission to modernize inventory management for educational institutions worldwide
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ValueCard
              icon={<Target className="h-6 w-6" />}
              title="Our Mission"
              description="To empower educational institutions with intelligent inventory management tools that save time, reduce waste, and enhance the learning experience."
            />
            <ValueCard
              icon={<Users className="h-6 w-6" />}
              title="Our Team"
              description="A diverse group of educators, engineers, and designers passionate about improving lab management through technology."
            />
            <ValueCard
              icon={<Award className="h-6 w-6" />}
              title="Our Values"
              description="Innovation, reliability, and user-centric design guide everything we build. We believe in creating tools that just work."
            />
            <ValueCard
              icon={<Heart className="h-6 w-6" />}
              title="Our Commitment"
              description="We're committed to continuous improvement, responsive support, and building features that truly matter to our users."
            />
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              LabInventory was born from a simple observation: managing IoT components and lab equipment shouldn't be complicated. After witnessing countless hours wasted on manual tracking, lost components, and inefficient approval processes, we knew there had to be a better way.
            </p>
            <p>
              We started by talking to lab managers, students, and faculty members across dozens of institutions. Their feedback shaped every feature we built—from QR code scanning to AI-powered recommendations.
            </p>
            <p>
              Today, LabInventory serves hundreds of educational institutions worldwide, helping them manage millions of components efficiently. But we're just getting started.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </Card>
  )
}
