import { CodeBlock } from '@/components/code/CodeBlock';
import { Terminal, Sparkles } from 'lucide-react';

const exampleCode = `import { createStore, useStore } from '@oxog/state';

// Create a store with state and actions
const store = createStore({
  count: 0,
  user: null,
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
});

// Use in React
function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);
  const decrement = useStore(store, (s) => s.decrement);

  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}`;

export function QuickCode() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

      <div className="container relative max-w-screen-xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-4">
            <Terminal className="w-4 h-4" />
            Quick Start
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Simple & Powerful</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in seconds with an intuitive API that just works
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Code block with glow effect */}
          <div className="relative group">
            {/* Glow background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

            {/* Code container */}
            <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl">
              <CodeBlock
                code={exampleCode}
                language="typescript"
                filename="Counter.tsx"
              />
            </div>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center mt-8 gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>TypeScript Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>React Hooks</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Zero Config</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
