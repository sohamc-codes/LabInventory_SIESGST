'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MicrosoftIcon } from '@/components/icons/microsoft'
import {
  Loader2,
  ShieldCheck,
  Users,
  BarChart3,
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  Package,
  ArrowLeft,
} from 'lucide-react'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState<'microsoft' | 'credentials'>('microsoft')

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const message = searchParams.get('message')
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const userRole = session.user?.role?.toLowerCase().replace('_', '-') || 'student'
      router.push(`/dashboard/${userRole}`)
    }
  }, [session, status, router])

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const result = await signIn('credentials', { 
        email, 
        password, 
        redirect: false,
        callbackUrl 
      })
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        // Successful login - NextAuth will handle the redirect
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMicrosoftSignIn = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await signIn('microsoft-entra-id', { callbackUrl })
    } catch (err) {
      setError('Failed to initiate Microsoft sign-in. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

        {/* ── Left — Branding ──────────────────────────────── */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-zinc-100">IoT Parts Management</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 leading-tight">
              Streamline your<br />lab operations
            </h1>
            <p className="text-zinc-400 leading-relaxed">
              Enterprise-grade inventory management designed for educational institutions.
              Track components, manage requests, and gain real-time visibility.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                icon: ShieldCheck,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                title: 'Secure & Compliant',
                desc: 'Role-based access control with comprehensive audit trails',
              },
              {
                icon: Users,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                title: 'Multi-Role Support',
                desc: 'Students, Lab Assistants, and HODs with tailored workflows',
              },
              {
                icon: BarChart3,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                title: 'Real-time Analytics',
                desc: 'Comprehensive dashboards and audit trails for full visibility',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">{item.title}</h3>
                  <p className="text-sm text-zinc-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Sign-in card ──────────────────────────── */}
        <div>
          <Card className="border-zinc-800/60 bg-zinc-900/80 backdrop-blur-sm shadow-2xl shadow-black/40">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-600/15 border border-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>
                {authMode === 'microsoft' 
                  ? 'Sign in with your college Microsoft account'
                  : 'Lab Assistant / Staff Login'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Message banner */}
              {message && (
                <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  <p className="text-sm text-blue-300">{message}</p>
                </div>
              )}

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {authMode === 'microsoft' ? (
                <>
                  {/* Microsoft SSO Button */}
                  <Button
                    onClick={handleMicrosoftSignIn}
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <MicrosoftIcon className="mr-2 h-5 w-5" />
                        Sign in with Microsoft
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-zinc-900 px-2 text-zinc-500">For Students & HODs</span>
                    </div>
                  </div>

                  {/* Toggle to Staff Login */}
                  <div className="text-center">
                    <button
                      onClick={() => setAuthMode('credentials')}
                      className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors underline-offset-4 hover:underline"
                    >
                      Lab Assistant / Staff Login →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Credentials Form */}
                  <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="pl-10 h-11"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="pl-10 pr-10 h-11"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading} 
                      className="w-full h-11"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-zinc-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-zinc-900 px-2 text-zinc-500">Staff Access Only</span>
                    </div>
                  </div>

                  {/* Back to Student Login */}
                  <div className="text-center">
                    <button
                      onClick={() => {
                        setAuthMode('microsoft')
                        setError('')
                        setEmail('')
                        setPassword('')
                      }}
                      className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Student Login
                    </button>
                  </div>
                </>
              )}

              <p className="text-xs text-zinc-600 text-center pt-2">
                By signing in, you agree to our terms of service and privacy policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
