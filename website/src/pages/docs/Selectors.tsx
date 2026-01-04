import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicSelectorCode = `import { createStore, useStore } from '@oxog/state';

const store = createStore({
  count: 0,
  name: 'John',
  age: 30,
});

// Select entire state
const state = useStore(store);

// Select specific value
const count = useStore(store, (s) => s.count);

// Select multiple values
const profile = useStore(store, (s) => ({
  name: s.name,
  age: s.age,
}));`;

const vanillaSelectorCode = `import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
  name: 'John',
});

// Subscribe with selector
const unsubscribe = store.subscribe(
  (state) => state.count,
  (count, prevCount) => {
    console.log(\`Count changed from \${prevCount} to \${count}\`);
  }
);

// Only fires when count changes, not name
store.setState({ name: 'Jane' }); // No log
store.setState({ count: 1 }); // Logs: "Count changed from 0 to 1"`;

const customEqualityCode = `import { useStore } from '@oxog/state';

const store = createStore({
  users: [] as Array<{ id: number; name: string }>,
});

// Default: shallow equality
const users1 = useStore(store, (s) => s.users);

// Custom: compare by ID
const users2 = useStore(
  store,
  (s) => s.users,
  (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((user, i) => user.id === b[i]?.id);
  }
);`;

const memoizedSelectorCode = `import { useStore } from '@oxog/state';

const store = createStore({
  items: [] as Array<{ id: number; value: number }>,
  filter: 'all',
});

// Computed selector
const filteredItems = useStore(store, (s) => {
  if (s.filter === 'all') return s.items;
  return s.items.filter((item) => item.value > 10);
});`;

export function Selectors() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Selectors</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Extract and subscribe to specific parts of your state
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What are Selectors?</h2>
          <p className="text-muted-foreground mb-4">
            Selectors are functions that extract a slice of state. They help you:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Subscribe only to the data you need</li>
            <li>Prevent unnecessary re-renders</li>
            <li>Derive computed values from state</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">Basic Selectors</h2>
          <CodeBlock code={basicSelectorCode} language="typescript" filename="selector.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Vanilla JS Subscriptions</h2>
          <p className="text-muted-foreground mb-4">
            With vanilla JS, use selectors to only receive updates when the selected value changes:
          </p>
          <CodeBlock code={vanillaSelectorCode} language="typescript" filename="vanilla.ts" />

          <h2 className="text-2xl font-semibold mb-4">Custom Equality Functions</h2>
          <p className="text-muted-foreground mb-4">
            Provide a custom equality function to control when updates trigger:
          </p>
          <CodeBlock code={customEqualityCode} language="typescript" filename="equality.ts" />

          <h2 className="text-2xl font-semibold mb-4">Memoized Selectors</h2>
          <p className="text-muted-foreground mb-4">
            Selectors can compute derived values from state:
          </p>
          <CodeBlock code={memoizedSelectorCode} language="typescript" filename="memo.ts" />

          <h2 className="text-2xl font-semibold mb-4">Selector Guidelines</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Be specific</strong>: Select only what you need</li>
            <li><strong>Use selectors for performance</strong>: Prevent unnecessary re-renders</li>
            <li><strong>Custom equality for complex objects</strong>: Compare arrays/objects by ID or content</li>
            <li><strong>Derive computed values</strong>: Transform state in selectors</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/actions"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Actions
          </Link>
          <Link
            to="/docs/react-integration"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            React Integration
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
