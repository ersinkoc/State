import { Link } from 'react-router-dom';
import { ArrowRight, Package, Zap, Shield, Code2, Puzzle } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const exampleCode = `import { createStore, useStore } from '@oxog/state';

// Create a store
const store = createStore({
  count: 0,
  user: null,
  increment: (state) => ({ count: state.count + 1 }),
});

// React
function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);
  return <button onClick={increment}>{count}</button>;
}

// Vanilla JS
store.subscribe((state) => console.log(state.count));`;

export function Introduction() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Introduction</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Zero-dependency reactive state management for any framework
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What is @oxog/state?</h2>
          <p className="mb-4 text-muted-foreground">
            @oxog/state is a lightweight, framework-agnostic state management library
            designed for modern JavaScript applications. Built with a micro-kernel
            architecture, it provides a powerful core that can be extended with plugins.
          </p>

          <h3 className="text-xl font-semibold mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
              <Zap className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Zero Dependencies</h4>
                <p className="text-sm text-muted-foreground">No runtime dependencies means smaller bundle size.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
              <Shield className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">TypeScript Native</h4>
                <p className="text-sm text-muted-foreground">Built with TypeScript strict mode.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
              <Puzzle className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Plugin System</h4>
                <p className="text-sm text-muted-foreground">Extend with persist, devtools, history, and more.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border border-border">
              <Code2 className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold mb-1">Framework Agnostic</h4>
                <p className="text-sm text-muted-foreground">Works with React, Vue, Svelte, or vanilla JS.</p>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4">Quick Example</h3>
          <CodeBlock code={exampleCode} language="typescript" filename="example.tsx" />

          <h3 className="text-xl font-semibold mb-4">Bundle Size</h3>
          <p className="text-muted-foreground mb-4">
            The core library is less than 2KB gzipped. Even with all plugins included,
            the total bundle size remains under 10KB gzipped.
          </p>

          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Package className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">&lt; 2KB</div>
              <div className="text-sm text-muted-foreground">Core gzipped</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <span></span>
          <Link
            to="/docs/installation"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Installation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
