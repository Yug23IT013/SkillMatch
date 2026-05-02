'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './ui/ThemeToggle';

export function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto glass-panel rounded-b-3xl">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
            <span className="text-primary-foreground font-black text-lg">SM</span>
          </div>
          <span className="font-bold text-2xl tracking-tight hidden sm:block">SkillMatch</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {!isAuthenticated ? (
          <>
            <Link href="/login" className="text-muted-foreground hover:text-foreground font-medium hidden sm:block transition-colors">
              Login
            </Link>
            <Link href="/register">
              <button className="h-10 px-5 rounded-full text-sm inline-flex items-center justify-center font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </Link>
          </>
        ) : (
          <Link href={`/${user?.role === 'admin' ? 'admin' : user?.role === 'recruiter' ? 'recruiter' : 'student'}/dashboard`}>
            <button className="h-10 px-5 rounded-full text-sm inline-flex items-center justify-center font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Dashboard
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
