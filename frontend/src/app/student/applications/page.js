'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { applicationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FadeIn } from '@/components/ui/FadeIn';
import { AnimatedButton } from '@/components/ui/AnimatedButton';

export default function ApplicationsPage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const loadApps = () => {
    applicationAPI.getMyApplications().then(r => {
      setApps(r.data.applications);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load applications');
      setLoading(false);
    });
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
    
    setWithdrawing(true);
    try {
      await applicationAPI.withdraw(appId);
      toast.success('Application withdrawn successfully');
      setSelectedApp(null);
      loadApps();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const stats = {
    total: apps.length,
    applied: apps.filter(a => a.status === 'Applied').length,
    underReview: apps.filter(a => a.status === 'Under Review').length,
    shortlisted: apps.filter(a => a.status === 'Shortlisted').length,
    rejected: apps.filter(a => a.status === 'Rejected').length,
    accepted: apps.filter(a => a.status === 'Accepted').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Under Review': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Shortlisted': return 'bg-green-500/10 text-green-400 border-green-500/20 shadow-[0_0_15px_rgba(7ade80,0.15)]';
      case 'Accepted': return 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_20px_rgba(var(--primary),0.3)]';
      case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const filteredApps = apps.filter(a => filter === 'All' || a.status === filter);

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
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">My Applications</h1>
            <p className="text-muted-foreground mt-2 font-medium">Track the status of your internships and placements.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2} className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', count: stats.total, color: 'text-foreground' },
            { label: 'Applied', count: stats.applied, color: 'text-yellow-500' },
            { label: 'Under Review', count: stats.underReview, color: 'text-blue-400' },
            { label: 'Shortlisted', count: stats.shortlisted, color: 'text-green-400' },
            { label: 'Accepted', count: stats.accepted, color: 'text-primary' },
            { label: 'Rejected', count: stats.rejected, color: 'text-red-500' }
          ].map(s => (
            <SpotlightCard key={s.label} className="p-4 text-center">
              <p className={`text-3xl font-black ${s.color} drop-shadow-md mb-1`}>{s.count}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
            </SpotlightCard>
          ))}
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl mb-8 overflow-x-auto w-fit border border-border">
            {['All', 'Applied', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${filter === f ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                {f}
              </button>
            ))}
          </div>

          {filteredApps.length === 0 ? (
            <SpotlightCard className="text-center py-24 border-dashed">
              <p className="text-5xl mb-4 drop-shadow-xl opacity-80">📁</p>
              <h3 className="font-bold text-xl mb-2">No applications found</h3>
              <p className="text-muted-foreground text-sm font-medium">You haven't applied to any {filter !== 'All' ? filter.toLowerCase() : ''} jobs yet.</p>
            </SpotlightCard>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app, i) => (
                <SpotlightCard key={i} className="p-5 hover:border-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group cursor-pointer" onClick={() => setSelectedApp(app)}>
                  <div className="flex items-start md:items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                      <span className="text-primary font-black text-lg">{app.jobId?.company?.[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-tight">{app.jobId?.title}</h3>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">{app.jobId?.company} · {app.jobId?.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                    <div className="flex flex-col md:items-end">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Applied On</span>
                      <span className="bg-secondary/50 px-3 py-1 rounded-lg border border-border">{new Date(app.appliedDate || app.createdAt).toLocaleDateString()}</span>
                    </div>
                    {app.matchScore > 0 && (
                      <div className="flex flex-col md:items-end">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Match</span>
                        <span className="bg-primary/10 text-primary border border-primary/20 font-black px-3 py-1 rounded-lg shadow-[0_0_10px_rgba(var(--primary),0.2)]">{app.matchScore}%</span>
                      </div>
                    )}
                    <div className="flex flex-col md:items-end">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Status</span>
                      <span className={`px-3 py-1 rounded-lg font-bold border ${getStatusColor(app.status)}`}>{app.status}</span>
                    </div>

                    <div className="flex items-center gap-2 md:ml-4 border-l border-border/50 pl-4">
                      {app.status === 'Applied' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWithdraw(app._id);
                          }}
                          disabled={withdrawing}
                          className="px-4 py-1.5 rounded-lg text-xs font-bold border border-red-500/20 text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        >
                          Withdraw
                        </button>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}
        </FadeIn>

        {selectedApp && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <SpotlightCard className="p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-primary/20">
              <div className="flex justify-between items-start mb-6 border-b border-border/50 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    <span className="text-primary font-black text-xl">{selectedApp.jobId?.company?.[0]}</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-xl leading-tight">{selectedApp.jobId?.title}</h2>
                    <p className="text-muted-foreground font-medium text-sm mt-0.5">{selectedApp.jobId?.company} · {selectedApp.jobId?.type}</p>
                    <span className={`inline-block mt-3 px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(selectedApp.status)}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="text-muted-foreground hover:text-foreground text-3xl leading-none ml-4 transition-colors">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/40 border border-border rounded-xl p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Applied Date</p>
                  <p className="font-bold">{new Date(selectedApp.appliedDate || selectedApp.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="bg-secondary/40 border border-border rounded-xl p-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">AI Match Score</p>
                  <p className="font-black text-primary drop-shadow-sm">{selectedApp.matchScore > 0 ? `${selectedApp.matchScore}%` : 'N/A'}</p>
                </div>
              </div>

              {selectedApp.coverLetter && (
                <div className="mb-6">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Your Cover Letter</p>
                  <p className="text-sm font-medium leading-relaxed bg-secondary/30 p-5 rounded-xl border border-border/50 whitespace-pre-wrap">{selectedApp.coverLetter}</p>
                </div>
              )}

              {selectedApp.recruiterNote && (
                <div className="mb-8 p-5 bg-primary/10 border border-primary/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -mr-8 -mt-8" />
                  <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2 relative z-10 flex items-center gap-2">
                    <span>💬</span> Recruiter Feedback
                  </p>
                  <p className="text-sm font-medium text-primary/90 leading-relaxed relative z-10 italic">{selectedApp.recruiterNote}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setSelectedApp(null)} className="bg-secondary text-foreground hover:bg-secondary/80 font-bold py-3 px-6 rounded-xl transition-colors border border-border">Close</button>
                {selectedApp.status === 'Applied' && (
                  <button onClick={() => handleWithdraw(selectedApp._id)} disabled={withdrawing} className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold py-3 rounded-xl transition-colors border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                  </button>
                )}
              </div>
            </SpotlightCard>
          </div>
        )}
      </main>
    </div>
  );
}
