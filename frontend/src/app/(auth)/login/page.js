'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { SpotlightCard } from '@/components/ui/SpotlightCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { FadeIn } from '@/components/ui/FadeIn';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      if (user.role === 'admin') router.push('/admin/dashboard');
      else if (user.role === 'recruiter') router.push('/recruiter/dashboard');
      else router.push('/student/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
      
      <Link href="/" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground font-medium flex items-center gap-2 transition-colors">
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
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in to your SkillMatch account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
              <input 
                type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-secondary transition-all" 
                placeholder="you@example.com" required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
              <input 
                type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-secondary/50 border border-border text-foreground rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-secondary transition-all" 
                placeholder="••••••••" required 
              />
            </div>
            <AnimatedButton type="submit" disabled={loading} className="w-full mt-2" variant="primary">
              {loading ? 'Signing in...' : 'Sign In'}
            </AnimatedButton>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">Create one</Link>
          </p>

        </SpotlightCard>
      </FadeIn>
    </div>
  );
}
