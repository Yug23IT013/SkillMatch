'use client'
import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { jobAPI } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { FadeIn } from '@/components/ui/FadeIn'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

const DOMAINS = ['Web Development', 'Data Science', 'Machine Learning', 'Mobile Development', 'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design', 'Backend Development', 'Full Stack']

export default function PostJobPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [form, setForm] = useState({
    title: '', company: user?.company || '', description: '', type: 'internship',
    location: '', isRemote: false, skillsRequired: [], domain: '', minCgpa: 0,
    experienceLevel: 'fresher', stipend: '', salary: '', duration: '', openings: 1,
    deadline: '', tags: []
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSkill = () => {
    if (!skillInput.trim() || form.skillsRequired.includes(skillInput.trim())) return
    update('skillsRequired', [...form.skillsRequired, skillInput.trim()])
    setSkillInput('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.company || !form.description) return toast.error('Fill all required fields')
    if (form.skillsRequired.length === 0) return toast.error('Add at least one required skill')
    setLoading(true)
    try {
      await jobAPI.createJob(form)
      toast.success('Job posted successfully!')
      router.push('/recruiter/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12 overflow-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <FadeIn delay={0.1}>
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Post a New Job</h1>
            <p className="text-muted-foreground font-medium mt-2">Create an attractive listing to find the perfect candidate.</p>
          </div>
        </FadeIn>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
          <FadeIn delay={0.2}>
            <SpotlightCard className="p-8 space-y-6">
              <h2 className="text-xl font-bold tracking-tight border-b border-border/50 pb-4 flex items-center gap-2">
                <span className="text-primary">01</span> Job Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Job Title *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="e.g. Software Engineer Intern" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Company *</label>
                  <input value={form.company} onChange={e => update('company', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="Company name" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Description *</label>
                <textarea rows={5} value={form.description} onChange={e => update('description', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-y" placeholder="Describe the role, responsibilities, and what you're looking for..." required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Type</label>
                  <select value={form.type} onChange={e => update('type', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none">
                    {['internship', 'full-time', 'part-time', 'contract'].map(t => <option key={t} value={t} className="capitalize bg-background text-foreground">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Domain</label>
                  <select value={form.domain} onChange={e => update('domain', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none">
                    <option value="" className="bg-background text-foreground">Select domain</option>
                    {DOMAINS.map(d => <option key={d} value={d} className="bg-background text-foreground">{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Experience Level</label>
                  <select value={form.experienceLevel} onChange={e => update('experienceLevel', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none">
                    {['fresher', 'junior', '0-1', '1-3', '3-5', '5+'].map(l => <option key={l} value={l} className="bg-background text-foreground">{l === 'fresher' ? 'Fresher' : `${l} years`}</option>)}
                  </select>
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>

          <FadeIn delay={0.3}>
            <SpotlightCard className="p-8 space-y-6">
              <h2 className="text-xl font-bold tracking-tight border-b border-border/50 pb-4 flex items-center gap-2">
                <span className="text-primary">02</span> Location & Compensation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Location</label>
                  <input value={form.location} onChange={e => update('location', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="City or Remote" />
                </div>
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-6 h-6 border-2 border-primary/50 rounded bg-secondary/40 group-hover:bg-primary/20 transition-colors">
                      <input type="checkbox" checked={form.isRemote} onChange={e => update('isRemote', e.target.checked)} className="absolute opacity-0 cursor-pointer inset-0 z-10" />
                      {form.isRemote && <svg className="w-4 h-4 text-primary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-sm font-bold text-foreground">Remote work available</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">{form.type === 'internship' ? 'Stipend' : 'Salary'}</label>
                  <input value={form.type === 'internship' ? form.stipend : form.salary} onChange={e => update(form.type === 'internship' ? 'stipend' : 'salary', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="e.g. ₹15,000/month" />
                </div>

                {form.type === 'internship' && (
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-2">Duration</label>
                    <input value={form.duration} onChange={e => update('duration', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="e.g. 3 months" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Openings</label>
                  <input type="number" min="1" value={form.openings} onChange={e => update('openings', parseInt(e.target.value))} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-muted-foreground mb-2">Application Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => update('deadline', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium [color-scheme:dark]" />
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>

          <FadeIn delay={0.4}>
            <SpotlightCard className="p-8 space-y-6">
              <h2 className="text-xl font-bold tracking-tight border-b border-border/50 pb-4 flex items-center gap-2">
                <span className="text-primary">03</span> Requirements
              </h2>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-2">Minimum CGPA <span className="text-xs font-normal">(Optional)</span></label>
                <input type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={e => update('minCgpa', parseFloat(e.target.value))} className="w-32 bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-3">Required Skills *</label>
                <div className="flex flex-wrap gap-2.5 mb-4 bg-secondary/20 p-4 rounded-xl border border-border min-h-[80px]">
                  {form.skillsRequired.map(s => (
                    <span key={s} className="bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                      {s}
                      <button type="button" onClick={() => update('skillsRequired', form.skillsRequired.filter(x => x !== s))} className="text-primary/60 hover:text-red-400 focus:outline-none transition-colors">×</button>
                    </span>
                  ))}
                  {form.skillsRequired.length === 0 && <span className="text-sm text-muted-foreground font-medium m-auto">No skills added yet.</span>}
                </div>
                <div className="flex gap-3">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }} className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="Type a required skill and press Enter" />
                  <button type="button" onClick={addSkill} className="bg-secondary text-foreground hover:bg-secondary/80 font-bold px-8 py-3 rounded-xl transition-colors border border-border">Add</button>
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>

          <FadeIn delay={0.5} className="flex justify-end pt-4">
            <AnimatedButton variant="primary" type="submit" disabled={loading} className="w-full md:w-auto h-14 px-12 text-lg font-bold shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              {loading ? 'Posting Job...' : 'Publish Job Post'}
            </AnimatedButton>
          </FadeIn>
        </form>
      </main>
    </div>
  )
}
