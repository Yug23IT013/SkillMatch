'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { recommendationAPI, applicationAPI, studentAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FadeIn } from '@/components/ui/FadeIn';

const CATEGORY_COLORS = {
  Hot: 'bg-red-500/20 text-red-500 border-red-500/20',
  Rising: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  Emerging: 'bg-blue-500/20 text-blue-500 border-blue-500/20'
};

function MatchBadge({ score }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Low';
  const bgLabel = score >= 80 ? 'bg-green-500/20 text-green-500' : score >= 60 ? 'bg-yellow-500/20 text-yellow-500' : score >= 40 ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500';
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90 drop-shadow-xl" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" className="stroke-secondary" strokeWidth="4" />
          <circle cx="22" cy="22" r="18" fill="none" stroke={color}
            strokeWidth="4" strokeDasharray={`${(score / 100) * 113} 113`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-foreground">{score}%</span>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgLabel}`}>{label}</span>
    </div>
  );
}

function JobCard({ rec, onApply, onView, showResumeBar, isBookmarked, onBookmark }) {
  const [bookmarking, setBookmarking] = useState(false);

  const handleBookmark = async (e) => {
    e.stopPropagation();
    setBookmarking(true);
    try {
      await onBookmark(rec.job._id);
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <SpotlightCard className="p-5 flex flex-col h-full cursor-pointer hover:border-primary/40 transition-colors" onClick={() => onView(rec)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 bg-primary/20 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-black text-lg">{rec.job?.company?.[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-foreground text-base leading-tight truncate">{rec.job?.title}</p>
            <p className="text-sm font-medium text-muted-foreground mt-0.5">{rec.job?.company} · {rec.job?.type} · {rec.job?.location}</p>
            {(rec.job?.stipend || rec.job?.salary) && (
              <p className="text-sm text-green-400 font-bold mt-1 tracking-tight">{rec.job.stipend || rec.job.salary}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this job'}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${
              isBookmarked
                ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                : 'bg-secondary/50 border-border text-muted-foreground hover:border-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/10'
            }`}>
            {bookmarking ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
          <MatchBadge score={rec.matchScore} />
        </div>
      </div>

      {showResumeBar && rec.resumeMatchCount !== undefined && (
        <div className="mb-4 bg-secondary/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume Coverage</span>
            <span className="text-xs font-black text-primary">{rec.resumeMatchCount}/{rec.totalRequired} skills</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]"
              style={{ width: `${Math.round((rec.resumeMatchCount / Math.max(rec.totalRequired, 1)) * 100)}%` }} />
          </div>
        </div>
      )}

      {rec.explanation && (
        <p className="text-sm text-muted-foreground italic mb-4 line-clamp-2 bg-secondary/50 p-2.5 rounded-lg border-l-2 border-primary/50">{rec.explanation}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
        {rec.matchedSkills?.slice(0, 3).map(s => (
          <span key={s} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md font-medium">✓ {s}</span>
        ))}
        {rec.missingSkills?.slice(0, 2).map(s => (
          <span key={s} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-md font-medium">⚠ {s}</span>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={(e) => { e.stopPropagation(); onView(rec); }} className="flex-1 text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-xl transition-colors border border-border">Details</button>
        <button onClick={(e) => { e.stopPropagation(); onApply(rec.job, rec.matchScore); }} className="flex-1 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(var(--primary),0.2)]">Apply Now</button>
      </div>
    </SpotlightCard>
  );
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('resume');
  const [recData, setRecData] = useState({ internships: [], placements: [] });
  const [resumeData, setResumeData] = useState({ internships: [], placements: [], resumeSkills: [] });
  const [marketSkills, setMarketSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumeJobTab, setResumeJobTab] = useState('internships');
  const [applying, setApplying] = useState(null);
  const [applyScore, setApplyScore] = useState(0);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    if (!user?._id) return;
    const load = async () => {
      try {
        const [recRes, resumeRes, marketRes, skillRes, bmRes] = await Promise.all([
          recommendationAPI.getRecommendations(user._id),
          recommendationAPI.getResumeRecommendations(),
          recommendationAPI.getMarketSkills(),
          recommendationAPI.getMissingSkills(),
          studentAPI.getBookmarks()
        ]);
        setRecData(recRes.data);
        setResumeData(resumeRes.data);
        setMarketSkills(marketRes.data.demandedSkills || []);
        setMissingSkills(skillRes.data.suggestions || []);
        setBookmarkedIds(new Set((bmRes.data.bookmarks || []).map(j => j._id)));
      } catch (e) {
        toast.error('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleBookmark = useCallback(async (jobId) => {
    try {
      const res = await studentAPI.bookmarkJob(jobId);
      const { bookmarked } = res.data;
      // Update state — keep this pure (no side effects inside the updater)
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (bookmarked) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
      // Toast outside the updater — avoids StrictMode double-fire
      if (bookmarked) toast.success('Job bookmarked 🔖');
      else toast('Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
  }, []);

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

  const navTabs = [
    { id: 'resume', label: 'From Resume', icon: '📄' },
    { id: 'internships', label: 'Internships', icon: '🎓', count: recData.internships?.length },
    { id: 'placements', label: 'Placements', icon: '💼', count: recData.placements?.length },
    { id: 'skills', label: 'Market Skills', icon: '📈' }
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Smart Recommendations</h1>
            <p className="text-muted-foreground mt-2 font-medium">AI-powered matches based on your resume, skills, and profile.</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl mb-8 w-fit backdrop-blur-md border border-border overflow-x-auto">
            {navTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 whitespace-nowrap
                  ${tab === t.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                <span className="text-base">{t.icon}</span>
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-md font-black ${tab === t.id ? 'bg-secondary/40 text-primary-foreground' : 'bg-background text-muted-foreground'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-secondary/50 border border-border animate-pulse rounded-2xl" />)}
          </div>
        ) : (
          <div className="w-full">
            {tab === 'resume' && (
              <FadeIn delay={0.3}>
                <div className="flex gap-2 bg-secondary/40 p-1.5 rounded-xl mb-6 w-fit border border-border/50">
                  {['internships', 'placements'].map(rt => (
                    <button key={rt} onClick={() => setResumeJobTab(rt)}
                      className={`px-6 py-2 text-sm font-bold rounded-lg capitalize transition-all ${resumeJobTab === rt ? 'bg-background text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'}`}>
                      {rt} ({(resumeData[rt]?.length) || 0})
                    </button>
                  ))}
                </div>

                {(resumeData[resumeJobTab] || []).length === 0 ? (
                  <SpotlightCard className="text-center py-20 border-dashed">
                    <p className="text-5xl mb-4 drop-shadow-xl">📄</p>
                    <h3 className="font-bold text-xl mb-2">No resume-based matches yet</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">Add technical skills, soft skills, and projects to your profile to unlock resume-based recommendations.</p>
                  </SpotlightCard>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {resumeData[resumeJobTab].map((rec, i) => (
                      <JobCard key={i} rec={rec} showResumeBar onApply={openApply} onView={setSelectedJob}
                        isBookmarked={bookmarkedIds.has(rec.job?._id)} onBookmark={handleBookmark} />
                    ))}
                  </div>
                )}
              </FadeIn>
            )}

            {tab === 'internships' && (
              <FadeIn delay={0.3}>
                {missingSkills.length > 0 && (
                  <SpotlightCard className="mb-8 bg-orange-500/10 border-orange-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl drop-shadow-md">💡</span>
                      <h3 className="font-bold text-orange-400 text-lg">Skill Gaps to Close</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {missingSkills.slice(0, 8).map((s, i) => (
                        <span key={i} className={`text-xs font-bold px-3 py-1.5 rounded-md border shadow-sm ${
                          s.priority === 'High' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          s.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' :
                          'bg-secondary text-muted-foreground border-border'}`}>
                          {s.priority === 'High' ? '🔥' : '⚡'} {s.skill} <span className="opacity-60 ml-1">· {s.demandCount} jobs</span>
                        </span>
                      ))}
                    </div>
                  </SpotlightCard>
                )}
                {recData.internships.length === 0 ? (
                  <SpotlightCard className="text-center py-20 border-dashed"><p className="text-5xl mb-4 drop-shadow-xl">🎓</p><h3 className="font-bold text-xl">No internship matches</h3><p className="text-sm font-medium text-muted-foreground mt-2">Complete your profile to get matched</p></SpotlightCard>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recData.internships.map((rec, i) => (
                      <JobCard key={i} rec={rec} onApply={openApply} onView={setSelectedJob}
                        isBookmarked={bookmarkedIds.has(rec.job?._id)} onBookmark={handleBookmark} />
                    ))}
                  </div>
                )}
              </FadeIn>
            )}

            {tab === 'placements' && (
              <FadeIn delay={0.3}>
                {recData.placements.length === 0 ? (
                  <SpotlightCard className="text-center py-20 border-dashed"><p className="text-5xl mb-4 drop-shadow-xl">💼</p><h3 className="font-bold text-xl">No placement matches</h3><p className="text-sm font-medium text-muted-foreground mt-2">Complete your profile to get matched</p></SpotlightCard>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {recData.placements.map((rec, i) => (
                      <JobCard key={i} rec={rec} onApply={openApply} onView={setSelectedJob}
                        isBookmarked={bookmarkedIds.has(rec.job?._id)} onBookmark={handleBookmark} />
                    ))}
                  </div>
                )}
              </FadeIn>
            )}

            {tab === 'skills' && (
              <FadeIn delay={0.3} className="space-y-6">
                <SpotlightCard className="flex items-center gap-4 flex-wrap p-5">
                  <span className="text-sm font-bold tracking-tight text-muted-foreground uppercase">Demand Level:</span>
                  {Object.entries(CATEGORY_COLORS).map(([cat, cls]) => (
                    <span key={cat} className={`text-xs font-black px-3 py-1 rounded-md border ${cls}`}>{cat}</span>
                  ))}
                </SpotlightCard>

                <SpotlightCard className="p-6">
                  <h2 className="font-bold text-xl mb-6">Most In-Demand Market Skills</h2>
                  <div className="space-y-6">
                    {marketSkills.map((s, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-muted-foreground/50 w-6 text-right">{i + 1}.</span>
                            <span className="text-base font-bold capitalize">{s.skill}</span>
                            <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-sm border ${CATEGORY_COLORS[s.category]}`}>{s.category}</span>
                          </div>
                          <div className="text-right flex items-baseline gap-1">
                            <span className="text-base font-black">{s.demandPercent}%</span>
                            <span className="text-xs font-semibold text-muted-foreground">of jobs</span>
                          </div>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden border border-border/50">
                          <div className={`h-2 rounded-full transition-all duration-1000 ${s.category === 'Hot' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : s.category === 'Rising' ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`}
                            style={{ width: `${s.demandPercent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              </FadeIn>
            )}
          </div>
        )}

        {/* Apply Modal */}
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

        {/* Job Detail Modal */}
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
                      <p className="font-black text-green-400 text-sm tracking-tight">{selectedJob.job.stipend || selectedJob.job.salary}</p>
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
