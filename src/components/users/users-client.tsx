'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Users,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Settings,
  CheckCircle,
  X,
  Loader2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRole = 'STUDENT' | 'LAB_ASSISTANT' | 'HOD' | 'ADMIN'

interface UserRecord {
  id: string
  name: string | null
  email: string
  role: string
  department: string | null
  prn: string | null
  isActive: boolean
  createdAt: string
}

interface UsersClientProps {
  users: UserRecord[]
  currentUserId: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLES: UserRole[] = ['STUDENT', 'LAB_ASSISTANT', 'HOD', 'ADMIN']

function roleIcon(role: string) {
  switch (role) {
    case 'HOD':           return <ShieldCheck className="h-3.5 w-3.5" />
    case 'ADMIN':         return <Settings className="h-3.5 w-3.5" />
    case 'LAB_ASSISTANT': return <UserCheck className="h-3.5 w-3.5" />
    default:              return <GraduationCap className="h-3.5 w-3.5" />
  }
}

function roleBadgeVariant(role: string): 'default' | 'secondary' | 'warning' | 'destructive' {
  switch (role) {
    case 'HOD':           return 'warning'
    case 'ADMIN':         return 'destructive'
    case 'LAB_ASSISTANT': return 'default'
    default:              return 'secondary'
  }
}

// ── Role Change Dialog ────────────────────────────────────────────────────────

function RoleChangeDialog({
  user,
  onClose,
  onConfirm,
  saving,
}: {
  user: UserRecord
  onClose: () => void
  onConfirm: (newRole: UserRole) => void
  saving: boolean
}) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user.role as UserRole)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Change Role
          </CardTitle>
          <CardDescription>
            Update role for <span className="font-medium text-foreground">{user.name ?? user.email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current → New summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 text-sm">
            <Badge variant={roleBadgeVariant(user.role)} className="gap-1">
              {roleIcon(user.role)}
              {user.role}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant={roleBadgeVariant(selectedRole)} className="gap-1">
              {roleIcon(selectedRole)}
              {selectedRole}
            </Badge>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {roleIcon(role)}
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              className="flex-1"
              onClick={() => onConfirm(selectedRole)}
              disabled={saving || selectedRole === user.role}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><CheckCircle className="h-4 w-4 mr-2" />Confirm</>
              )}
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

export function UsersClient({ users: initialUsers, currentUserId }: UsersClientProps) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.prn?.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleRoleChange = async (newRole: UserRole) => {
    if (!editingUser) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update role')
        return
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, role: newRole } : u))
      )
      toast.success(`${editingUser.name ?? editingUser.email} is now ${newRole.replace('_', ' ')}`)
      setEditingUser(null)
    } catch {
      toast.error('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const roleCounts = ROLES.reduce((acc, r) => {
    acc[r] = users.filter((u) => u.role === r).length
    return acc
  }, {} as Record<string, number>)

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {ROLES.map((role) => (
          <Card key={role} className="cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setRoleFilter(roleFilter === role ? 'ALL' : role)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{role.replace('_', ' ')}</p>
                <p className="text-xl font-bold text-foreground">{roleCounts[role] ?? 0}</p>
              </div>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                roleFilter === role ? 'bg-primary/20' : 'bg-muted'
              }`}>
                {roleIcon(role)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filters ───────────────────────────────────────── */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or PRN…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['ALL', ...ROLES].map((r) => (
                <Button
                  key={r}
                  variant={roleFilter === r ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(r)}
                  className="text-xs"
                >
                  {r === 'ALL' ? 'All' : r.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── User table ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''}
            {roleFilter !== 'ALL' && ` · ${roleFilter.replace('_', ' ')}`}
          </CardTitle>
          <CardDescription>
            Click "Change Role" to update a user's access level
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users match your filters</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-semibold text-primary">
                      {(user.name ?? user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground truncate">
                          {user.name ?? '—'}
                        </span>
                        <Badge variant={roleBadgeVariant(user.role)} className="gap-1 text-[10px] px-1.5 py-0">
                          {roleIcon(user.role)}
                          {user.role.replace('_', ' ')}
                        </Badge>
                        {!user.isActive && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Inactive</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="truncate">{user.email}</span>
                        {user.prn && <><span>·</span><span>{user.prn}</span></>}
                        {user.department && <><span>·</span><span className="truncate">{user.department}</span></>}
                      </div>
                    </div>
                  </div>
                  {user.id !== currentUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      className="ml-3 shrink-0 text-xs"
                    >
                      Change Role
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Role change dialog ─────────────────────────────── */}
      {editingUser && (
        <RoleChangeDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onConfirm={handleRoleChange}
          saving={saving}
        />
      )}
    </>
  )
}
