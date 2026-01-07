import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function useAction<TState, K extends keyof TState>(
  store: Store<TState>,
  actionName: K
): TState[K]`;

const basicUsageCode = `import { createStore, useStore, useAction } from '@oxog/state';

const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
  $reset: () => ({ count: 0 }),
});

function Counter() {
  const count = useStore(store, s => s.count);

  // Get actions with stable references
  const increment = useAction(store, 'increment');
  const decrement = useAction(store, 'decrement');
  const reset = useAction(store, 'reset');

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`;

const withArgsCode = `import { createStore, useAction } from '@oxog/state';

const store = createStore({
  items: [] as string[],
  $addItem: (state, item: string) => ({
    items: [...state.items, item],
  }),
  $removeItem: (state, index: number) => ({
    items: state.items.filter((_, i) => i !== index),
  }),
});

function ItemList() {
  const addItem = useAction(store, 'addItem');
  const removeItem = useAction(store, 'removeItem');

  return (
    <div>
      <button onClick={() => addItem('New Item')}>Add</button>
      <button onClick={() => removeItem(0)}>Remove First</button>
    </div>
  );
}`;

const comparisonCode = `// These are equivalent:

// Using useStore to select action
const increment1 = useStore(store, s => s.increment);

// Using useAction (more explicit, same result)
const increment2 = useAction(store, 'increment');

// Both return a stable reference to the action`;

export function UseAction() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 font-mono">useAction</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Convenience hook for selecting a single action from the store
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>useAction</code> is a convenience hook for selecting a single action
            from the store. It's equivalent to <code>useStore(store, s =&gt; s.actionName)</code>
            but more explicit and type-safe.
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
                <td className="py-2 pr-4"><code>actionName</code></td>
                <td className="py-2 pr-4"><code>string</code></td>
                <td className="py-2">Name of the action to select</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="Counter.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Actions with Arguments</h2>
          <CodeBlock code={withArgsCode} language="typescript" filename="ItemList.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Comparison with useStore</h2>
          <CodeBlock code={comparisonCode} language="typescript" filename="comparison.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            Returns a stable reference to the action function. The reference
            remains the same across re-renders.
          </p>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Tip</h4>
            <p className="text-muted-foreground">
              For selecting multiple actions at once, use <code>useStoreActions</code> instead.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/use-shallow"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            useShallow
          </Link>
          <Link
            to="/api/use-store-selector"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            useStoreSelector
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
