'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Search,
  Package,
  MapPin,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Layers,
  TrendingUp,
  BarChart3,
  Zap,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ComponentRow {
  id: string
  name: string
  category: string
  manufacturer: string | null
  totalStock: number
  availableStock: number
  condition: string
  storageLocation: string | null
  purchaseDate: Date | null
}

interface Props {
  components: ComponentRow[]
  userRole: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'ALL', 'MICROCONTROLLER', 'SENSOR', 'MODULE', 'DISPLAY',
  'COMMUNICATION', 'POWER', 'BREADBOARD', 'RESISTOR', 'CAPACITOR',
]

function conditionBadge(condition: string) {
  switch (condition) {
    case 'NEW':     return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    case 'GOOD':    return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'WORN':    return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    case 'DAMAGED': return 'bg-destructive/10 text-destructive border-destructive/20'
    default:        return 'bg-muted text-muted-foreground border-border'
  }
}

function availabilityColor(pct: number) {
  if (pct >= 80) return 'text-emerald-500'
  if (pct >= 50) return 'text-amber-500'
  if (pct >= 20) return 'text-orange-500'
  return 'text-destructive'
}

// ── Component ─────────────────────────────────────────────────────────────────

export function InventoryBrowseClient({ components, userRole }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'availableStock'>('name')
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    return components
      .filter((c) => {
        const q = search.toLowerCase()
        const matchSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.manufacturer?.toLowerCase().includes(q)
        const matchCat = category === 'ALL' || c.category === category
        return matchSearch && matchCat && c.availableStock > 0
      })
      .sort((a, b) => {
        const av = sortBy === 'name' ? a.name : a.availableStock
        const bv = sortBy === 'name' ? b.name : b.availableStock
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortAsc ? av - bv : bv - av
        }
        return sortAsc
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av))
      })
  }, [components, search, category, sortBy, sortAsc])

  // Stats
  const totalItems = components.reduce((s, c) => s + c.totalStock, 0)
  const availItems = components.reduce((s, c) => s + c.availableStock, 0)
  const utilRate = totalItems > 0 ? Math.round(((totalItems - availItems) / totalItems) * 100) : 0
  const cats = new Set(components.map((c) => c.category)).size

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Components', value: components.length, sub: `${filtered.length} shown`, icon: Package, color: 'text-primary', accent: 'from-blue-500 to-cyan-500' },
          { label: 'Available Items', value: availItems, sub: `of ${totalItems} total`, icon: Layers, color: 'text-emerald-500', accent: 'from-emerald-500 to-teal-500' },
          { label: 'Utilization', value: `${utilRate}%`, sub: 'in active use', icon: TrendingUp, color: 'text-purple-500', accent: 'from-purple-500 to-pink-500' },
          { label: 'Categories', value: cats, sub: 'component types', icon: BarChart3, color: 'text-orange-500', accent: 'from-orange-500 to-red-500' },
        ].map(({ label, value, sub, icon: Icon, color, accent }) => (
          <Card key={label} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
            <div className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r ${accent}`} />
          </Card>
        ))}
      </div>

      {/* Search & filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or manufacturer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Zap className="h-4 w-4 mr-1.5" />
                Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSortBy(sortBy === 'name' ? 'availableStock' : 'name') }}
              >
                Sort: {sortBy === 'name' ? 'Name' : 'Stock'}
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setSortAsc(!sortAsc)}>
                {sortAsc ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" className="h-9 w-9" onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" className="h-9 w-9" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className="text-xs"
                >
                  {cat === 'ALL' ? 'All Categories' : cat.replace('_', ' ')}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component grid/list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              {components.length === 0 ? 'No Components Available' : 'No Matching Components'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {components.length === 0
                ? 'Lab assistants can add components via Manage Inventory.'
                : 'Try adjusting your search or category filter.'}
            </p>
            {search && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => {
            const pct = c.totalStock > 0 ? Math.round((c.availableStock / c.totalStock) * 100) : 0
            return (
              <Card key={c.id} className="hover:border-primary/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate">{c.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.manufacturer ?? '—'}</p>
                    </div>
                    <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${conditionBadge(c.condition)}`}>
                      {c.condition}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Available</span>
                      <span className={`font-bold ${availabilityColor(pct)}`}>{c.availableStock}</span>
                    </div>
                    <Progress value={pct} />
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Total: {c.totalStock}</span>
                      <span>{pct}%</span>
                    </div>
                  </div>
                  {c.storageLocation && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {c.storageLocation}
                    </div>
                  )}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {c.category.replace('_', ' ')}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filtered.map((c) => {
                const pct = c.totalStock > 0 ? Math.round((c.availableStock / c.totalStock) * 100) : 0
                return (
                  <div key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-accent/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{c.name}</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                          {c.category.replace('_', ' ')}
                        </Badge>
                        <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${conditionBadge(c.condition)}`}>
                          {c.condition}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.manufacturer ?? '—'}
                        {c.storageLocation && ` · ${c.storageLocation}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${availabilityColor(pct)}`}>{c.availableStock}</p>
                      <p className="text-[10px] text-muted-foreground">of {c.totalStock}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
