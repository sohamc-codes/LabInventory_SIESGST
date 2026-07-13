'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export function PartsIssuedClient() {
  const prnRef = useRef<HTMLInputElement>(null)
  const [prn, setPrn] = useState('')
  const [student, setStudent] = useState<any>(null)
  const [issuedParts, setIssuedParts] = useState<any[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [returningId, setReturningId] = useState<string | null>(null)

  useEffect(() => {
    prnRef.current?.focus()
  }, [])

  const lookupByPrn = async (e: FormEvent) => {
    e.preventDefault()
    if (!prn.trim()) return
    const studentRes = await fetch('/api/scanner/student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prn: prn.trim() }),
    })
    const studentData = await studentRes.json()
    if (!studentRes.ok) {
      toast.error(studentData.error || 'Student not found')
      return
    }
    setStudent(studentData.student)

    const partsRes = await fetch(`/api/parts-issued?prn=${encodeURIComponent(prn.trim())}`)
    const partsData = await partsRes.json()
    setIssuedParts(partsData.issuedParts || [])
  }

  const handleVerify = async () => {
    if (!student) return
    
    setIsVerifying(true)
    try {
      const res = await fetch(`/api/users/${student.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || 'Verification failed')
        return
      }
      
      toast.success(`${student.name} verified successfully`)
      
      // Update student state to reflect verification
      setStudent((prev: any) => prev ? { ...prev, isPrnVerified: true } : null)
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReturn = async (partId: string) => {
    setReturningId(partId)

    try {
      const res = await fetch('/api/returns/mark-returned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        toast.error(data.error || 'Return failed')
        return
      }
      
      toast.success('Component returned successfully')
      setIssuedParts((prev) => prev.filter((p) => p.id !== partId))
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setReturningId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan Student ID (PRN)</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={lookupByPrn} className="flex gap-2">
            <Input
              ref={prnRef}
              placeholder="Scan PRN and press Enter"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
            />
            <Button type="submit">Fetch Active</Button>
          </form>
          {student && (
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {student.name} ({student.prn})
                  {student.department && <span className="text-muted-foreground ml-2">· {student.department}</span>}
                </p>
                {student.isPrnVerified ? (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Not Verified
                  </Badge>
                )}
              </div>
              
              {/* Verification Warning */}
              {!student.isPrnVerified && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                      PRN Not Verified
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                      This student's PRN has not been verified yet. Please verify their ID card before processing returns.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="h-7 text-xs border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1.5" />
                          Verify Student
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Checkouts</CardTitle>
          <CardDescription>Click return on each item as it is handed back.</CardDescription>
        </CardHeader>
        <CardContent>
          {issuedParts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Component</TableHead>
                    <TableHead className="hidden md:table-cell">Issued Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedParts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>
                        <p className="font-medium">{part.component.name}</p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(part.issuedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>{part.quantity}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleReturn(part.id)}
                          disabled={returningId === part.id}
                        >
                          {returningId === part.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Returning...
                            </>
                          ) : (
                            'Return'
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800">
                <CheckCircle className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">All Clear!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {student 
                  ? `${student.name} has no active checkouts`
                  : 'Scan a student PRN to view their active checkouts'}
              </p>
              {!student && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg max-w-md mx-auto">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Tip:</span> Use a barcode scanner for faster PRN lookup
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
