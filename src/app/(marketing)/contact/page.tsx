import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Get in Touch
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground">Send us a message</h2>
            <form className="mt-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Name
                </label>
                <Input id="name" type="text" placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Email
                </label>
                <Input id="email" type="email" placeholder="you@example.com" className="mt-1" />
              </div>
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Organization
                </label>
                <Input id="organization" type="text" placeholder="Your institution" className="mt-1" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder="Tell us how we can help..."
                />
              </div>
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="mt-1 text-sm text-muted-foreground">support@labinventory.com</p>
                  <p className="mt-1 text-sm text-muted-foreground">sales@labinventory.com</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="mt-1 text-sm text-muted-foreground">+1 (555) 123-4567</p>
                  <p className="mt-1 text-xs text-gray-500">Mon-Fri 9am-6pm EST</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Office</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    123 Innovation Drive<br />
                    San Francisco, CA 94105<br />
                    United States
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
