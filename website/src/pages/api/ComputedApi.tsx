import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function computed<S, T>(
  selector: (state: S) => T
): ComputedValue<T>`;

const basicUsageCode = `import { createStore, computed } from '@oxog/state';

const store = createStore({
  items: [
    { name: 'Apple', price: 1.5, quantity: 3 },
    { name: 'Banana', price: 0.75, quantity: 5 },
  ],

  // Computed values
  totalItems: computed((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  ),

  totalPrice: computed((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  ),

  isEmpty: computed((state) => state.items.length === 0),
});

// Access like regular state
console.log(store.getState().totalItems);  // 8
console.log(store.getState().totalPrice);  // 8.25
console.log(store.getState().isEmpty);     // false`;

const dependencyCode = `import { createStore, computed } from '@oxog/state';

const store = createStore({
  users: [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'user' },
  ],
  filter: 'all' as 'all' | 'admin' | 'user',

  // Depends on users and filter
  filteredUsers: computed((state) => {
    if (state.filter === 'all') return state.users;
    return state.users.filter((u) => u.role === state.filter);
  }),

  // Depends on filteredUsers (another computed)
  filteredCount: computed((state) => state.filteredUsers.length),
});`;

const memoizationCode = `import { createStore, computed } from '@oxog/state';

const store = createStore({
  numbers: [1, 2, 3, 4, 5],

  // This expensive computation is memoized
  expensiveResult: computed((state) => {
    console.log('Computing...');
    return state.numbers
      .map((n) => n * n)
      .filter((n) => n > 10)
      .reduce((sum, n) => sum + n, 0);
  }),
});

// First access - computes
store.getState().expensiveResult; // Logs: "Computing..."

// Second access - cached (no computation)
store.getState().expensiveResult; // No log

// After state change - recomputes
store.setState({ numbers: [1, 2, 3, 4, 5, 6] });
store.getState().expensiveResult; // Logs: "Computing..."`;

const reactUsageCode = `import { useStore } from '@oxog/state';

function CartSummary() {
  // Access computed values like regular state
  const totalItems = useStore(store, (s) => s.totalItems);
  const totalPrice = useStore(store, (s) => s.totalPrice);
  const isEmpty = useStore(store, (s) => s.isEmpty);

  if (isEmpty) {
    return <p>Your cart is empty</p>;
  }

  return (
    <div>
      <p>Items: {totalItems}</p>
      <p>Total: \${totalPrice.toFixed(2)}</p>
    </div>
  );
}`;

export function ComputedApi() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">computed</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Create memoized derived values from store state
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>computed</code> creates a derived value that automatically updates
            when its dependencies change. Computed values are memoized - they only
            recalculate when the state they depend on changes.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Parameters</h2>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Parameter</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>selector</code></td>
                <td className="py-2 pr-4"><code>(state: S) =&gt; T</code></td>
                <td className="py-2">Function that derives value from state</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="computed.ts" />

          <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
          <p className="text-muted-foreground mb-4">
            Computed values can depend on state or other computed values:
          </p>
          <CodeBlock code={dependencyCode} language="typescript" filename="dependencies.ts" />

          <h2 className="text-2xl font-semibold mb-4">Memoization</h2>
          <p className="text-muted-foreground mb-4">
            Computed values are automatically memoized for performance:
          </p>
          <CodeBlock code={memoizationCode} language="typescript" filename="memoization.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Usage</h2>
          <CodeBlock code={reactUsageCode} language="typescript" filename="CartSummary.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            Returns a <code>ComputedValue</code> that behaves like a regular state
            property when accessed through <code>getState()</code> or <code>useStore</code>.
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Best Practices</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>Keep computed functions pure (no side effects)</li>
              <li>Use for derived data: totals, filtered lists, aggregations</li>
              <li>Chain computed values for complex derivations</li>
              <li>Don't store computed data - derive it instead</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/create-slice"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            createSlice
          </Link>
          <Link
            to="/api/create-federation"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            createFederation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
