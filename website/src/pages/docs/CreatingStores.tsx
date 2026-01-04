import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicStoreCode = `import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
  name: 'Guest',
});

console.log(store.getState()); // { count: 0, name: 'Guest' }`;

const withActionsCode = `// Style 1: Inline actions (prefix with $)
const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
});

store.increment();
store.increment();
store.decrement();`;

const separateActionsCode = `// Style 2: Separate actions object
const store = createStore(
  { count: 0 },
  {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
    reset: () => ({ count: 0 }),
  }
);`;

const fluentBuilderCode = `// Style 3: Fluent builder pattern
const store = createStore({ count: 0 })
  .action('increment', (state) => ({ count: state.count + 1 }))
  .action('decrement', (state) => ({ count: state.count - 1 }))
  .action('double', (state) => ({ count: state.count * 2 }));`;

const typedStoreCode = `interface State {
  count: number;
  user: { name: string; age: number } | null;
}

const store = createStore<State>({
  count: 0,
  user: null,
});`;

export function CreatingStores() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Creating Stores</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Learn different ways to create and configure stores
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Basic Store</h2>
          <p className="text-muted-foreground mb-4">
            The simplest way to create a store is with just the initial state:
          </p>
          <CodeBlock code={basicStoreCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4">Action Styles</h2>
          <p className="text-muted-foreground mb-4">
            @oxog/state supports three different styles for defining actions:
          </p>

          <h3 className="text-xl font-semibold mb-2">Inline Actions</h3>
          <p className="text-muted-foreground mb-4">
            Prefix action names with <code>$</code> to automatically extract them:
          </p>
          <CodeBlock code={withActionsCode} language="typescript" filename="inline.ts" />

          <h3 className="text-xl font-semibold mb-2">Separate Actions</h3>
          <p className="text-muted-foreground mb-4">
            Pass actions as a second argument to <code>createStore</code>:
          </p>
          <CodeBlock code={separateActionsCode} language="typescript" filename="separate.ts" />

          <h3 className="text-xl font-semibold mb-2">Fluent Builder</h3>
          <p className="text-muted-foreground mb-4">
            Chain actions using the builder pattern:
          </p>
          <CodeBlock code={fluentBuilderCode} language="typescript" filename="builder.ts" />

          <h2 className="text-2xl font-semibold mb-4">TypeScript</h2>
          <p className="text-muted-foreground mb-4">
            Type your state for full TypeScript support:
          </p>
          <CodeBlock code={typedStoreCode} language="typescript" filename="typed.ts" />

          <h2 className="text-2xl font-semibold mb-4">Initial State vs Actions</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Initial state</strong>: Plain object with your data</li>
            <li><strong>Actions</strong>: Functions that transform state</li>
            <li>Actions receive current state and return partial updates</li>
            <li>Actions are automatically bound to the store</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/quick-start"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Quick Start
          </Link>
          <Link
            to="/docs/actions"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Actions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
