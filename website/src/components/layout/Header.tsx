import { Github, Star, Package, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { PACKAGE_NAME, GITHUB_REPO, NPM_PACKAGE } from '@/lib/constants';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Docs', href: '/docs' },
  { label: 'API', href: '/api' },
  { label: 'Examples', href: '/examples' },
  { label: 'Plugins', href: '/plugins' },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-strong">
      <div className="container flex h-16 max-w-screen-2xl items-center px-6 md:px-8">
        {/* Logo */}
        <Link to="/" className="mr-8 flex items-center gap-2.5 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-fuchsia-500 rounded-lg blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="relative p-1.5 rounded-lg bg-gradient-to-r from-primary to-fuchsia-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="font-bold font-mono text-lg text-foreground group-hover:text-primary transition-colors duration-200">
            {PACKAGE_NAME}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg font-medium transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-primary to-fuchsia-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-3">
          {/* GitHub Star Button */}
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 hover:border-primary/50 bg-gradient-to-r from-transparent to-transparent hover:from-primary/5 hover:to-fuchsia-500/5 transition-all duration-300"
          >
            <Star className="h-4 w-4 text-amber-500 group-hover:fill-amber-500 transition-all" />
            <span className="text-sm font-medium">Star</span>
          </a>

          {/* npm link */}
          <a
            href={`https://www.npmjs.com/package/${NPM_PACKAGE}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="hover:text-rose-500 hover:bg-rose-500/10">
              <Package className="h-5 w-5" />
            </Button>
          </a>

          {/* GitHub link */}
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="hover:text-foreground hover:bg-accent">
              <Github className="h-5 w-5" />
            </Button>
          </a>

          {/* Theme toggle */}
          <div className="pl-2 border-l border-border/50">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
