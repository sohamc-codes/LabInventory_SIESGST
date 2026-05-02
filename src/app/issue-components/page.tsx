'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  User,
  Package,
  PackageCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from 'lucide-react'
import { useDebounce } from 'use-debounce'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActiveIssue {
  id: string
  quantity: number
  issuedAt: string
  expectedReturnDate: string
  component: { id: string; name: string; category: string }
}

interface Student {
  id: string
  name: string
  prn: string | null
  email: string
  department: string | null
  issuedItems: ActiveIssue[]
}

interface ApprovedRequest {
  id: string
  quantity: number
  purpose: string
  expectedDuration: number
  component: { id: string; name: string; category: string; availableStock: number }
  student: { name: string; prn: string | null }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StudentCard({
  student,
  onClear,
}: {
  student: Student
  onClear: () => void
}) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-primary" />
            {student.name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClear} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {student.prn && <span>PRN: {student.prn}</span>}
          {student.department && <span>· {student.department}</span>}
          <span>· {student.email}</span>
        </div>
      </CardHeader>

      {student.issuedItems.length > 0 && (
        <CardContent>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Currently holding {student.issuedItems.length} item{student.issuedItems.length !== 1 ? 's' : ''}:
          </p>
          <div className="space-y-1.5">
            {student.issuedItems.map((item) => {
              const due = new Date(item.expectedReturnDate)
              const isOverdue = due < new Date()
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50"
                >
                  <span className="font-medium text-foreground">{item.component.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    <Badge
                      variant={isOverdue ? 'destructive' : 'secondary'}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {isOverdue ? 'Overdue' : `Due ${due.toLocaleDateString()}`}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

function ApprovedRequestsList({
  requests,
  issuingId,
  onIssue,
}: {
  requests: ApprovedRequest[]
  issuingId: string | null
  onIssue: (requestId: string, componentName: string) => void
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No approved requests pending issue</p>
        <p className="text-xs text-muted-foreground mt-1">
          The student has no requests in APPROVED status
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {requests.map((req) => {
        const isBeingIssued = issuingId === req.id
        const hasStock = req.component.availableStock >= req.quantity
        return (
          <div
            key={req.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium text-foreground truncate">
                  {req.component.name}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                  {req.component.category}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>Qty: {req.quantity}</span>
                <span>·</span>
                <span>{req.expectedDuration} days</span>
                <span>·</span>
                <span className="truncate max-w-[200px]" title={req.purpose}>
                  {req.purpose}
                </span>
              </div>
              {!hasStock && (
                <p className="text-xs text-destructive mt-0.5 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Only {req.component.availableStock} in stock
                </p>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => onIssue(req.id, req.component.name)}
              disabled={isBeingIssued || !hasStock}
              className="ml-3 shrink-0"
            >
              {isBeingIssued ? (
                <><Loader2 className="h-3 w-3 mr-1.5 animate-spin" />Issuing…</>
              ) : (
                <><PackageCheck className="h-3 w-3 mr-1.5" />Issue</>
              )}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function IssueComponentsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const [barcodeValue, setBarcodeValue] = useState('')
  const [manualQuery, setManualQuery] = useState('')
  const [debouncedQuery] = useDebounce(manualQuery, 350)

  const [student, setStudent] = useState<Student | null>(null)
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>([])
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [issuingId, setIssuingId] = useState<string | null>(null)

  // Auth guard — only LAB_ASSISTANT and HOD
  useEffect(() => {
    if (session && !['LAB_ASSISTANT', 'HOD', 'ADMIN'].includes(session.user.role)) {
      router.push('/unauthorized')
    }
  }, [session, router])

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus()
  }, [])

  // Fetch approved requests for a student
  const fetchApprovedRequests = useCallback(async (studentId: string) => {
    setIsLoadingRequests(true)
    try {
      const res = await fetch(`/api/requests?studentId=${studentId}&status=APPROVED&limit=20`)
      if (!res.ok) throw new Error('Failed to fetch requests')
      const data = await res.json()
      setApprovedRequests(data.requests || [])
    } catch {
      setApprovedRequests([])
    } finally {
      setIsLoadingRequests(false)
    }
  }, [])

  // Select a student and load their approved requests
  const selectStudent = useCallback(
    (s: Student) => {
      setStudent(s)
      setSearchResults([])
      setManualQuery('')
      setBarcodeValue('')
      setLookupError(null)
      fetchApprovedRequests(s.id)
    },
    [fetchApprovedRequests]
  )

  // Clear student selection and refocus barcode input
  const clearStudent = useCallback(() => {
    setStudent(null)
    setApprovedRequests([])
    setLookupError(null)
    setTimeout(() => barcodeInputRef.current?.focus(), 50)
  }, [])

  // Barcode scanner — auto-submit on Enter
  const handleBarcodeKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const prn = barcodeValue.trim()
    if (!prn) return

    setLookupError(null)
    setIsSearching(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(prn)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lookup failed')
      const found = data.users?.[0]
      if (!found) {
        setLookupError(`No student found for PRN "${prn}"`)
        setBarcodeValue('')
      } else {
        selectStudent(found)
      }
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Lookup failed')
      setBarcodeValue('')
    } finally {
      setIsSearching(false)
    }
  }

  // Manual search — debounced
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSearchResults([])
      return
    }
    let cancelled = false
    setIsSearching(true)
    fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setSearchResults(data.users || [])
      })
      .catch(() => {
        if (!cancelled) setSearchResults([])
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false)
      })
    return () => { cancelled = true }
  }, [debouncedQuery])

  // Issue a component
  const handleIssue = async (requestId: string, componentName: string) => {
    setIssuingId(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to issue component')
        return
      }
      toast.success(`${componentName} issued successfully`)
      // Remove the issued request from the list
      setApprovedRequests((prev) => prev.filter((r) => r.id !== requestId))
      // Refocus barcode input for next transaction
      clearStudent()
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setIssuingId(null)
    }
  }

  if (!session?.user) return null

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Issue Components"
          subtitle="Find a student by ID scan or name/PRN search, then issue approved parts"
        />

        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* ── Step 1: Student Lookup ─────────────────────── */}
            {!student && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Find Student
                  </CardTitle>
                  <CardDescription>
                    Scan the student's ID card barcode, or type their name / PRN below
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Barcode scanner input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Barcode Scanner Input
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        ref={barcodeInputRef}
                        value={barcodeValue}
                        onChange={(e) => setBarcodeValue(e.target.value)}
                        onKeyDown={handleBarcodeKeyDown}
                        placeholder="Scan ID card — auto-submits on Enter"
                        className="pl-9"
                        autoComplete="off"
                      />
                      {isSearching && barcodeValue && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Manual search */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Manual Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={manualQuery}
                        onChange={(e) => setManualQuery(e.target.value)}
                        placeholder="Search by student name or PRN…"
                        className="pl-9"
                        autoComplete="off"
                      />
                      {isSearching && manualQuery && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                      <div className="rounded-lg border border-border bg-card shadow-md overflow-hidden">
                        {searchResults.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => selectStudent(s)}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-foreground">{s.name}</span>
                              {s.prn && (
                                <span className="text-xs text-muted-foreground font-mono">{s.prn}</span>
                              )}
                            </div>
                            {s.department && (
                              <p className="text-xs text-muted-foreground mt-0.5">{s.department}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {manualQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                      <p className="text-xs text-muted-foreground px-1">
                        No students found for "{manualQuery}"
                      </p>
                    )}
                  </div>

                  {/* Lookup error */}
                  {lookupError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-sm text-destructive">{lookupError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── Step 2: Student card + approved requests ───── */}
            {student && (
              <>
                <StudentCard student={student} onClear={clearStudent} />

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-primary" />
                      Approved Requests
                    </CardTitle>
                    <CardDescription>
                      Click "Issue" to hand over the physical component to the student
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingRequests ? (
                      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading approved requests…</span>
                      </div>
                    ) : (
                      <ApprovedRequestsList
                        requests={approvedRequests}
                        issuingId={issuingId}
                        onIssue={handleIssue}
                      />
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── Usage hint ─────────────────────────────────── */}
            {!student && !lookupError && (
              <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">How to issue a component</p>
                  <p>1. Scan the student's ID card barcode — the field auto-submits on Enter.</p>
                  <p>2. Or type the student's name or PRN in the manual search bar.</p>
                  <p>3. Select the student, then click "Issue" next to the approved request.</p>
                  <p>4. The page resets automatically after each successful issue.</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
