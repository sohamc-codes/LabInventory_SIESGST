import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-center text-sm text-muted-foreground">
            This page is restricted to authorized users only. If you believe this is an error, please contact your administrator.
          </p>
          <Button asChild className="w-full">
            <Link href="/">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
