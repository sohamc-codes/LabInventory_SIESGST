'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ArrowRight, Building2 } from 'lucide-react'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'starter'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organizationName: '',
    organizationSlug: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, plan }),
      })

      if (response.ok) {
        router.push('/auth/signin?message=Account created successfully')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create account')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setFormData({ ...formData, organizationName: name, organizationSlug: slug })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start managing your lab inventory in minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Your Name
            </label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Organization Name
            </label>
            <Input
              id="organization"
              type="text"
              required
              value={formData.organizationName}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="Acme University"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              Organization URL
            </label>
            <div className="mt-1 flex items-center">
              <span className="text-sm text-gray-500">labinventory.com/</span>
              <Input
                id="slug"
                type="text"
                required
                value={formData.organizationSlug}
                onChange={(e) => setFormData({ ...formData, organizationSlug: e.target.value })}
                placeholder="acme-university"
                className="ml-1"
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {plan === 'starter' && '✓ Free Plan - 500 components, 50 users'}
              {plan === 'pro' && '✓ Professional Plan - 5,000 components, 500 users'}
              {plan === 'enterprise' && '✓ Enterprise Plan - Unlimited everything'}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline">Terms</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>
          </p>
        </form>
      </Card>
    </div>
  )
}
