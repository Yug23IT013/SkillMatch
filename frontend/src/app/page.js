'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-32 pb-12 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground border border-border text-sm px-5 py-2 rounded-full mb-8">
          Find internships and jobs that fit your skills
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight mb-8">
          Get matched with jobs you'll actually like
        </h1>

        <p className="text-muted-foreground text-xl md:text-2xl max-w-3xl mx-auto mb-12">
          We look at what you know and how you've done in school to find jobs that are a good fit. 
          You'll see exactly why a role is a match before you apply.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register?role=student">
            <button className="h-14 px-8 text-lg w-full sm:w-auto inline-flex items-center justify-center rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              I'm a Student
            </button>
          </Link>
          <Link href="/register?role=recruiter">
            <button className="h-14 px-8 text-lg w-full sm:w-auto inline-flex items-center justify-center rounded-xl font-semibold bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition-colors">
              I'm a Recruiter
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
