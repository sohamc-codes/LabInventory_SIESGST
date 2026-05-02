'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Target,
  Brain,
  Activity
} from 'lucide-react'
import { usePredictiveAnalytics } from '@/lib/recommendations'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsDashboard() {
  const { data: analytics, isLoading } = usePredictiveAnalytics()

  if (isLoading) {
    return <AnalyticsSkeletons />
  }

  const demandData = analytics?.demandForecast.map((item: any) => ({
    name: item.componentName,
    demand: item.predictedDemand,
    confidence: item.confidence * 100,
  })) || []

  const usageData = analytics?.usagePatterns[0]?.weeklyUsage.map((usage, index) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index],
    usage,
  })) || []

  const categoryData = [
    { name: 'Microcontrollers', value: 35, color: '#0088FE' },
    { name: 'Sensors', value: 28, color: '#00C49F' },
    { name: 'Displays', value: 15, color: '#FFBB28' },
    { name: 'Motors', value: 12, color: '#FF8042' },
    { name: 'Others', value: 10, color: '#8884D8' },
  ]

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Intelligent insights and predictions for your inventory management
          </p>
        </div>
        <Badge variant="secondary" className="gap-2">
          <Brain className="h-4 w-4" />
          AI Enabled
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,847</div>
            <p className="text-xs text-muted-foreground">
              Saved through optimized ordering
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Gain</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              Faster request processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Components need attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="demand" className="space-y-4">
        <TabsList>
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="usage">Usage Patterns</TabsTrigger>
          <TabsTrigger value="restock">Restock Recommendations</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Predicted Demand (Next 30 Days)</CardTitle>
                <CardDescription>
                  Demand forecasting based on historical patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={demandData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="demand" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Current inventory distribution by component category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Usage Patterns</CardTitle>
              <CardDescription>
                Component usage trends throughout the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="usage" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restock" className="space-y-4">
          <div className="grid gap-4">
            {analytics?.stockAlerts?.map((alert: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{alert.componentName}</CardTitle>
                    <Badge variant={
                      alert.urgency === 'high' ? 'destructive' : 
                      alert.urgency === 'medium' ? 'default' : 'secondary'
                    }>
                      {alert.urgency} priority
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Stock</span>
                      <span className="font-medium">{alert.currentStock} units</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Recommended Reorder</span>
                      <span className="font-medium">{alert.recommendedReorder} units</span>
                    </div>
                    <Progress 
                      value={(alert.currentStock / alert.recommendedReorder) * 100} 
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Stock level is {alert.urgency === 'high' ? 'critically' : alert.urgency === 'medium' ? 'moderately' : 'slightly'} low
                    </p>
                    <Button className="w-full">
                      Order {alert.recommendedReorder - alert.currentStock} Units
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) || (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-zinc-100 mb-2">All Stock Levels Optimal</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    No restock recommendations at this time
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Peak Usage Detected</p>
                    <p className="text-xs text-muted-foreground">
                      Arduino components are experiencing 40% higher demand this week
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Seasonal Trend</p>
                    <p className="text-xs text-muted-foreground">
                      IoT project requests typically increase by 25% in the next month
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Optimization Opportunity</p>
                    <p className="text-xs text-muted-foreground">
                      Bundling sensors with microcontrollers could reduce request processing time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Create Component Kits</p>
                      <p className="text-xs text-muted-foreground">
                        Bundle frequently requested items together
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Adjust Reorder Points</p>
                      <p className="text-xs text-muted-foreground">
                        Update minimum stock levels based on usage patterns
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Apply</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Schedule Maintenance</p>
                      <p className="text-xs text-muted-foreground">
                        Some components may need quality checks
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Schedule</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AnalyticsSkeletons() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}