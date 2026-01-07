import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function useStoreSelector<TState, TSelectors extends Record<string, (state: TState) => any>>(
  store: Store<TState>,
  selectors: TSelectors
): { [K in keyof TSelectors]: ReturnType<TSelectors[K]> }`;

const basicUsageCode = `import { createStore, useStoreSelector } from '@oxog/state';

const store = createStore({
  users: [
    { id: 1, name: 'Alice', active: true },
    { id: 2, name: 'Bob', active: false },
  ],
  orders: [
    { total: 100 },
    { total: 200 },
  ],
});

function Dashboard() {
  // Select multiple derived values with independent subscriptions
  const { userCount, activeCount, totalRevenue } = useStoreSelector(store, {
    userCount: s => s.users.length,
    activeCount: s => s.users.filter(u => u.active).length,
    totalRevenue: s => s.orders.reduce((sum, o) => sum + o.total, 0),
  });

  return (
    <div>
      <p>Total Users: {userCount}</p>
      <p>Active Users: {activeCount}</p>
      <p>Revenue: \${totalRevenue}</p>
    </div>
  );
}`;

const independentSubscriptionsCode = `import { useStoreSelector } from '@oxog/state';

function Stats() {
  // Each selector creates an independent subscription
  // Component only re-renders when selected values change
  const stats = useStoreSelector(store, {
    // Only re-renders when users.length changes
    totalUsers: s => s.users.length,
    // Only re-renders when an order total changes
    avgOrderValue: s => {
      const total = s.orders.reduce((sum, o) => sum + o.total, 0);
      return s.orders.length ? total / s.orders.length : 0;
    },
  });

  return (
    <div>
      <p>Users: {stats.totalUsers}</p>
      <p>Avg Order: \${stats.avgOrderValue.toFixed(2)}</p>
    </div>
  );
}`;

const typeInferenceCode = `import { useStoreSelector } from '@oxog/state';

// Types are automatically inferred
const result = useStoreSelector(store, {
  count: s => s.users.length,      // number
  names: s => s.users.map(u => u.name), // string[]
  first: s => s.users[0],          // User | undefined
});

// result.count is number
// result.names is string[]
// result.first is User | undefined`;

export function UseStoreSelector() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">useStoreSelector</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Select multiple values with named selectors, each tracked independently
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>useStoreSelector</code> allows you to select multiple derived values
            from the store using named selectors. Each selector creates an independent
            subscription, so the component only re-renders when the specific selected
            values change.
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
                <td className="py-2 pr-4"><code>store</code></td>
                <td className="py-2 pr-4"><code>Store&lt;TState&gt;</code></td>
                <td className="py-2">The store to select from</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>selectors</code></td>
                <td className="py-2 pr-4"><code>Record&lt;string, Selector&gt;</code></td>
                <td className="py-2">Object of named selector functions</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="Dashboard.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Independent Subscriptions</h2>
          <p className="text-muted-foreground mb-4">
            Each selector tracks its dependencies independently:
          </p>
          <CodeBlock code={independentSubscriptionsCode} language="typescript" filename="Stats.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Type Inference</h2>
          <p className="text-muted-foreground mb-4">
            Return types are automatically inferred from selector functions:
          </p>
          <CodeBlock code={typeInferenceCode} language="typescript" filename="types.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            Returns an object with the same keys as the selectors input, where each
            value is the result of calling that selector with the current state.
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Performance Note</h4>
            <p className="text-muted-foreground">
              Unlike selecting an object with <code>useStore</code>, <code>useStoreSelector</code>
              tracks each selector independently. This means changing <code>users</code> won't
              trigger a re-render if only <code>orders</code> selector is affected.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/use-action"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            useAction
          </Link>
          <Link
            to="/api/use-set-state"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            useSetState
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
