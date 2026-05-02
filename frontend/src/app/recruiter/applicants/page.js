'use client'
import { useState, useEffect, Suspense } from 'react'
import Sidebar from '@/components/Sidebar'
import { jobAPI, applicationAPI } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

const STATUS_COLORS = {
  Applied: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Under Review': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Shortlisted: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  Accepted: 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]'
}
const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Accepted']
const STATUS_ICONS = { Applied: '📨', 'Under Review': '🔍', Shortlisted: '⭐', Rejected: '❌', Accepted: '✅' }

function ApplicantsContent() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [applicantsLoading, setApplicantsLoading] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [note, setNote] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [stagedStatus, setStagedStatus] = useState(null)
  const params = useSearchParams()

  useEffect(() => {
    jobAPI.getMyJobs()
      .then(r => {
        const jobList = r.data.jobs || []
        setJobs(jobList)
        const preselected = params.get('jobId')
        const firstId = preselected || jobList[0]?._id
        if (firstId) {
          setSelectedJobId(firstId)
          loadApplicants(firstId)
        }
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load your jobs')
      })
      .finally(() => setLoading(false))
  }, [params])

  const loadApplicants = async (jobId) => {
    setApplicantsLoading(true)
    setApplicants([])
    try {
      const r = await jobAPI.getApplicants(jobId)
      setApplicants(r.data.applications || [])
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load applicants')
    } finally {
      setApplicantsLoading(false)
    }
  }

  const selectJob = (jobId) => {
    setSelectedJobId(jobId)
    loadApplicants(jobId)
  }

  const updateStatus = async (appId, status) => {
    setUpdatingStatus(status)
    try {
      await applicationAPI.updateStatus(appId, { status, note })
      setApplicants(apps => apps.map(a => a._id === appId ? { ...a, status, recruiterNote: note } : a))
      setSelectedApp(null)
      setNote('')
      toast.success(`Status updated to "${status}"`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
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
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Applicant Tracking</h1>
            <p className="text-muted-foreground font-medium mt-1">Review candidates and manage your recruitment pipeline.</p>
          </div>
        </FadeIn>

        {jobs.length === 0 ? (
          <FadeIn delay={0.2}>
            <SpotlightCard className="text-center py-24 border-dashed">
              <p className="text-5xl mb-4 drop-shadow-xl opacity-80">📋</p>
              <h3 className="font-bold text-xl mb-2">No jobs posted yet</h3>
              <p className="text-muted-foreground text-sm font-medium mb-6">Create a job posting to start receiving applications.</p>
              <a href="/recruiter/post-job">
                <AnimatedButton variant="primary" className="h-12 px-8 font-bold">Post a Job</AnimatedButton>
              </a>
            </SpotlightCard>
          </FadeIn>
        ) : (
          <>
            <FadeIn delay={0.2}>
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2 custom-scrollbar">
                {jobs.map(job => (
                  <button
                    key={job._id}
                    onClick={() => selectJob(job._id)}
                    className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold border transition-all duration-300 ${
                      selectedJobId === job._id
                        ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]'
                        : 'bg-secondary/40 text-muted-foreground border-border hover:border-primary/50 hover:bg-secondary/80 hover:text-foreground'
                    }`}
                  >
                    <span className="truncate max-w-[200px]">{job.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border ${
                      selectedJobId === job._id ? 'bg-primary-foreground/20 border-transparent text-primary-foreground' : 'bg-background border-border text-muted-foreground'
                    }`}>
                      {job.applicationCount || 0}
                    </span>
                  </button>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <h2 className="text-xl font-bold tracking-tight">
                    {applicants.length} Candidate{applicants.length !== 1 ? 's' : ''}
                  </h2>
                  <div className="flex gap-2 flex-wrap bg-secondary/30 p-1.5 rounded-xl border border-border">
                    {STATUSES.map(s => {
                      const count = applicants.filter(a => a.status === s).length;
                      if(count === 0) return null;
                      return (
                        <span key={s} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${STATUS_COLORS[s]} flex items-center gap-1.5`}>
                          <span>{STATUS_ICONS[s]}</span>
                          {s} <span className="opacity-70 ml-1">({count})</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {applicantsLoading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-secondary/50 rounded-2xl animate-pulse" />)}
                  </div>
                ) : applicants.length === 0 ? (
                  <SpotlightCard className="text-center py-20 border-dashed">
                    <p className="text-5xl mb-4 drop-shadow-xl opacity-80">👥</p>
                    <h3 className="font-bold text-xl mb-2">No applicants yet</h3>
                    <p className="text-muted-foreground text-sm font-medium">Candidates will appear here once they start applying.</p>
                  </SpotlightCard>
                ) : (
                  <div className="space-y-4">
                    {applicants.map(app => (
                      <SpotlightCard key={app._id} className="p-5 hover:border-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group">
                        
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-14 h-14 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <span className="text-primary font-black text-xl">
                              {app.studentId?.name?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-lg text-foreground truncate">{app.studentId?.name || 'Unknown Candidate'}</p>
                            <p className="text-sm font-medium text-muted-foreground truncate">{app.studentId?.email}</p>

                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              {app.studentProfile?.college && (
                                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 bg-secondary/60 px-2 py-1 rounded-md border border-border">
                                  🏛 {app.studentProfile.college}
                                </span>
                              )}
                              {app.studentProfile?.cgpa > 0 && (
                                <span className={`text-xs font-black px-2 py-1 rounded-md border ${
                                  app.studentProfile.cgpa >= 8 ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  app.studentProfile.cgpa >= 7 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  'bg-secondary text-muted-foreground border-border'}`}>
                                  CGPA {app.studentProfile.cgpa}
                                </span>
                              )}
                              <span className="text-xs font-bold text-muted-foreground opacity-60">
                                Applied: {new Date(app.appliedDate || app.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            {app.studentProfile?.technicalSkills?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {app.studentProfile.technicalSkills.slice(0, 6).map(s => (
                                  <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                                    {s}
                                  </span>
                                ))}
                                {app.studentProfile.technicalSkills.length > 6 && (
                                  <span className="text-[10px] font-bold text-muted-foreground px-1 py-1">+{app.studentProfile.technicalSkills.length - 6} more</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 flex-shrink-0 md:pl-4 md:border-l md:border-border/50">
                          {app.matchScore > 0 && (
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Match Score</span>
                              <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
                                {app.matchScore}%
                              </span>
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center mx-2">
                             <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</span>
                             <span className={`text-xs font-bold px-3 py-1 rounded-lg border whitespace-nowrap ${STATUS_COLORS[app.status]}`}>
                                {STATUS_ICONS[app.status]} {app.status}
                             </span>
                          </div>

                          <div className="flex flex-col gap-2">
                            {app.studentProfile?.resume && (
                              <a
                                href={`http://localhost:5000${app.studentProfile.resume}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-1.5 rounded-lg text-xs font-bold border border-primary/20 text-primary bg-primary/10 hover:bg-primary/20 transition-colors shadow-[0_0_10px_rgba(var(--primary),0.1)] text-center flex items-center justify-center gap-1"
                              >
                                📄 Resume
                              </a>
                            )}
                            <button
                              onClick={() => { setSelectedApp(app); setNote(app.recruiterNote || ''); setStagedStatus(app.status); }}
                              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
                            >
                              Update Status
                            </button>
                          </div>
                        </div>

                      </SpotlightCard>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          </>
        )}

        {/* Status Update Modal */}
        {selectedApp && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <SpotlightCard className="p-8 max-w-md w-full shadow-2xl border-primary/20">
              
              <div className="flex justify-between items-start mb-6">
                 <h2 className="font-extrabold text-xl tracking-tight">Review Candidate</h2>
                 <button onClick={() => { setSelectedApp(null); setNote(''); setStagedStatus(null); }} className="text-muted-foreground hover:text-foreground text-3xl leading-none transition-colors">&times;</button>
              </div>

              {/* Candidate Quick Info */}
              <div className="flex items-center gap-4 p-4 bg-secondary/40 border border-border rounded-xl mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/30">
                  <span className="text-primary font-black text-lg">
                    {selectedApp.studentId?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base truncate">{selectedApp.studentId?.name}</p>
                  <p className="text-xs font-medium text-muted-foreground truncate">{selectedApp.studentId?.email}</p>
                </div>
              </div>

              {selectedApp.coverLetter && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cover Letter</p>
                  <div className="p-3 bg-secondary/30 rounded-xl border border-border/50 text-sm italic overflow-hidden max-h-32 overflow-y-auto">
                    "{selectedApp.coverLetter}"
                  </div>
                </div>
              )}

              {/* Status Selector */}
              <div className="mb-6">
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Update Stage</p>
                 <div className="grid grid-cols-2 gap-2">
                   {STATUSES.map(s => (
                     <button
                       key={s}
                       onClick={() => setStagedStatus(s)}
                       disabled={updatingStatus !== null}
                       className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all duration-200 text-left flex items-center gap-2 ${
                         stagedStatus === s
                           ? STATUS_COLORS[s] + ' shadow-lg border-current ring-1 ring-current cursor-default'
                           : 'bg-secondary/40 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed'
                       }`}
                     >
                       <span className="text-base">{STATUS_ICONS[s]}</span> 
                       {s}
                     </button>
                   ))}
                 </div>
              </div>

              {/* Note input */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Feedback Note <span className="opacity-60 lowercase font-medium tracking-normal">(Visible to candidate)</span>
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none text-sm"
                  placeholder="e.g. Schedule for technical round on Friday..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setSelectedApp(null); setNote(''); setStagedStatus(null); }}
                  className="flex-1 w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 rounded-xl transition-colors border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(selectedApp._id, stagedStatus)}
                  disabled={stagedStatus === selectedApp.status && note === (selectedApp.recruiterNote || '')}
                  className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </SpotlightCard>
          </div>
        )}

        {/* Full Screen Saving Block Overlay */}
        {updatingStatus && (
          <div className="fixed inset-0 z-[100] bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
            <svg className="animate-spin h-12 w-12 text-primary mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-foreground font-bold text-lg animate-pulse tracking-wide">
              Saving {updatingStatus} status...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

// Next.js requires Suspense around useSearchParams when not statically pre-rendering
export default function ApplicantsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-background pl-64 text-foreground">
        <Sidebar />
        <main className="flex-1 p-8 lg:p-12"><div className="animate-pulse space-y-6">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-secondary/50 rounded-2xl" />)}</div></main>
      </div>
    }>
      <ApplicantsContent />
    </Suspense>
  )
}
