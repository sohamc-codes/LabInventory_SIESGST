'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

export function PartsIssuedClient() {
  const prnRef = useRef<HTMLInputElement>(null)
  const [prn, setPrn] = useState('')
  const [student, setStudent] = useState<any>(null)
  const [issuedParts, setIssuedParts] = useState<any[]>([])

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
          {student && <p className="mt-3 text-sm font-medium">{student.name} ({student.prn})</p>}
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
                          onClick={async () => {
                            const res = await fetch('/api/returns/mark-returned', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ partId: part.id }),
                            })
                            const data = await res.json()
                            if (!res.ok) {
                              toast.error(data.error || 'Return failed')
                              return
                            }
                            toast.success('Returned successfully')
                            setIssuedParts((prev) => prev.filter((p) => p.id !== part.id))
                          }}
                        >
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active checkouts for this student.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
