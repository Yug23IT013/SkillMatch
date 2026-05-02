'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { studentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { FadeIn } from '@/components/ui/FadeIn';

const TECH_SKILLS = ['Python', 'JavaScript', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL', 'Machine Learning', 'Django', 'Flask', 'TypeScript', 'Next.js', 'Docker', 'AWS', 'Git', 'C++', 'Data Structures', 'Algorithms', 'TensorFlow', 'PyTorch'];
const SOFT_SKILLS = ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Time Management', 'Critical Thinking', 'Adaptability', 'Creativity'];
const DOMAINS = ['Web Development', 'Data Science', 'Machine Learning', 'DevOps', 'Mobile Development', 'Cybersecurity', 'Cloud Computing', 'UI/UX Design', 'Blockchain', 'Game Development'];

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [newSkill, setNewSkill] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Resume parser state
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState({ tech: [], soft: [] });
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [applyingParsed, setApplyingParsed] = useState(false);

  useEffect(() => {
    studentAPI.getProfile().then(r => {
      setProfile(r.data.student);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const update = (field, val) => setProfile(p => ({ ...p, [field]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentAPI.updateProfile(profile);
      toast.success('Profile saved successfully 🎉');
    } catch (e) {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = async (skill, type) => {
    if (!skill.trim()) return;
    try {
      const res = await studentAPI.addSkill({ skill: skill.trim(), type });
      setProfile(res.data.student);
      setNewSkill('');
      toast.success('Skill added');
    } catch (e) { toast.error('Failed to add skill'); }
  };

  const removeSkill = async (skill, type) => {
    try {
      const res = await studentAPI.removeSkill({ skill, type });
      setProfile(res.data.student);
    } catch (e) { toast.error('Failed to remove skill'); }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isPdf = file.name.toLowerCase().endsWith('.pdf');

    // Step 1: Upload the file
    setUploadingResume(true);
    try {
      const form = new FormData();
      form.append('resume', file);
      const res = await studentAPI.uploadResume(form);
      setProfile(p => ({ ...p, resume: res.data.resume }));
      toast.success('Resume uploaded!');
    } catch (e) {
      toast.error('Failed to upload resume');
      setUploadingResume(false);
      e.target.value = '';
      return;
    }
    setUploadingResume(false);

    // Step 2: Auto-parse if PDF
    if (!isPdf) {
      e.target.value = '';
      return;
    }
    setParsing(true);
    try {
      const parseForm = new FormData();
      parseForm.append('resume', file);
      const res = await studentAPI.parseResume(parseForm);
      const extracted = res.data.extracted;

      const existingTech = (profile?.technicalSkills || []).map(s => s.toLowerCase());
      const existingSoft = (profile?.softSkills || []).map(s => s.toLowerCase());
      const newTech = (extracted.technicalSkills || []).filter(s => !existingTech.includes(s.toLowerCase()));
      const newSoft = (extracted.softSkills || []).filter(s => !existingSoft.includes(s.toLowerCase()));
      const existingTitles = (profile?.projects || []).map(p => p.title?.toLowerCase());
      const newProjects = (extracted.projects || []).filter(p => !existingTitles.includes(p.title?.toLowerCase()));

      setParsedData({ ...extracted, technicalSkills: newTech, softSkills: newSoft, projects: newProjects });
      setSelectedSkills({ tech: newTech, soft: newSoft });
      setSelectedProjects(newProjects.map((_, i) => i));

      if (newTech.length === 0 && newSoft.length === 0 && newProjects.length === 0) {
        toast('Profile already up to date — no new items found ✅');
        setParsedData(null);
      }
    } catch {
      // Parsing is best-effort; silently ignore if ML service is down
      toast('Resume uploaded. Skill extraction unavailable right now.', { icon: 'ℹ️' });
    } finally {
      setParsing(false);
      e.target.value = '';
    }
  };

  const toggleParsedSkill = (skill, type) => {
    setSelectedSkills(prev => {
      const list = prev[type];
      return { ...prev, [type]: list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill] };
    });
  };

  const toggleParsedProject = (idx) => {
    setSelectedProjects(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const applyParsedData = async () => {
    setApplyingParsed(true);
    try {
      for (const skill of selectedSkills.tech) await studentAPI.addSkill({ skill, type: 'technical' });
      for (const skill of selectedSkills.soft) await studentAPI.addSkill({ skill, type: 'soft' });
      const chosenProjects = selectedProjects.map(i => parsedData.projects[i]);
      if (chosenProjects.length > 0) {
        await studentAPI.updateProfile({ projects: [...(profile?.projects || []), ...chosenProjects] });
      }
      const updated = await studentAPI.getProfile();
      setProfile(updated.data.student);
      const total = selectedSkills.tech.length + selectedSkills.soft.length + chosenProjects.length;
      toast.success(`✅ Added ${total} item${total !== 1 ? 's' : ''} to your profile!`);
      setParsedData(null);
    } catch (e) {
      toast.error('Failed to apply some extracted data');
    } finally {
      setApplyingParsed(false);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const tabs = ['basic', 'skills', 'education', 'projects', 'preferences'];

  if (loading) return (
    <div className="flex min-h-screen bg-background text-foreground pl-64">
      <Sidebar />
      <main className="flex-1 p-8 lg:p-12"><div className="animate-pulse space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-secondary/50 rounded-2xl" />)}</div></main>
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
              <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
              <p className="text-muted-foreground font-medium mt-1">Keep your profile updated for better AI recommendations.</p>
            </div>
            <button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-all">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="flex gap-2 bg-secondary/50 p-1.5 rounded-2xl mb-8 overflow-x-auto border border-border backdrop-blur-md w-fit">
            {tabs.map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl capitalize whitespace-nowrap transition-all duration-300 ${activeTab === t ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          {/* Basic Info */}
          {activeTab === 'basic' && (
            <SpotlightCard className="p-8 space-y-8">
              <h2 className="text-xl font-bold tracking-tight border-b border-border/50 pb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">Phone</label>
                  <input value={profile?.phone || ''} onChange={e => update('phone', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="+91 98765 43210" /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">LinkedIn</label>
                  <input value={profile?.linkedIn || ''} onChange={e => update('linkedIn', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="linkedin.com/in/..." /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">GitHub</label>
                  <input value={profile?.github || ''} onChange={e => update('github', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="github.com/..." /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">Portfolio</label>
                  <input value={profile?.portfolio || ''} onChange={e => update('portfolio', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="yoursite.com" /></div>
              </div>
              <div><label className="block text-sm font-bold text-muted-foreground mb-2">Bio</label>
                <textarea rows={4} value={profile?.bio || ''} onChange={e => update('bio', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" placeholder="Write a brief professional bio..." /></div>

              {/* Resume Upload */}
              <div className="bg-secondary/30 p-5 rounded-2xl border border-border border-dashed">
                <div className="flex items-start justify-between mb-3">
                  <label className="block text-sm font-bold text-muted-foreground">Resume Document</label>
                  {parsing && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Extracting skills...
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {profile?.resume && (
                    <a href={`http://localhost:5000${profile.resume}`} target="_blank" rel="noreferrer"
                      className="text-primary font-bold text-sm bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl transition-colors hover:bg-primary/20">
                      📄 View Current Resume
                    </a>
                  )}
                  <label className={`font-bold px-4 py-2 rounded-xl text-sm border transition-colors ${
                    uploadingResume || parsing
                      ? 'bg-secondary/50 text-muted-foreground border-border cursor-not-allowed'
                      : 'bg-secondary text-foreground border-border cursor-pointer hover:bg-secondary/80'
                  }`}>
                    {uploadingResume ? 'Uploading...' : parsing ? 'Parsing...' : 'Upload Resume'}
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume || parsing} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-3">📄 PDF uploads are automatically parsed to extract skills &amp; projects</p>
              </div>
            </SpotlightCard>
          )}

          {/* Skills */}
          {activeTab === 'skills' && (
            <div className="space-y-8">
              <SpotlightCard className="p-8">
                <h2 className="text-xl font-bold tracking-tight mb-6">Technical Skills</h2>
                <div className="flex flex-wrap gap-2.5 mb-6 bg-secondary/20 p-4 rounded-xl border border-border min-h-[80px]">
                  {(profile?.technicalSkills || []).map(s => (
                    <span key={s} className="bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                      {s}
                      <button onClick={() => removeSkill(s, 'technical')} className="text-primary/60 hover:text-red-400 focus:outline-none">×</button>
                    </span>
                  ))}
                  {(profile?.technicalSkills || []).length === 0 && <span className="text-sm text-muted-foreground font-medium m-auto">No technical skills added yet.</span>}
                </div>
                <div className="flex gap-3 mb-6">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill(newSkill, 'technical')}
                    className="flex-1 bg-secondary/40 border border-border rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" placeholder="Type a new skill and press Enter" />
                  <button onClick={() => addSkill(newSkill, 'technical')} className="bg-primary text-primary-foreground font-bold px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors">Add</button>
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {TECH_SKILLS.filter(s => !profile?.technicalSkills?.includes(s)).slice(0, 15).map(s => (
                    <button key={s} onClick={() => addSkill(s, 'technical')}
                      className="text-xs border border-border border-dashed text-muted-foreground font-bold px-3 py-1.5 rounded-lg hover:border-primary/50 hover:text-primary transition-colors bg-secondary/30">+ {s}</button>
                  ))}
                </div>
              </SpotlightCard>

              <SpotlightCard className="p-8">
                <h2 className="text-xl font-bold tracking-tight mb-6">Soft Skills</h2>
                <div className="flex flex-wrap gap-2.5 mb-6 bg-secondary/20 p-4 rounded-xl border border-border min-h-[80px]">
                  {(profile?.softSkills || []).map(s => (
                    <span key={s} className="bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                      {s}
                      <button onClick={() => removeSkill(s, 'soft')} className="text-green-400/60 hover:text-red-400 focus:outline-none">×</button>
                    </span>
                  ))}
                  {(profile?.softSkills || []).length === 0 && <span className="text-sm text-muted-foreground font-medium m-auto">No soft skills added yet.</span>}
                </div>
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {SOFT_SKILLS.filter(s => !profile?.softSkills?.includes(s)).map(s => (
                    <button key={s} onClick={() => addSkill(s, 'soft')}
                      className="text-xs border border-border border-dashed text-muted-foreground font-bold px-3 py-1.5 rounded-lg hover:border-green-500/50 hover:text-green-400 transition-colors bg-secondary/30">+ {s}</button>
                  ))}
                </div>
              </SpotlightCard>
            </div>
          )}

          {/* Education */}
          {activeTab === 'education' && (
            <SpotlightCard className="p-8 space-y-6">
              <h2 className="text-xl font-bold tracking-tight border-b border-border/50 pb-4 mb-2">Education Credentials</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">College/University</label>
                  <input value={profile?.college || ''} onChange={e => update('college', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground" placeholder="e.g. Stanford University" /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">Degree</label>
                  <input value={profile?.degree || ''} onChange={e => update('degree', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground" placeholder="e.g. B.Tech" /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">Branch / Major</label>
                  <input value={profile?.branch || ''} onChange={e => update('branch', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground" placeholder="e.g. Computer Science" /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">Graduation Year</label>
                  <input type="number" value={profile?.graduationYear || ''} onChange={e => update('graduationYear', e.target.value)} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground" placeholder="2025" /></div>
                <div><label className="block text-sm font-bold text-muted-foreground mb-2">Cumulative GPA / Percentage</label>
                  <input type="number" step="0.01" min="0" max="10" value={profile?.cgpa || ''} onChange={e => update('cgpa', parseFloat(e.target.value))} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-3 text-foreground" placeholder="8.5" /></div>
              </div>
            </SpotlightCard>
          )}

          {/* Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {(profile?.projects || []).map((proj, i) => (
                <SpotlightCard key={i} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">Project {i + 1}</h3>
                    <button onClick={() => {
                      const p = [...(profile.projects || [])];
                      p.splice(i, 1);
                      update('projects', p);
                    }} className="text-red-400 font-bold text-sm bg-red-500/10 px-3 py-1 rounded-lg hover:bg-red-500/20 transition-colors">Remove</button>
                  </div>
                  <div className="space-y-4">
                    <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Project Title</label>
                    <input value={proj.title || ''} onChange={e => { const p = [...profile.projects]; p[i].title = e.target.value; update('projects', p); }} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-foreground font-medium" placeholder="E.g. E-Commerce Platform" /></div>
                    <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                    <textarea rows={3} value={proj.description || ''} onChange={e => { const p = [...profile.projects]; p[i].description = e.target.value; update('projects', p); }} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-foreground font-medium" placeholder="What did you build and what technologies did you use?" /></div>
                    <div><label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Live Demo / Repository Link</label>
                    <input value={proj.link || ''} onChange={e => { const p = [...profile.projects]; p[i].link = e.target.value; update('projects', p); }} className="w-full bg-secondary/40 border border-border rounded-xl px-4 py-2 text-foreground font-medium" placeholder="https://github.com/..." /></div>
                  </div>
                </SpotlightCard>
              ))}
              <button onClick={() => update('projects', [...(profile?.projects || []), { title: '', description: '', link: '', techStack: [] }])}
                className="w-full bg-secondary/40 border border-border border-dashed text-muted-foreground font-bold py-4 rounded-xl hover:bg-secondary/60 hover:text-foreground transition-colors">
                + Add Another Project
              </button>
            </div>
          )}

          {/* Preferences */}
          {activeTab === 'preferences' && (
            <SpotlightCard className="p-8 space-y-8">
              <h2 className="text-xl font-bold tracking-tight border-b border-border/50 pb-4">Career Preferences</h2>
              <div>
                <label className="block text-sm font-bold text-muted-foreground mb-4">Preferred Output Domains</label>
                <div className="flex flex-wrap gap-2.5">
                  {DOMAINS.map(d => {
                    const active = (profile?.preferredDomains || []).includes(d);
                    return (
                      <button key={d} onClick={() => {
                        const domains = profile?.preferredDomains || [];
                        update('preferredDomains', active ? domains.filter(x => x !== d) : [...domains, d]);
                      }}
                        className={`text-sm font-bold px-4 py-2 rounded-xl border transition-all ${active ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="pt-2">
                <label className="block text-sm font-bold text-muted-foreground mb-4">Location Preference</label>
                <div className="flex flex-wrap gap-2.5">
                  {['Remote', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai', 'Anywhere'].map(loc => {
                    const active = (profile?.locationPreference || []).includes(loc);
                    return (
                      <button key={loc} onClick={() => {
                        const locs = profile?.locationPreference || [];
                        update('locationPreference', active ? locs.filter(x => x !== loc) : [...locs, loc]);
                      }}
                        className={`text-sm font-bold px-4 py-2 rounded-xl border transition-all ${active ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]' : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}>
                        {loc}
                      </button>
                    );
                  })}
                </div>
              </div>
            </SpotlightCard>
          )}
        </FadeIn>
      </main>

      {/* ── Parsed Data Review Modal ────────────────────────────────────────── */}
      {parsedData && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <SpotlightCard className="p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border-primary/30">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center text-lg flex-shrink-0">🤖</div>
              <div>
                <h2 className="font-bold text-xl">Resume Parsed Successfully</h2>
                <p className="text-sm text-muted-foreground">Select what you'd like to add to your profile</p>
              </div>
              <button onClick={() => setParsedData(null)} className="ml-auto text-muted-foreground hover:text-foreground text-2xl leading-none p-1 transition-colors">&times;</button>
            </div>

            {/* Technical Skills */}
            {parsedData.technicalSkills?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Technical Skills Found</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{parsedData.technicalSkills.length} new</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedData.technicalSkills.map(s => {
                    const active = selectedSkills.tech.includes(s);
                    return (
                      <button key={s} onClick={() => toggleParsedSkill(s, 'tech')}
                        className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition-all ${active ? 'bg-primary/20 text-primary border-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.15)]' : 'bg-secondary/50 text-muted-foreground border-border opacity-50'}`}>
                        {active ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {parsedData.softSkills?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Soft Skills Found</h3>
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">{parsedData.softSkills.length} new</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parsedData.softSkills.map(s => {
                    const active = selectedSkills.soft.includes(s);
                    return (
                      <button key={s} onClick={() => toggleParsedSkill(s, 'soft')}
                        className={`text-sm font-bold px-3 py-1.5 rounded-lg border transition-all ${active ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-secondary/50 text-muted-foreground border-border opacity-50'}`}>
                        {active ? '✓ ' : '+ '}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Projects */}
            {parsedData.projects?.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Projects Found</h3>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">{parsedData.projects.length} new</span>
                </div>
                <div className="space-y-3">
                  {parsedData.projects.map((proj, i) => {
                    const active = selectedProjects.includes(i);
                    return (
                      <button key={i} onClick={() => toggleParsedProject(i)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${active ? 'bg-blue-500/10 border-blue-500/30' : 'bg-secondary/30 border-border opacity-50'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${active ? 'bg-blue-500 border-blue-500' : 'border-border'}`}>
                            {active && <span className="text-white text-xs font-black">✓</span>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm">{proj.title}</p>
                            {proj.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{proj.description}</p>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button onClick={() => setParsedData(null)} className="flex-1 bg-secondary text-foreground font-bold py-3 rounded-xl hover:bg-secondary/80 transition-colors border border-border">
                Cancel
              </button>
              <button
                onClick={applyParsedData}
                disabled={applyingParsed || (selectedSkills.tech.length + selectedSkills.soft.length + selectedProjects.length === 0)}
                className="flex-[2] bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)] disabled:opacity-50 disabled:cursor-not-allowed">
                {applyingParsed ? 'Applying...' : `Apply ${selectedSkills.tech.length + selectedSkills.soft.length + selectedProjects.length} Selected Items`}
              </button>
            </div>
          </SpotlightCard>
        </div>
      )}
    </div>
  );
}
