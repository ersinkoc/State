import { ArrowRight, Download, Zap, Shield, Code2 } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const installCode = `npm install @oxog/state`;

  const exampleCode = `import { createStore, useStore } from '@oxog/state';

const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}`;

  const features = [
    {
      icon: Zap,
      title: 'Zero Dependencies',
      description: 'No runtime dependencies means smaller bundle size and fewer vulnerabilities.',
    },
    {
      icon: Shield,
      title: 'TypeScript Native',
      description: 'Built with TypeScript strict mode for maximum type safety.',
    },
    {
      icon: Code2,
      title: 'Framework Agnostic',
      description: 'Works with React, Vue, Svelte, or vanilla JavaScript.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Zero-Dependency
              <span className="block text-primary-600 dark:text-primary-400 mt-2">
                State Management
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
              A lightweight, framework-agnostic state management library with micro-kernel
              architecture. Reactive state with plugin extensibility.
            </p>

            {/* Install Command */}
            <div className="mx-auto mt-8 max-w-md">
              <CodeBlock code={installCode} language="bash" filename="terminal" />
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('getting-started')}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                Get Started <ArrowRight size={18} />
              </button>
              <button
                onClick={() => onNavigate('examples')}
                className="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-6 py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <Download size={18} />
                Examples
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Why @oxog/state?
          </h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-white dark:bg-gray-950 shadow-sm border border-gray-200 dark:border-gray-800"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/20">
                  <feature.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {feature.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Example Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            Simple, Yet Powerful
          </h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get started with just a few lines of code. No complex setup required.
          </p>
          <div className="mt-10 max-w-3xl mx-auto">
            <CodeBlock code={exampleCode} language="typescript" filename="Counter.tsx" />
          </div>
        </div>
      </section>
    </div>
  );
}
