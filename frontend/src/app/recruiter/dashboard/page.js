'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { jobAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    jobAPI.getMyJobs().then(r => {
      setJobs(r.data.jobs)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const totalApps = jobs.reduce((sum, j) => sum + (j.applicationCount || 0), 0)
  const activeJobs = jobs.filter(j => j.isActive).length

  if (loading) return (
    <div className="flex min-h-screen bg-background pl-64 text-foreground">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12"><div className="animate-pulse space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-secondary/50 rounded-2xl" />)}</div></main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <FadeIn delay={0.1}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Recruiter Dashboard</h1>
              <p className="text-muted-foreground font-medium mt-1">Manage your job postings and incoming applications.</p>
            </div>
            <Link href="/recruiter/post-job">
              <AnimatedButton variant="primary" className="h-12 px-6 font-bold shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                + Post New Job
              </AnimatedButton>
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]">📋</div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Postings</p>
                <p className="text-3xl font-black text-foreground drop-shadow-md">{jobs.length}</p>
              </div>
            </div>
          </SpotlightCard>
          
          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">✅</div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Active Jobs</p>
                <p className="text-3xl font-black text-green-400 drop-shadow-md">{activeJobs}</p>
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">👥</div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Applications</p>
                <p className="text-3xl font-black text-purple-400 drop-shadow-md">{totalApps}</p>
              </div>
            </div>
          </SpotlightCard>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-4">Your Job Postings</h2>
            
            {jobs.length === 0 ? (
              <SpotlightCard className="text-center py-24 border-dashed">
                <p className="text-5xl mb-4 drop-shadow-xl opacity-80">📝</p>
                <h3 className="font-bold text-xl mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground text-sm font-medium mb-6">Create your first job posting to start attracting top talent.</p>
                <Link href="/recruiter/post-job">
                  <AnimatedButton variant="primary" className="h-12 px-8 font-bold">
                    Create First Job
                  </AnimatedButton>
                </Link>
              </SpotlightCard>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <SpotlightCard key={job._id} className="p-5 hover:border-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group">
                    <div className="flex items-start md:items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                        <span className="text-primary font-black text-lg">{job.company?.[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-0.5">{job.company} • {job.location} • <span className="capitalize">{job.type}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                      <div className="flex flex-col md:items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Status</span>
                        <span className={`px-3 py-1 rounded-lg font-bold border ${job.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex flex-col md:items-end border-l border-border/50 pl-4">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Applicants</span>
                        <span className="font-black text-lg">{job.applicationCount || 0}</span>
                      </div>
                      
                      <div className="flex items-center md:ml-4 border-l border-border/50 pl-4 h-full">
                        <Link href={`/recruiter/applicants?jobId=${job._id}`}>
                          <button className="px-4 py-2 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border">
                            Review Applicants
                          </button>
                        </Link>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </main>
    </div>
  )
}
