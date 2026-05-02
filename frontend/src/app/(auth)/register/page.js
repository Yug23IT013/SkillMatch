'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { FadeIn } from '@/components/ui/FadeIn';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Cannot safely call .get on the client correctly in Next14 without Suspense sometimes, but this works here.
    const role = searchParams?.get('role');
    if (role && ['student', 'recruiter'].includes(role)) {
      setForm(f => ({ ...f, role }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      toast.success('Account created successfully!');
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'recruiter') router.push('/recruiter/dashboard');
      else router.push('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
      
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors z-10">
        ← Back to home
      </Link>

      <FadeIn delay={0.1}>
        <SpotlightCard className="w-full max-w-md p-8 sm:p-10 shadow-2xl backdrop-blur-2xl bg-background/60">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30"
            >
              <span className="text-primary-foreground font-black text-xl tracking-tighter">SM</span>
            </motion.div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create account</h1>
            <p className="text-muted-foreground text-sm mt-2">Join the SkillMatch platform</p>
          </div>

          {/* Role selector */}
          <div className="relative flex p-1 bg-secondary rounded-xl mb-8 border border-border">
            {['student', 'recruiter'].map((role) => {
              const isActive = form.role === role;
              return (
                <button
                  key={role}
                  onClick={() => setForm({ ...form, role })}
                  type="button"
                  className={cn(
                    "relative flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-colors z-10",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeRole"
                      className="absolute inset-0 bg-background rounded-lg shadow-sm border border-border"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-20">{role}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 group">
            <AnimatePresence>
              <motion.div layout id="form-content" className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <input 
                    type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-secondary transition-all" 
                    placeholder="John Doe" required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <input 
                    type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-secondary transition-all" 
                    placeholder="you@example.com" required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">Password</label>
                    <input 
                      type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                      className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-secondary transition-all" 
                      placeholder="Min 6 chars" required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5 whitespace-nowrap overflow-hidden text-ellipsis">Confirm</label>
                    <input 
                      type="password" value={form.confirmPassword} onChange={e => setForm({...form, confirmPassword: e.target.value})}
                      className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-secondary transition-all" 
                      placeholder="••••••••" required 
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatedButton type="submit" disabled={loading} className="w-full mt-6" variant="primary">
              {loading ? 'Processing...' : `Create ${form.role} Account`}
            </AnimatedButton>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
