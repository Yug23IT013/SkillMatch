'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { studentAPI, applicationAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FadeIn } from '@/components/ui/FadeIn';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    studentAPI.getBookmarks()
      .then(r => setBookmarks(r.data.bookmarks || []))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (jobId) => {
    setRemoving(jobId);
    try {
      await studentAPI.bookmarkJob(jobId);
      setBookmarks(prev => prev.filter(j => j._id !== jobId));
      toast('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    } finally {
      setRemoving(null);
    }
  };

  const handleApply = async () => {
    if (!applying) return;
    try {
      await applicationAPI.apply({ jobId: applying._id, coverLetter, matchScore: 0 });
      toast.success('Application submitted! 🎉');
      setApplying(null);
      setCoverLetter('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to apply');
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="flex items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Saved Jobs</h1>
              <p className="text-muted-foreground font-medium mt-1">Your bookmarked opportunities, all in one place.</p>
            </div>
            <span className="ml-auto text-xs font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1.5 rounded-full">
              🔖 {bookmarks.length} saved
            </span>
          </div>
        </FadeIn>

        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-secondary/50 border border-border animate-pulse rounded-2xl" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <FadeIn delay={0.2}>
            <SpotlightCard className="text-center py-24 border-dashed">
              <p className="text-6xl mb-4">🔖</p>
              <h3 className="font-bold text-xl mb-2">No saved jobs yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
                Bookmark jobs from the Recommendations page and they'll appear here.
              </p>
              <a href="/student/recommendations"
                className="inline-block mt-6 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                Browse Recommendations →
              </a>
            </SpotlightCard>
          </FadeIn>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookmarks.map(job => (
              <FadeIn key={job._id} delay={0.1}>
                <SpotlightCard className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                      <span className="text-yellow-400 font-black text-lg">{job.company?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-base leading-tight truncate">{job.title}</p>
                      <p className="text-sm font-medium text-muted-foreground mt-0.5">{job.company} · {job.type}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{job.location}</p>
                    </div>
                    <span className="text-yellow-400 text-lg flex-shrink-0">🔖</span>
                  </div>

                  {/* Compensation + Domain */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(job.stipend || job.salary) && (
                      <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md font-bold">
                        {job.stipend || job.salary}
                      </span>
                    )}
                    {job.domain && (
                      <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-bold">
                        {job.domain}
                      </span>
                    )}
                    {job.isRemote && (
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md font-bold">
                        Remote
                      </span>
                    )}
                  </div>

                  {/* Required Skills Preview */}
                  {job.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skillsRequired.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-secondary text-muted-foreground border border-border px-2 py-0.5 rounded-md font-medium">{s}</span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="text-xs text-muted-foreground font-medium self-center">+{job.skillsRequired.length - 4} more</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => handleRemove(job._id)}
                      disabled={removing === job._id}
                      className="flex items-center gap-1.5 text-sm font-bold bg-secondary hover:bg-red-500/10 text-muted-foreground hover:text-red-400 py-2 px-4 rounded-xl transition-all border border-border hover:border-red-500/30">
                      {removing === job._id ? (
                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : '🗑'}
                      Remove
                    </button>
                    <button
                      onClick={() => setApplying(job)}
                      className="flex-1 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-xl transition-colors shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                      Apply Now
                    </button>
                  </div>
                </SpotlightCard>
              </FadeIn>
            ))}
          </div>
        )}

        {/* Apply Modal */}
        {applying && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <SpotlightCard className="p-8 max-w-md w-full shadow-2xl border-primary/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-black text-lg">{applying.company?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="font-bold text-lg truncate leading-tight">{applying.title}</h2>
                  <p className="text-muted-foreground text-sm font-medium mt-0.5">{applying.company} · {applying.type}</p>
                </div>
              </div>
              <label className="block text-sm font-bold mb-2">Cover Letter <span className="text-muted-foreground font-medium ml-1">(Optional)</span></label>
              <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-6 font-medium text-sm"
                placeholder="Tell them why you're a great fit..." />
              <div className="flex gap-3">
                <button onClick={() => { setApplying(null); setCoverLetter(''); }}
                  className="flex-1 bg-secondary text-foreground hover:bg-secondary/80 font-bold py-2.5 rounded-xl transition-colors border border-border">Cancel</button>
                <button onClick={handleApply}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 rounded-xl transition-colors shadow-[0_0_15px_rgba(var(--primary),0.4)]">Submit Application</button>
              </div>
            </SpotlightCard>
          </div>
        )}
      </main>
    </div>
  );
}
