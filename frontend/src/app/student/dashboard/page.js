'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { studentAPI, recommendationAPI, applicationAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Zap, ClipboardList, Star, CheckCircle, ExternalLink, Activity } from 'lucide-react';
import { FadeIn } from '@/components/ui/FadeIn';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState({ internships: [], placements: [] });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(null);
  const [applyScore, setApplyScore] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');

  const openApply = (job, score = 0) => { setApplying(job); setApplyScore(score); };

  const handleApply = async () => {
    if (!applying) return;
    try {
      await applicationAPI.apply({ jobId: applying._id, coverLetter, matchScore: applyScore });
      toast.success('Application submitted! 🎉');
      setApplying(null);
      setCoverLetter('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to apply');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, recRes] = await Promise.all([
          studentAPI.getDashboard(),
          recommendationAPI.getRecommendations(user._id)
        ]);
        setStats(dashRes.data.stats);
        setRecommendations(recRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) load();
  }, [user]);

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {user?.name?.split(' ')[0]} <span className="inline-block hover:animate-ping origin-bottom-right">👋</span></h1>
            <p className="text-muted-foreground mt-2 text-lg">Here's your placement readiness overview</p>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse h-36 bg-secondary/50 border border-border" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <FadeIn delay={0.2}><StatCard title="Total Skills" value={stats?.totalSkills || 0} icon={<Zap size={24}/>} color="primary" /></FadeIn>
            <FadeIn delay={0.3}><StatCard title="Applications" value={stats?.totalApplications || 0} icon={<ClipboardList size={24}/>} color="purple" /></FadeIn>
            <FadeIn delay={0.4}><StatCard title="Shortlisted" value={stats?.shortlisted || 0} icon={<Star size={24}/>} color="yellow" /></FadeIn>
            <FadeIn delay={0.5}><StatCard title="Accepted" value={stats?.accepted || 0} icon={<CheckCircle size={24}/>} color="green" /></FadeIn>
          </div>
        )}

        {/* Profile completion */}
        {stats && stats.profileComplete < 100 && (
          <FadeIn delay={0.55}>
            <SpotlightCard className="mb-10 from-primary/10 to-transparent bg-gradient-to-r border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mt-1">A complete profile gets 3x more AI matches 🚀</p>
                </div>
                <span className="text-4xl font-black text-primary">{stats.profileComplete}%</span>
              </div>
              <div className="w-full bg-secondary/50 rounded-full h-3 border border-border/50 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${stats.profileComplete}%` }} />
              </div>
              <Link href="/student/profile" className="inline-block mt-6 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity">
                Complete Profile →
              </Link>
            </SpotlightCard>
          </FadeIn>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Top internships */}
          <FadeIn delay={0.6}>
            <SpotlightCard className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="text-primary" size={20} />
                  <h2 className="text-xl font-bold tracking-tight">Top AI Matches</h2>
                </div>
                <Link href="/student/recommendations" className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
                  View all <ExternalLink size={14} />
                </Link>
              </div>
              <div className="space-y-4 text-left">
              {recommendations.internships?.slice(0, 3).map((rec, i) => (
                <div key={i} onClick={() => setSelectedJob(rec)} className="flex items-center gap-4 py-4 px-4 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-black text-sm">{rec.job?.company?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-foreground truncate">{rec.job?.title}</p>
                    <p className="text-sm text-muted-foreground font-medium">{rec.job?.company}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${rec.matchScore >= 80 ? 'text-green-500' : rec.matchScore >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {rec.matchScore}%
                    </span>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Match</p>
                  </div>
                </div>
              ))}
              {!loading && !recommendations.internships?.length && (
                <div className="text-center py-10 bg-secondary/30 rounded-xl border border-dashed border-border">
                  <p className="text-sm text-muted-foreground font-medium">Complete your profile to unlock AI recommendations.</p>
                </div>
              )}
              </div>
            </SpotlightCard>
          </FadeIn>

          {/* CGPA card */}
          <FadeIn delay={0.7}>
            <SpotlightCard className="h-full flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-bold tracking-tight w-full text-left mb-8">Academic Standing</h2>
              <div className="relative w-40 h-40 mx-auto mb-6 group">
                <svg className="w-40 h-40 transform -rotate-90 drop-shadow-2xl" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" className="stroke-secondary" strokeWidth="8" />
                  <circle cx="60" cy="60" r="50" fill="none" className="stroke-primary" strokeWidth="8"
                    strokeDasharray={`${(stats?.cgpa / 10) * 314} 314`} strokeLinecap="round" 
                    style={{ transition: 'stroke-dasharray 1.5s ease-out' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-4xl font-black text-foreground">{stats?.cgpa?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-1">CGPA</span>
                </div>
              </div>
              <p className="text-base font-medium px-4 py-2 bg-secondary/50 rounded-full border border-border">
                {stats?.cgpa >= 8 ? '🌟 Excellent Academic Performance' :
                 stats?.cgpa >= 7 ? '✅ Good Academic Performance' :
                 stats?.cgpa >= 6 ? '📈 Average Performance' : '⚠ Consider Improving CGPA'}
              </p>
            </SpotlightCard>
          </FadeIn>
        </div>

        {applying && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <SpotlightCard className="p-8 max-w-md w-full shadow-2xl border-primary/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                  <span className="text-primary font-black text-lg">{applying.company?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="font-bold text-lg truncate leading-tight">{applying.title}</h2>
                  <p className="text-muted-foreground text-sm font-medium mt-0.5">{applying.company} · {applying.type}</p>
                </div>
                {applyScore > 0 && <span className="text-2xl font-black text-primary flex-shrink-0 drop-shadow-md">{applyScore}%</span>}
              </div>
              <label className="block text-sm font-bold mb-2">Cover Letter <span className="text-muted-foreground font-medium ml-1">(Optional)</span></label>
              <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6 font-medium text-sm" placeholder="Tell them why you're a great fit..." />
              <div className="flex gap-3">
                <button onClick={() => { setApplying(null); setCoverLetter(''); }} className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 font-bold py-2.5 rounded-xl transition-colors border border-border">Cancel</button>
                <button onClick={handleApply} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(var(--primary),0.4)]">Submit Application</button>
              </div>
            </SpotlightCard>
          </div>
        )}

        {selectedJob && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <SpotlightCard className="p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-primary/20">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    <span className="text-primary font-black text-xl">{selectedJob.job?.company?.[0]}</span>
                  </div>
                  <div className="pt-1">
                    <h2 className="font-bold text-xl leading-tight">{selectedJob.job?.title}</h2>
                    <p className="text-muted-foreground font-medium text-sm mt-0.5">{selectedJob.job?.company} · {selectedJob.job?.location}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-secondary border border-border px-2.5 py-1 rounded-md">{selectedJob.job?.type}</span>
                      {selectedJob.job?.isRemote && <span className="text-[10px] uppercase font-bold tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md">Remote</span>}
                      {selectedJob.job?.domain && <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md">{selectedJob.job.domain}</span>}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-muted-foreground hover:text-foreground text-3xl leading-none ml-4 transition-colors p-1">&times;</button>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="flex items-end justify-between mb-3 relative z-10">
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">AI Match Score</span>
                  <span className="text-4xl font-black text-primary drop-shadow-md">{selectedJob.matchScore}%</span>
                </div>
                <div className="w-full bg-primary/10 rounded-full h-2 mb-3 relative z-10 overflow-hidden">
                  <div className="bg-primary h-2 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]" style={{ width: `${selectedJob.matchScore}%` }} />
                </div>
                <p className="text-sm font-medium text-primary/80 relative z-10 leading-relaxed italic">{selectedJob.explanation}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Job Description</p>
                <p className="text-sm font-medium leading-relaxed bg-secondary/30 p-4 rounded-xl border border-border/50">{selectedJob.job?.description}</p>
              </div>

              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(selectedJob.job?.skillsRequired || []).map(s => {
                    const matched = selectedJob.matchedSkills?.map(x => x.toLowerCase()).includes(s.toLowerCase());
                    return (
                      <span key={s} className={`text-xs font-bold px-3 py-1.5 rounded-md border ${matched ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                        {matched ? '✓' : '⚠'} {s}
                      </span>
                    );
                  })}
                </div>
              </div>

              {(selectedJob.job?.stipend || selectedJob.job?.salary || selectedJob.job?.duration || selectedJob.job?.openings) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {(selectedJob.job.stipend || selectedJob.job.salary) && (
                    <div className="bg-secondary/50 border border-border rounded-xl p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Compensation</p>
                      <p className="font-bold text-green-400 text-sm tracking-tight">{selectedJob.job.stipend || selectedJob.job.salary}</p>
                    </div>
                  )}
                  {selectedJob.job.duration && (
                    <div className="bg-secondary/50 border border-border rounded-xl p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Duration</p>
                      <p className="font-bold text-sm">{selectedJob.job.duration}</p>
                    </div>
                  )}
                  {selectedJob.job.openings && (
                    <div className="bg-secondary/50 border border-border rounded-xl p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Openings</p>
                      <p className="font-bold text-sm">{selectedJob.job.openings}</p>
                    </div>
                  )}
                  {selectedJob.job.minCgpa > 0 && (
                    <div className="bg-secondary/50 border border-border rounded-xl p-3">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Min CGPA</p>
                      <p className="font-bold text-sm">{selectedJob.job.minCgpa}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setSelectedJob(null)} className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 font-bold py-3 rounded-xl transition-colors border border-border">Close</button>
                <button onClick={() => { openApply(selectedJob.job, selectedJob.matchScore); setSelectedJob(null); }} className="flex-[2] bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(var(--primary),0.3)]">Apply Now</button>
              </div>
            </SpotlightCard>
          </div>
        )}
      </main>
    </div>
  );
}
