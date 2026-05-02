'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, CheckCircle, XCircle, FileText } from 'lucide-react'

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/bulk/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Import failed:', error)
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const csv = 'Name,Category,Quantity,Location,Manufacturer,Model\nArduino Uno,MICROCONTROLLER,10,Shelf A1,Arduino,UNO R3\nLED Red 5mm,LED,100,Drawer B2,Generic,5mm'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'import-template.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Import</h1>
        <p className="mt-2 text-muted-foreground">
          Import multiple components at once using CSV
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Step 1: Download Template</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Download our CSV template to ensure your data is formatted correctly
          </p>
          <Button className="mt-4" variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold">Step 2: Upload File</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload your completed CSV file to import components
          </p>
          <div className="mt-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </span>
              </Button>
            </label>
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>
        </Card>
      </div>

      {file && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Step 3: Import</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your file and click import to add components
          </p>
          <Button
            className="mt-4"
            onClick={handleImport}
            disabled={importing}
          >
            {importing ? 'Importing...' : 'Import Components'}
          </Button>
        </Card>
      )}

      {results && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Import Results</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>{results.success} components imported successfully</span>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span>{results.failed} components failed to import</span>
              </div>
            )}
            {results.errors.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium">Errors:</p>
                <ul className="mt-2 space-y-1 text-sm text-red-600">
                  {results.errors.map((error: string, i: number) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="text-lg font-semibold">CSV Format Requirements</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• First row must be headers: Name,Category,Quantity,Location,Manufacturer,Model</li>
          <li>• Name and Category are required fields</li>
          <li>• Quantity must be a number</li>
          <li>• Use commas to separate values</li>
          <li>• Maximum 1000 rows per import</li>
        </ul>
      </Card>
    </div>
  )
}
