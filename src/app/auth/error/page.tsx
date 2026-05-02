'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration. Please contact your administrator.',
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in. Please ensure you are using a valid college email address.',
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or has already been used. Please try signing in again.',
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An error occurred during authentication. Please try again or contact support if the problem persists.',
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-base">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === 'AccessDenied' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Requirements:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Must use your college-issued Microsoft account</li>
                <li>• Email must end with the approved college domain</li>
                <li>• Account must be active and in good standing</li>
              </ul>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Link href="/auth/signin">
              <Button className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact your system administrator or IT support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}