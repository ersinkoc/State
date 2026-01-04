import { CodeBlock } from '@/components/code/CodeBlock';

const useStoreCode = `import { useStore } from '@oxog/state';
import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
  user: null,
  increment: (state) => ({ count: state.count + 1 }),
});

function Counter() {
  // Select the entire state
  const state = useStore(store);

  // Select a specific value
  const count = useStore(store, (s) => s.count);

  // Select with custom equality check
  const user = useStore(
    store,
    (s) => s.user,
    (a, b) => a?.id === b?.id
  );

  // Select an action
  const increment = useStore(store, (s) => s.increment);

  return <button onClick={increment}>{count}</button>;
}`;

const subscriptionCode = `// useStore uses useSyncExternalStore internally
// This ensures optimal performance and SSR compatibility

// Selecting multiple values
const count = useStore(store, (s) => s.count);
const name = useStore(store, (s) => s.name);

// The component only re-renders when the selected value changes`;

export function UseStore() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">useStore</h1>
        <p className="text-xl text-muted-foreground mb-8">
          React hook for subscribing to store state changes
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock
            code={`function useStore<TState, TSelected = TState>(
  store: Store<TState>,
  selector?: Selector<TState, TSelected>,
  equalityFn?: EqualityFn<TSelected>
): TSelected`}
            language="typescript"
          />

          <h2 className="text-2xl font-semibold mb-4">Parameters</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <code className="text-primary">store</code>
              <p className="text-muted-foreground mt-2">
                The store instance to subscribe to.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <code className="text-primary">selector</code>
              <span className="text-muted-foreground ml-2">(optional)</span>
              <p className="text-muted-foreground mt-2">
                Function to extract a slice of state. Defaults to identity function (returns entire state).
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <code className="text-primary">equalityFn</code>
              <span className="text-muted-foreground ml-2">(optional)</span>
              <p className="text-muted-foreground mt-2">
                Custom equality function to prevent unnecessary re-renders. Defaults to shallow equality.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            The selected state value.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Examples</h2>
          <CodeBlock code={useStoreCode} language="typescript" filename="Counter.tsx" />

          <h2 className="text-2xl font-semibold mb-4">How it Works</h2>
          <CodeBlock code={subscriptionCode} language="typescript" filename="explanation.ts" />

          <h2 className="text-2xl font-semibold mb-4">Performance Tips</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Always use a selector to extract only the data you need</li>
            <li>This prevents unnecessary re-renders when other parts of state change</li>
            <li>Multiple calls to <code>useStore</code> with different selectors are fine</li>
            <li>Use custom equality functions for complex objects like arrays or nested objects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
