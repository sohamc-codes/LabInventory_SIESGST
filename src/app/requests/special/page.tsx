'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import {
  ArrowLeft,
  Send,
  Info,
  Upload,
  Link as LinkIcon,
  Package,
  DollarSign,
  FileText,
  Image as ImageIcon,
  X,
  Target,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function SpecialRequestPage() {
  const router = useRouter()
  const [partName, setPartName] = useState('')
  const [description, setDescription] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [purpose, setPurpose] = useState('')
  const [selectedProject, setSelectedProject] = useState('OTHER')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to fetch projects')
      return response.json()
    },
  })

  const projects = projectsData?.projects || []

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imageFiles.length > 5) {
      alert('Maximum 5 images allowed')
      return
    }

    setImageFiles([...imageFiles, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    // Validation - at least one of: part details, website URL, or images
    const hasPartDetails = partName.length >= 3 && description.length >= 10
    const hasWebsiteUrl = websiteUrl.trim().length > 0
    const hasImages = imageFiles.length > 0

    if (!hasPartDetails && !hasWebsiteUrl && !hasImages) {
      alert('Please provide at least one of: Part Details, Product Link, or Product Images')
      return
    }

    if (purpose.length < 10) {
      alert('Purpose must be at least 10 characters')
      return
    }
    if (quantity < 1) {
      alert('Quantity must be at least 1')
      return
    }

    setIsSubmitting(true)

    try {
      // For now, we'll store image previews as base64 (in production, upload to cloud storage)
      
      const requestData = {
        partName: partName || 'Special Component Request',
        description: description || 'See attached link or images for details',
        quantity,
        websiteUrl: websiteUrl && websiteUrl.trim() ? websiteUrl.trim() : null,
        imageUrls: imagePreviews.length > 0 ? imagePreviews : null,
        purpose,
        projectId: selectedProject !== 'OTHER' ? selectedProject : null,
      }

      console.log('Submitting request data:', requestData)

      const response = await fetch('/api/special-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        alert('Special request submitted successfully!')
        router.push('/requests/special-list')
      } else {
        const error = await response.json()
        console.error('Server error:', error)
        alert(`Failed to submit request: ${error.error || 'Unknown error'}${error.details ? '\n' + JSON.stringify(error.details) : ''}`)
      }
    } catch (error) {
      console.error('Error submitting special request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Special Parts Request"
          subtitle="Request components not available in inventory"
          rightContent={
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Info Banner */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">About Special Requests</p>
                    <p className="text-blue-700 dark:text-blue-300">
                      Request components not in our inventory. You can provide <strong>Part Details</strong> OR 
                      a <strong>Product Link</strong> OR <strong>Product Images</strong> (or any combination). 
                      More information helps us process your request faster!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Part Details */}
                <Card className="border-2 border-gray-200 dark:border-zinc-800">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Package className="h-6 w-6" />
                      Part Details
                    </CardTitle>
                    <CardDescription className="text-base">
                      Provide information about the component you need
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Part Name
                      </label>
                      <Input
                        value={partName}
                        onChange={(e) => setPartName(e.target.value)}
                        placeholder="e.g., ESP32-CAM Module"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the exact name or model number
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detailed description including specifications, features, and requirements..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md resize-none bg-card text-card-foreground text-foreground"
                        rows={4}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${description.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                          {description.length}/10 characters (optional)
                        </p>
                        {description.length >= 10 && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* OR Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-300 dark:border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-zinc-950 px-6 py-2 text-lg font-bold text-muted-foreground rounded-full border-2 border-gray-300 dark:border-zinc-700">
                      OR
                    </span>
                  </div>
                </div>

                {/* Product Link */}
                <Card className="border-2 border-gray-200 dark:border-zinc-800">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <LinkIcon className="h-6 w-6" />
                      Product Link
                    </CardTitle>
                    <CardDescription className="text-base">
                      Provide a link where this component can be purchased
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Website URL
                      </label>
                      <Input
                        type="url"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://example.com/product"
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Amazon, Robu.in, or any other online store link
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* OR Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gray-300 dark:border-zinc-700"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-zinc-950 px-6 py-2 text-lg font-bold text-muted-foreground rounded-full border-2 border-gray-300 dark:border-zinc-700">
                      OR
                    </span>
                  </div>
                </div>

                {/* Image Upload */}
                <Card className="border-2 border-gray-200 dark:border-zinc-800">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <ImageIcon className="h-6 w-6" />
                      Product Images
                    </CardTitle>
                    <CardDescription className="text-base">
                      Upload images of the component (max 5 images)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                          disabled={imageFiles.length >= 5}
                        />
                        <label
                          htmlFor="image-upload"
                          className={`cursor-pointer ${imageFiles.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload images
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 10MB ({imageFiles.length}/5)
                          </p>
                        </label>
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-zinc-800"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Request Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Request Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-card text-card-foreground appearance-none pr-10 bg-no-repeat bg-right"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="OTHER">Other (Single Parts)</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Purpose <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Why do you need this component?"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md resize-none bg-card text-card-foreground text-foreground"
                        rows={4}
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${purpose.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                          {purpose.length}/10 minimum characters
                        </p>
                        {purpose.length >= 10 && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Guidelines */}
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-900 dark:text-amber-100">
                        <p className="font-medium mb-2">Guidelines:</p>
                        <ul className="text-xs space-y-1 text-amber-800 dark:text-amber-200">
                          <li>• Provide <strong>Part Details</strong> OR <strong>Product Link</strong> OR <strong>Images</strong></li>
                          <li>• More information = faster approval</li>
                          <li>• Include product links if available</li>
                          <li>• Upload clear product images</li>
                          <li>• Purpose is always required</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={
                    (partName.length < 3 && description.length < 10 && !websiteUrl && imageFiles.length === 0) ||
                    purpose.length < 10 ||
                    quantity < 1 ||
                    isSubmitting
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>

                {/* Validation Messages */}
                {(partName.length < 3 && description.length < 10 && !websiteUrl && imageFiles.length === 0) && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Provide at least one: Part Details, Product Link, or Images</span>
                  </div>
                )}
                
                {purpose.length < 10 && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Purpose is required (minimum 10 characters)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
