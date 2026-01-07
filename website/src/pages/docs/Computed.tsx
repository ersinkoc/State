import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicComputedCode = `import { createStore, computed } from '@oxog/state';

const store = createStore({
  items: [
    { id: 1, name: 'Apple', price: 1.5, quantity: 3 },
    { id: 2, name: 'Banana', price: 0.75, quantity: 5 },
  ],

  // Computed values - automatically derived from state
  totalItems: computed((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  ),

  totalPrice: computed((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  ),

  itemCount: computed((state) => state.items.length),
});

// Access computed values like regular state
console.log(store.getState().totalItems); // 8
console.log(store.getState().totalPrice); // 8.25`;

const computedWithDepsCode = `import { createStore, computed } from '@oxog/state';

const store = createStore({
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
    { id: 3, name: 'Carol', role: 'admin' },
  ],
  filter: 'all' as 'all' | 'admin' | 'user',

  // Computed value that depends on multiple state values
  filteredUsers: computed((state) => {
    if (state.filter === 'all') return state.users;
    return state.users.filter((user) => user.role === state.filter);
  }),

  // Computed can depend on other computed values
  filteredCount: computed((state) => state.filteredUsers.length),
});`;

const computedReactCode = `import { createStore, computed, useStore } from '@oxog/state';

const store = createStore({
  todos: [] as Array<{ id: number; text: string; completed: boolean }>,

  completedCount: computed((state) =>
    state.todos.filter((t) => t.completed).length
  ),

  pendingCount: computed((state) =>
    state.todos.filter((t) => !t.completed).length
  ),

  progress: computed((state) => {
    if (state.todos.length === 0) return 0;
    return Math.round((state.completedCount / state.todos.length) * 100);
  }),
});

function TodoStats() {
  const completedCount = useStore(store, (s) => s.completedCount);
  const pendingCount = useStore(store, (s) => s.pendingCount);
  const progress = useStore(store, (s) => s.progress);

  return (
    <div>
      <p>Completed: {completedCount}</p>
      <p>Pending: {pendingCount}</p>
      <progress value={progress} max={100} />
    </div>
  );
}`;

const computedMemoCode = `import { createStore, computed } from '@oxog/state';

const store = createStore({
  data: [] as number[],
  multiplier: 2,

  // This computation is memoized
  // It only recalculates when data or multiplier changes
  processedData: computed((state) => {
    console.log('Computing processedData...');
    return state.data.map((n) => n * state.multiplier);
  }),

  // Expensive computation - only runs when needed
  statistics: computed((state) => {
    console.log('Computing statistics...');
    const sum = state.processedData.reduce((a, b) => a + b, 0);
    const avg = sum / state.processedData.length || 0;
    const max = Math.max(...state.processedData, 0);
    const min = Math.min(...state.processedData, 0);
    return { sum, avg, max, min };
  }),
});

// First access - computes both
store.getState().statistics; // Logs: Computing processedData... Computing statistics...

// Second access - uses cached value
store.getState().statistics; // No logs - cached

// After state change - recomputes
store.setState({ data: [1, 2, 3] });
store.getState().statistics; // Logs: Computing processedData... Computing statistics...`;

export function Computed() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Computed Values</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Derive values from your state with automatic memoization
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What are Computed Values?</h2>
          <p className="text-muted-foreground mb-4">
            Computed values are derived state that automatically updates when their
            dependencies change. They're memoized for performance, meaning they only
            recalculate when necessary.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <p className="text-muted-foreground mb-4">
            Use the <code>computed</code> function to define derived values:
          </p>
          <CodeBlock code={basicComputedCode} language="typescript" filename="computed.ts" />

          <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Computed values can depend on multiple state values or other computed values:
          </p>
          <CodeBlock code={computedWithDepsCode} language="typescript" filename="dependencies.ts" />

          <h2 className="text-2xl font-semibold mb-4">Using with React</h2>
          <p className="text-muted-foreground mb-4">
            Access computed values in React components just like regular state:
          </p>
          <CodeBlock code={computedReactCode} language="typescript" filename="TodoStats.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Memoization</h2>
          <p className="text-muted-foreground mb-4">
            Computed values are automatically memoized. They only recalculate when
            their dependencies change:
          </p>
          <CodeBlock code={computedMemoCode} language="typescript" filename="memoization.ts" />

          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Keep computations pure</strong>: No side effects in computed functions</li>
            <li><strong>Use for derived data</strong>: Totals, filtered lists, aggregations</li>
            <li><strong>Chain computed values</strong>: Build complex derivations from simpler ones</li>
            <li><strong>Avoid storing computed data</strong>: Let computed values handle derivation</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/slices"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Slices
          </Link>
          <Link
            to="/docs/federation"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Store Federation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
