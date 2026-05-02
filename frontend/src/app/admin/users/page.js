'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { adminAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

const ROLE_COLORS = { 
  student: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]', 
  recruiter: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]', 
  admin: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.15)]' 
}

const ROLE_ICONS = { student: '🎓', recruiter: '💼', admin: '🛡️' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const r = await adminAPI.getUsers({ role: roleFilter, search, page, limit: 15 })
      setUsers(r.data.users)
      setTotal(r.data.total)
    } catch (e) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [roleFilter, page])

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadUsers() }

  const toggleUser = async (id) => {
    try {
      const r = await adminAPI.toggleUser(id)
      setUsers(us => us.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u))
      toast.success(`User ${r.data.user.isActive ? 'activated' : 'deactivated'}`)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to toggle status') }
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone and will destroy associated records.`)) return
    try {
      await adminAPI.deleteUser(id)
      setUsers(us => us.filter(u => u._id !== id))
      toast.success('User permanently deleted')
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to delete user') }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-2">User Management</h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                Tracking {total} registered accounts
              </p>
            </div>
            
            <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50">🔍</span>
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  className="w-full md:w-64 bg-secondary/80 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder-muted-foreground" 
                  placeholder="Search name or email..." 
                />
              </div>
              <AnimatedButton variant="primary" type="submit" className="h-11 px-5 text-sm">
                Search
              </AnimatedButton>
            </form>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-6 pb-2 custom-scrollbar overflow-x-auto">
          <div className="flex gap-3">
            {['', 'student', 'recruiter', 'admin'].map(r => (
              <button 
                key={r} 
                onClick={() => { setRoleFilter(r); setPage(1) }}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all duration-300 ${
                  roleFilter === r 
                  ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' 
                  : 'bg-secondary/40 text-muted-foreground border-border hover:border-primary/50 hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                {r ? <>{ROLE_ICONS[r]} <span className="capitalize">{r}</span></> : '🌟 All Roles'}
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <SpotlightCard className="overflow-hidden border-primary/10">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-xs uppercase tracking-widest font-bold text-muted-foreground">
                    <th className="p-5 font-bold">Identity</th>
                    <th className="p-5 font-bold">Role</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold">Joined</th>
                    <th className="p-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i}><td colSpan={5} className="p-5"><div className="h-10 bg-secondary/50 animate-pulse rounded-lg" /></td></tr>
                    ))
                  ) : users.length === 0 ? (
                     <tr><td colSpan={5} className="p-12 text-center text-muted-foreground font-bold">No accounts found matching your criteria.</td></tr> 
                  ) : users.map(user => (
                    <tr key={user._id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="p-5 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black border ${ROLE_COLORS[user.role]}`}>
                            {user.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user.name} {user._id === adminAPI.userId ? '(You)' : ''}</p>
                            <p className="text-xs font-medium text-muted-foreground mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded border flex inline-flex items-center gap-1.5 ${ROLE_COLORS[user.role]}`}>
                          <span>{ROLE_ICONS[user.role]}</span> {user.role}
                        </span>
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]'}`} />
                          <span className={`text-xs font-bold uppercase ${user.isActive ? 'text-green-500' : 'text-red-500'}`}>
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </td>
                      <td className="p-5 whitespace-nowrap text-sm font-medium text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-5 whitespace-nowrap text-right">
                        {user.role !== 'admin' && (
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => toggleUser(user._id)}
                              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all duration-300 ${user.isActive ? 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' : 'text-green-500 border-green-500/30 bg-green-500/10 hover:bg-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]'}`}
                            >
                              {user.isActive ? 'Suspend' : 'Unsuspend'}
                            </button>
                            <button 
                              onClick={() => deleteUser(user._id, user.name)}
                              className="text-[10px] items-center font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.1)] group/del overflow-hidden flex gap-1.5"
                            >
                              Destroy
                            </button>
                          </div>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-xs font-bold text-muted-foreground opacity-50 uppercase tracking-widest mr-4">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-5 border-t border-border/50 bg-secondary/20">
              <p className="text-sm font-bold text-muted-foreground">
                Showing <span className="text-foreground">{users.length}</span> of <span className="text-foreground">{total}</span> users
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <div className="flex items-center justify-center min-w-[32px] h-[32px] rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-black mx-1">
                  {page}
                </div>
                <button 
                  onClick={() => setPage(p => p + 1)} 
                  disabled={users.length < 15} 
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-all border border-border disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>
      </main>
    </div>
  )
}
