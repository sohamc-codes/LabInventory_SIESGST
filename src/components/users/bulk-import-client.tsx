'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Papa from 'papaparse'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  X,
  Info,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StudentRecord {
  email: string
  prn: string
  department?: string
  year?: string
}

interface ParsedData {
  valid: StudentRecord[]
  invalid: Array<{ row: number; data: any; errors: string[] }>
}

interface UploadResult {
  success: number
  failed: number
  errors: Array<{ email: string; error: string }>
}

// ── Helper Functions ──────────────────────────────────────────────────────────

function validateStudentRecord(data: any, rowIndex: number): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.email || typeof data.email !== 'string' || !data.email.includes('@')) {
    errors.push('Invalid or missing email')
  }

  if (!data.prn || typeof data.prn !== 'string' || data.prn.trim().length === 0) {
    errors.push('Missing PRN')
  }

  return { valid: errors.length === 0, errors }
}

function generateSampleCSV(): string {
  return `email,prn,department,year
student1@sies.edu,123A7001,Computer Engineering,TE
student2@sies.edu,123A7002,Electronics Engineering,BE
student3@sies.edu,123A7003,Information Technology,SE`
}

// ── Main Component ────────────────────────────────────────────────────────────

export function BulkImportClient() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    setFile(selectedFile)
    setUploadResult(null)
    parseCSV(selectedFile)
  }

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid: StudentRecord[] = []
        const invalid: Array<{ row: number; data: any; errors: string[] }> = []

        results.data.forEach((row: any, index: number) => {
          const validation = validateStudentRecord(row, index + 2) // +2 for header and 0-index
          
          if (validation.valid) {
            valid.push({
              email: row.email.trim(),
              prn: row.prn.trim(),
              department: row.department?.trim(),
              year: row.year?.trim(),
            })
          } else {
            invalid.push({
              row: index + 2,
              data: row,
              errors: validation.errors,
            })
          }
        })

        setParsedData({ valid, invalid })

        if (valid.length === 0) {
          toast.error('No valid records found in CSV')
        } else {
          toast.success(`Parsed ${valid.length} valid record${valid.length !== 1 ? 's' : ''}`)
        }

        if (invalid.length > 0) {
          toast.warning(`${invalid.length} invalid record${invalid.length !== 1 ? 's' : ''} skipped`)
        }
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`)
        setFile(null)
      },
    })
  }

  const handleUpload = async () => {
    if (!parsedData || parsedData.valid.length === 0) {
      toast.error('No valid records to upload')
      return
    }

    setUploading(true)
    try {
      const response = await fetch('/api/users/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedData.valid }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }

      setUploadResult(data.results)
      
      if (data.results.success > 0) {
        toast.success(`Successfully updated ${data.results.success} student${data.results.success !== 1 ? 's' : ''}`)
      }
      
      if (data.results.failed > 0) {
        toast.error(`Failed to update ${data.results.failed} student${data.results.failed !== 1 ? 's' : ''}`)
      }
    } catch (error) {
      toast.error('Network error — please try again')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedData(null)
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSampleCSV = () => {
    const csv = generateSampleCSV()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sample-prn-import.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    toast.success('Sample CSV downloaded')
  }

  return (
    <div className="space-y-5">
      {/* ── Instructions ─────────────────────────────────────── */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Info className="h-4 w-4" />
            How to Use Bulk Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <p className="font-medium mb-1">CSV Format Requirements:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>email</strong> (required): Student's email address</li>
              <li><strong>prn</strong> (required): Student's PRN (e.g., 123A7009)</li>
              <li><strong>department</strong> (optional): Department name</li>
              <li><strong>year</strong> (optional): Academic year (e.g., TE, BE)</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSampleCSV}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1.5" />
              Download Sample CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── File Upload ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload CSV File</CardTitle>
          <CardDescription>
            Select a CSV file containing student email and PRN mappings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!file ? (
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-accent/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Preview Table ────────────────────────────────────── */}
      {parsedData && (
        <>
          {/* Valid Records */}
          {parsedData.valid.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Valid Records ({parsedData.valid.length})
                    </CardTitle>
                    <CardDescription>
                      These records will be imported
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || uploadResult !== null}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload to Database
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">#</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">PRN</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Department</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Year</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.valid.slice(0, 10).map((record, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-2 px-3 text-muted-foreground">{index + 1}</td>
                          <td className="py-2 px-3 font-mono text-xs">{record.email}</td>
                          <td className="py-2 px-3 font-mono text-xs">{record.prn}</td>
                          <td className="py-2 px-3">{record.department || '—'}</td>
                          <td className="py-2 px-3">{record.year || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.valid.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      ... and {parsedData.valid.length - 10} more records
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invalid Records */}
          {parsedData.invalid.length > 0 && (
            <Card className="border-orange-200 dark:border-orange-900">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-orange-900 dark:text-orange-100">
                  <AlertCircle className="h-4 w-4" />
                  Invalid Records ({parsedData.invalid.length})
                </CardTitle>
                <CardDescription>
                  These records have errors and will be skipped
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {parsedData.invalid.slice(0, 5).map((record, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-orange-200 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-950/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          Row {record.row}
                        </Badge>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">
                          <strong>Email:</strong> {record.data.email || '(missing)'}
                        </p>
                        <p className="text-muted-foreground">
                          <strong>PRN:</strong> {record.data.prn || '(missing)'}
                        </p>
                        <div className="mt-2">
                          <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                            Errors:
                          </p>
                          <ul className="list-disc list-inside text-orange-800 dark:text-orange-200">
                            {record.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                  {parsedData.invalid.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ... and {parsedData.invalid.length - 5} more invalid records
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* ── Upload Results ───────────────────────────────────── */}
      {uploadResult && (
        <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-green-900 dark:text-green-100">
              <CheckCircle className="h-4 w-4" />
              Upload Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                <p className="text-xs text-green-700 dark:text-green-300 mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {uploadResult.success}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                <p className="text-xs text-red-700 dark:text-red-300 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {uploadResult.failed}
                </p>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Errors:</p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div
                      key={index}
                      className="text-xs p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                    >
                      <span className="font-mono">{error.email}</span>: {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full">
              Upload Another File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
