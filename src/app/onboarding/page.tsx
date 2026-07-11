'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, UserCheck, AlertCircle } from 'lucide-react'

export default function OnboardingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [prn, setPrn] = useState('')
  const [department, setDepartment] = useState('')
  const [year, setYear] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already onboarded or not a student
  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated' || !session?.user) {
      router.push('/auth/signin')
      return
    }

    // Only students with null PRN need onboarding
    if (session.user.role !== 'STUDENT' || session.user.prn) {
      router.push(`/dashboard/${session.user.role.toLowerCase().replace('_', '-')}`)
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate PRN format (8 alphanumeric characters)
    const prnRegex = /^[A-Za-z0-9]{8}$/
    if (!prnRegex.test(prn)) {
      toast.error('PRN must be exactly 8 alphanumeric characters (e.g., 123A7009)')
      return
    }

    if (!department || !year) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prn, department, year }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Onboarding failed')
        return
      }

      toast.success('Profile updated successfully! Redirecting...')
      
      // Update session to reflect new PRN
      await update()
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard/student')
      }, 1000)
    } catch (error) {
      toast.error('Network error — please try again')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'STUDENT' || session.user.prn) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <CardTitle>Complete Your Profile</CardTitle>
          </div>
          <CardDescription>
            Please provide your student details to continue using the IoT Lab system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PRN Field */}
            <div className="space-y-2">
              <Label htmlFor="prn">
                PRN (Permanent Registration Number) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prn"
                value={prn}
                onChange={(e) => setPrn(e.target.value.toUpperCase())}
                placeholder="e.g., 123A7009"
                maxLength={8}
                required
                autoComplete="off"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                8 alphanumeric characters (found on your student ID card)
              </p>
            </div>

            {/* Department Field */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-destructive">*</span>
              </Label>
              <Select value={department} onValueChange={setDepartment} required>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Computer Engineering">Computer Engineering</SelectItem>
                  <SelectItem value="Information Technology">Information Technology</SelectItem>
                  <SelectItem value="Electronics Engineering">Electronics Engineering</SelectItem>
                  <SelectItem value="Electronics & Telecommunication">
                    Electronics & Telecommunication
                  </SelectItem>
                  <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                  <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Field */}
            <div className="space-y-2">
              <Label htmlFor="year">
                Academic Year <span className="text-destructive">*</span>
              </Label>
              <Select value={year} onValueChange={setYear} required>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FE">FE (First Year)</SelectItem>
                  <SelectItem value="SE">SE (Second Year)</SelectItem>
                  <SelectItem value="TE">TE (Third Year)</SelectItem>
                  <SelectItem value="BE">BE (Final Year)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Warning Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Verification Required</p>
                <p>
                  Your PRN will need to be verified by a Lab Assistant before you can issue
                  components. This is a one-time process.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Complete Profile
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
