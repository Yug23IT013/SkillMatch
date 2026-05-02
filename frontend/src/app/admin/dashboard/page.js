'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { adminAPI } from '@/lib/api'
import { Bar, Pie, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title } from 'chart.js'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { useTheme } from 'next-themes'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title)

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const isDark = resolvedTheme === 'dark'
    ChartJS.defaults.color = isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
    ChartJS.defaults.borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  }, [resolvedTheme])

  if (loading) return (
    <div className="flex min-h-screen bg-background pl-64 text-foreground">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12">
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse h-32 bg-secondary/50 rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="animate-pulse lg:col-span-2 h-80 bg-secondary/50 rounded-2xl" />
          <div className="animate-pulse h-80 bg-secondary/50 rounded-2xl" />
        </div>
      </main>
    </div>
  )

  const skillChartData = {
    labels: data?.topSkills?.map(s => s.skill) || [],
    datasets: [{ 
      label: 'Student Count', 
      data: data?.topSkills?.map(s => s.count) || [], 
      backgroundColor: 'rgba(56, 189, 248, 0.8)', // cyan-400
      hoverBackgroundColor: 'rgba(56, 189, 248, 1)',
      borderRadius: 6 
    }]
  }

  const appStatusData = {
    labels: data?.placementStats?.map(s => s._id) || [],
    datasets: [{ 
      data: data?.placementStats?.map(s => s.count) || [], 
      backgroundColor: ['#3b82f6', '#f59e0b', '#a855f7', '#ef4444', '#22c55e'], 
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  const jobTypeData = {
    labels: data?.jobsByType?.map(s => s._id) || [],
    datasets: [{ 
      data: data?.jobsByType?.map(s => s.count) || [], 
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7'], 
      borderWidth: 0,
      hoverOffset: 4
    }]
  }

  const domainChartData = {
    labels: data?.jobsByDomain?.map(s => s._id) || [],
    datasets: [{ 
      label: 'Jobs', 
      data: data?.jobsByDomain?.map(s => s.count) || [], 
      backgroundColor: 'rgba(168, 85, 247, 0.8)', // purple-500
      hoverBackgroundColor: 'rgba(168, 85, 247, 1)',
      borderRadius: 6 
    }]
  }

  const renderStatCard = (title, value, icon, iconColorClass, shadowColor) => (
    <SpotlightCard className="p-6 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${iconColorClass} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl border bg-secondary/60 ${shadowColor}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-black text-foreground drop-shadow-md">{value}</p>
        </div>
      </div>
    </SpotlightCard>
  )

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Platform Analytics</h1>
            <p className="text-muted-foreground font-medium mt-1">Real-time statistics and macro-level insights of SkillMatch.</p>
          </div>
        </FadeIn>

        {/* KPI Cards */}
        <FadeIn delay={0.2} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {renderStatCard("Total Users", data?.overview?.totalUsers || 0, "👥", "from-blue-500 to-cyan-500", "shadow-[0_0_15px_rgba(59,130,246,0.15)] border-blue-500/20 text-blue-500")}
          {renderStatCard("Students", data?.overview?.totalStudents || 0, "🎓", "from-purple-500 to-pink-500", "shadow-[0_0_15px_rgba(168,85,247,0.15)] border-purple-500/20 text-purple-500")}
          {renderStatCard("Active Jobs", data?.overview?.totalJobs || 0, "💼", "from-green-500 to-emerald-500", "shadow-[0_0_15px_rgba(34,197,94,0.15)] border-green-500/20 text-green-500")}
          {renderStatCard("Placement Rate", `${data?.overview?.placementRate || 0}%`, "🎯", "from-yellow-500 to-orange-500", "shadow-[0_0_15px_rgba(234,179,8,0.15)] border-yellow-500/20 text-yellow-500")}
        </FadeIn>

        {/* Charts row 1 */}
        <FadeIn delay={0.3} className="grid lg:grid-cols-3 gap-6 mb-6">
          <SpotlightCard className="p-6 lg:col-span-2">
            <h3 className="font-bold text-lg text-foreground tracking-tight mb-6 flex items-center gap-2">
              <span className="text-primary">⚡</span> Top In-Demand Skills
            </h3>
            <div className="relative h-72 w-full">
              <Bar data={skillChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: ChartJS.defaults.borderColor } }, x: { grid: { display: false } } } }} />
            </div>
          </SpotlightCard>
          
          <SpotlightCard className="p-6">
            <h3 className="font-bold text-lg text-foreground tracking-tight mb-6 flex items-center gap-2">
              <span className="text-purple-500">📊</span> Application Stages
            </h3>
            <div className="relative h-64 w-full flex items-center justify-center">
              <Doughnut data={appStatusData} options={{ maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 20, font: { weight: 'bold' } } } } }} />
            </div>
          </SpotlightCard>
        </FadeIn>

        {/* Charts row 2 */}
        <FadeIn delay={0.4} className="grid lg:grid-cols-2 gap-6 mb-6">
          <SpotlightCard className="p-6">
            <h3 className="font-bold text-lg text-foreground tracking-tight mb-6 flex items-center gap-2">
              <span className="text-primary">🏢</span> Jobs by Domain
            </h3>
            <div className="relative h-64 w-full">
              <Bar data={domainChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, indexAxis: 'y', scales: { x: { beginAtZero: true, grid: { color: ChartJS.defaults.borderColor } }, y: { grid: { display: false } } } }} />
            </div>
          </SpotlightCard>
          
          <SpotlightCard className="p-6">
            <h3 className="font-bold text-lg text-foreground tracking-tight mb-6 flex items-center gap-2">
              <span className="text-yellow-500">💼</span> Employment Types
            </h3>
            <div className="relative h-64 w-full flex items-center justify-center">
              <Pie data={jobTypeData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, padding: 20, font: { weight: 'bold' } } } } }} />
            </div>
          </SpotlightCard>
        </FadeIn>

        {/* Lists row */}
        <FadeIn delay={0.5} className="grid lg:grid-cols-2 gap-6">
          <SpotlightCard className="p-6">
            <h3 className="font-bold text-lg text-foreground tracking-tight mb-4 flex items-center gap-2">
              <span className="text-green-500">🏆</span> Top Hiring Companies
            </h3>
            
            <div className="space-y-3 pt-2">
              {(data?.topCompanies || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-medium border border-dashed border-border rounded-xl">No company data available</div>
              ) : (data?.topCompanies || []).slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                      <span className="text-primary font-black text-sm">{c._id?.[0]}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground block leading-tight">{c._id}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Company</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 inline-block mb-1">{c.applications} apps</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{c.jobs} active job{c.jobs !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <h3 className="font-bold text-lg text-foreground tracking-tight mb-4 flex items-center gap-2">
              <span className="text-blue-500">📡</span> Recent Activity
            </h3>
            
            <div className="space-y-4 pt-2">
              {(data?.recentApplications || []).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground font-medium border border-dashed border-border rounded-xl">No recent activity detected</div>
              ) : (data?.recentApplications || []).slice(0, 6).map((app, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                  <div className="mt-1.5 w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-bold text-primary">{app.studentId?.name || 'A user'}</span> applied to the <span className="font-bold text-foreground">{app.jobId?.title || 'Unknown Role'}</span> position.
                    </p>
                    <p className="text-xs font-bold mt-1 text-muted-foreground uppercase opacity-80">{app.jobId?.company || 'Unknown Company'}</p>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </FadeIn>
      </main>
    </div>
  )
}
