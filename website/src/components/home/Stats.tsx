import { Package, Shield, Code, Layers } from 'lucide-react';

const stats = [
  {
    icon: Package,
    value: '< 2KB',
    label: 'Gzipped',
    description: 'Tiny core bundle size',
    gradient: 'from-violet-500 to-purple-600',
    bgGradient: 'from-violet-500/10 to-purple-600/10',
  },
  {
    icon: Shield,
    value: '0',
    label: 'Dependencies',
    description: 'Zero runtime deps',
    gradient: 'from-fuchsia-500 to-pink-600',
    bgGradient: 'from-fuchsia-500/10 to-pink-600/10',
  },
  {
    icon: Code,
    value: '100%',
    label: 'TypeScript',
    description: 'Full type safety',
    gradient: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-500/10 to-blue-600/10',
  },
  {
    icon: Layers,
    value: 'React+',
    label: 'Frameworks',
    description: 'Vue, Svelte, Vanilla',
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-500/10 to-teal-600/10',
  },
];

export function Stats() {
  return (
    <section className="relative border-y border-border/50 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-fuchsia-500/5" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <div className="container relative max-w-screen-xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group text-center space-y-3"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon with gradient background */}
                <div className="flex justify-center">
                  <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${stat.bgGradient} border border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300`} />
                    <Icon className={`relative w-7 h-7 bg-gradient-to-br ${stat.gradient} bg-clip-text`} style={{ color: `var(--gradient-start)` }} />
                  </div>
                </div>

                {/* Value with gradient */}
                <div className={`text-3xl md:text-4xl font-bold font-mono bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>

                {/* Label */}
                <div className="text-sm font-semibold tracking-wide uppercase text-foreground/80">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="text-xs text-muted-foreground">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
