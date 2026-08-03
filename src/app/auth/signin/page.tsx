'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MicrosoftIcon } from '@/components/icons/microsoft'
import { Loader2, ArrowRight } from 'lucide-react'

const TechnicalIllustration = () => (
  <svg 
    className="w-full h-full stroke-white fill-none opacity-[0.07]" 
    viewBox="0 0 100 100" 
    strokeWidth="0.2" 
    preserveAspectRatio="xMaxYMid slice"
  >
    {/* Abstract PCB traces and Server Racks */}
    <path d="M-10,15 L15,15 L20,20 L40,20" />
    <path d="M-10,35 L20,35 L25,40 L60,40" />
    <path d="M-10,65 L30,65 L35,70 L80,70" />
    <path d="M-10,85 L15,85 L20,90 L45,90" />
    
    <rect x="40" y="5" width="50" height="25" rx="1" />
    <circle cx="45" cy="17.5" r="1.5" />
    <circle cx="50" cy="17.5" r="1.5" />
    <line x1="55" y1="17.5" x2="85" y2="17.5" />
    
    <rect x="60" y="32" width="40" height="20" rx="1" />
    <circle cx="65" cy="42" r="1.5" />
    <line x1="72" y1="42" x2="95" y2="42" />

    <rect x="80" y="55" width="25" height="35" rx="1" />
    <circle cx="85" cy="65" r="1.5" />
    <line x1="90" y1="65" x2="100" y2="65" />
    <line x1="85" y1="75" x2="100" y2="75" />
    <line x1="85" y1="85" x2="100" y2="85" />

    <rect x="20" y="19" width="1.5" height="1.5" />
    <rect x="25" y="39" width="1.5" height="1.5" />
    <rect x="35" y="69" width="1.5" height="1.5" />
    <rect x="20" y="89" width="1.5" height="1.5" />
  </svg>
)

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [authMode, setAuthMode] = useState<'microsoft' | 'credentials'>('microsoft')
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const message = searchParams.get('message')
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    setMounted(true)
  }, [])

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
        setError('Invalid credentials.')
      } else if (result?.ok) {
        router.refresh()
      }
    } catch (err) {
      setError('System error. Please try again.')
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
      setError('Microsoft authentication failed.')
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-[#050505] flex text-zinc-100 font-sans selection:bg-white selection:text-black relative">
      
      {/* ── Left Side: Pure Typography / Editorial ──────────────── */}
      <div className="hidden lg:flex w-[55%] relative border-r border-zinc-800 p-12 flex-col justify-between overflow-hidden bg-[#050505]">
        
        {/* Engineering Grid (8px base, 40px major) */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:8px_8px] opacity-[0.02]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.05]" />
        </div>

        {/* Technical Illustration */}
        <div className="absolute inset-y-0 right-0 w-[80%] z-0 pointer-events-none">
          <TechnicalIllustration />
        </div>
        
        <div className="relative z-10 mb-12 inline-block">
          <Image 
            src="/sies_logo_footer-D-Lnp3GI.png" 
            alt="SIES GST Logo" 
            width={400} 
            height={140} 
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <div className="relative z-10 mb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <h1 className="text-[5rem] xl:text-[6.5rem] font-bold leading-[0.9] tracking-tighter text-white mb-6">
              Lab<br/>
              Inventory.
            </h1>
            <p className="max-w-md text-zinc-400 text-lg leading-relaxed font-light">
              Manage laboratory assets, equipment checkout, maintenance, and availability from a single platform.
            </p>
          </motion.div>
        </div>

        <div />
      </div>

      {/* ── Right Side: Functional Form ─────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-12 relative bg-[#050505]">
        
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
          >
            <div className="mb-12 lg:hidden flex justify-center">
              <Image 
                src="/sies_logo_footer-D-Lnp3GI.png" 
                alt="SIES GST Logo" 
                width={300} 
                height={100} 
                className="h-16 w-auto object-contain"
                priority
              />
            </div>

            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-8 shadow-sm">
              <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Sign In</h2>
              <p className="text-sm text-zinc-400 mb-8">
                {authMode === 'microsoft' 
                  ? 'Use your university account to continue.' 
                  : 'Enter your administrative credentials.'}
              </p>

              <AnimatePresence mode="wait">
                {/* Error/Message Banners */}
                {message && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mb-6 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300">
                    {message}
                  </motion.div>
                )}
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="mb-6 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-sm text-red-400">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="min-h-[180px]">
                <AnimatePresence mode="wait">
                  {authMode === 'microsoft' ? (
                    <motion.div 
                      key="microsoft"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      <Button
                        onClick={handleMicrosoftSignIn}
                        disabled={isLoading}
                        className="w-full h-11 bg-white hover:bg-zinc-200 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] text-black font-medium rounded-lg transition-all duration-200"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                        ) : (
                          <MicrosoftIcon className="mr-2 h-5 w-5" />
                        )}
                        {isLoading ? 'Processing...' : 'Continue with Microsoft'}
                      </Button>
                      
                      <button
                        onClick={() => setAuthMode('credentials')}
                        className="w-full text-left text-sm text-zinc-500 hover:text-white transition-colors duration-200 group flex items-center justify-between py-2 border-b border-transparent hover:border-zinc-700"
                      >
                        <span>Admin Login</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="credentials"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <form onSubmit={handleCredentialsSignIn} className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@siesgst.ac.in"
                            className="h-11 bg-transparent border-zinc-800 focus:border-zinc-500 focus:ring-0 rounded-lg text-white placeholder:text-zinc-600 transition-colors duration-200"
                            required
                            autoFocus
                          />
                        </div>

                        <div className="space-y-1.5 pb-2">
                          <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Password
                          </label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="h-11 bg-transparent border-zinc-800 focus:border-zinc-500 focus:ring-0 rounded-lg text-white placeholder:text-zinc-600 transition-colors duration-200"
                            required
                          />
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full h-11 bg-white hover:bg-zinc-200 focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] text-black font-medium rounded-lg transition-all duration-200"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                        </Button>
                      </form>

                      <button
                        onClick={() => {
                          setAuthMode('microsoft')
                          setError('')
                          setEmail('')
                          setPassword('')
                        }}
                        className="w-full text-left text-sm text-zinc-500 hover:text-white transition-colors duration-200 group flex items-center gap-2 py-4 mt-2"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span>Back to Student Login</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
    </div>
  )
}
