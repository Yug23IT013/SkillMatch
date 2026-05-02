'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Target, LayoutDashboard, User, FileText, Briefcase, Users, PieChart, LogOut, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ui/ThemeToggle';

const studentLinks = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/recommendations', label: 'Recommendations', icon: Target },
  { href: '/student/bookmarks', label: 'Saved Jobs', icon: Bookmark },
  { href: '/student/applications', label: 'Applications', icon: FileText },
  { href: '/student/profile', label: 'Profile', icon: User }
];

const recruiterLinks = [
  { href: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/recruiter/post-job', label: 'Post Job', icon: Briefcase },
  { href: '/recruiter/applicants', label: 'Applicants', icon: Users }
];

const adminLinks = [
  { href: '/admin/dashboard', label: 'Analytics', icon: PieChart },
  { href: '/admin/users', label: 'Users', icon: Users }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'recruiter' ? recruiterLinks : studentLinks;

  return (
    <aside className="w-64 min-h-screen border-r border-border bg-background/50 backdrop-blur-3xl flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-black text-sm">SM</span>
          </div>
          <span className="font-extrabold tracking-tight text-xl text-foreground">SkillMatch</span>
        </Link>
      </div>

      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary border border-border rounded-xl flex items-center justify-center shadow-inner">
            <span className="text-secondary-foreground font-bold text-sm uppercase">{user?.name?.[0]}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</p>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={18} className={isActive ? "text-primary" : "text-muted-foreground"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
