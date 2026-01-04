import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstallTabs } from '@/components/common/InstallTabs';
import { PACKAGE_NAME } from '@/lib/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-fuchsia-500/10 rounded-full blur-3xl" />

      <div className="container relative max-w-screen-xl mx-auto px-4 py-24 md:py-36">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/20 via-fuchsia-500/20 to-cyan-500/20 border border-primary/30 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="font-mono text-sm font-medium bg-gradient-to-r from-primary to-fuchsia-500 bg-clip-text text-transparent">
              {PACKAGE_NAME}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-6 max-w-4xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="gradient-text-vibrant">Zero-dependency</span>
              <br />
              <span className="text-foreground">reactive state</span>
              <br />
              <span className="gradient-text">management</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Lightweight, framework-agnostic state management with{' '}
              <span className="text-primary font-medium">micro-kernel architecture</span>.
              Works with React, Vue, Svelte, or vanilla JavaScript.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary via-fuchsia-600 to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 shadow-lg shadow-primary/25 hover:shadow-primary/40">
              <Link to="/docs/quick-start" className="flex items-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary/30 hover:border-primary/60 hover:bg-primary/5 backdrop-blur-sm">
              <a
                href="https://github.com/ersinkoc/state"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>

          {/* Install Command */}
          <div className="w-full max-w-lg pt-4">
            <div className="gradient-border p-[1px] rounded-xl">
              <div className="bg-card rounded-xl">
                <InstallTabs />
              </div>
            </div>
          </div>

          {/* Trusted by badge */}
          <div className="flex items-center gap-2 pt-8 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[280, 320, 200, 160].map((hue, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `oklch(70% 0.2 ${hue})`, color: 'white' }}
                >
                  {['R', 'V', 'S', 'J'][i]}
                </div>
              ))}
            </div>
            <span>Works with React, Vue, Svelte & Vanilla JS</span>
          </div>
        </div>
      </div>
    </section>
  );
}
