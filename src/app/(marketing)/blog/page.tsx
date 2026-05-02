import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    {
      title: '10 Best Practices for Lab Inventory Management',
      excerpt: 'Learn how to optimize your lab inventory with these proven strategies...',
      author: 'Sarah Johnson',
      date: 'Jan 20, 2026',
      readTime: '5 min read',
      category: 'Best Practices',
      slug: 'best-practices-lab-inventory',
    },
    {
      title: 'How AI is Transforming Laboratory Management',
      excerpt: 'Discover how artificial intelligence is revolutionizing the way labs operate...',
      author: 'Michael Chen',
      date: 'Jan 15, 2026',
      readTime: '7 min read',
      category: 'Technology',
      slug: 'ai-laboratory-management',
    },
    {
      title: 'The Complete Guide to QR Code Tracking',
      excerpt: 'Everything you need to know about implementing QR codes in your lab...',
      author: 'Emily Rodriguez',
      date: 'Jan 10, 2026',
      readTime: '6 min read',
      category: 'Guides',
      slug: 'qr-code-tracking-guide',
    },
  ]

  return (
    <div className="py-24 px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold text-foreground">Blog</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Insights, guides, and best practices for lab management
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.slug} className="flex flex-col overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600" />
              <div className="flex flex-1 flex-col p-6">
                <Badge className="w-fit">{post.category}</Badge>
                <h3 className="mt-4 text-xl font-bold text-foreground">
                  {post.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-4 flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
