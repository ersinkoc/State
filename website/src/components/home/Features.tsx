import { Zap, Shield, Code2, Puzzle, Feather, Workflow } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Zero Dependencies',
    description: 'No runtime dependencies means smaller bundle size and faster load times.',
    cardClass: 'feature-card-1',
    iconClass: 'icon-violet',
    borderColor: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    icon: Shield,
    title: 'TypeScript Native',
    description: 'Built with TypeScript strict mode for excellent type safety and DX.',
    cardClass: 'feature-card-2',
    iconClass: 'icon-fuchsia',
    borderColor: 'border-fuchsia-500/20 hover:border-fuchsia-500/40',
  },
  {
    icon: Puzzle,
    title: 'Plugin System',
    description: 'Extend functionality with plugins for persist, devtools, history, and more.',
    cardClass: 'feature-card-3',
    iconClass: 'icon-cyan',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
  },
  {
    icon: Code2,
    title: 'Framework Agnostic',
    description: 'Works with React, Vue, Svelte, or vanilla JavaScript out of the box.',
    cardClass: 'feature-card-4',
    iconClass: 'icon-emerald',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    icon: Feather,
    title: 'Tiny Bundle',
    description: 'Less than 2KB gzipped for the core functionality.',
    cardClass: 'feature-card-5',
    iconClass: 'icon-amber',
    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    icon: Workflow,
    title: 'Simple API',
    description: 'Intuitive API with hooks for React and subscriptions for vanilla JS.',
    cardClass: 'feature-card-6',
    iconClass: 'icon-rose',
    borderColor: 'border-rose-500/20 hover:border-rose-500/40',
  },
];

export function Features() {
  return (
    <section className="relative">
      {/* Background */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />

      <div className="container relative max-w-screen-xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Features
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Key Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for modern state management, nothing you don't
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`group relative p-6 rounded-2xl border ${feature.borderColor} ${feature.cardClass} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)' }} />

                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-background/50 border border-border/50 ${feature.iconClass}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
