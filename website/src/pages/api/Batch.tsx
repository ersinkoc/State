import { CodeBlock } from '@/components/code/CodeBlock';

const batchCode = `import { batch } from '@oxog/state';

// Without batch - 3 re-renders
store.setState({ a: 1 });
store.setState({ b: 2 });
store.setState({ c: 3 });

// With batch - 1 re-render
batch(() => {
  store.setState({ a: 1 });
  store.setState({ b: 2 });
  store.setState({ c: 3 });
});

// With return value
const result = batch(() => {
  store.setState({ value: 42 });
  return 'done';
});
// result === 'done'`;

export function Batch() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">batch</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Batch multiple state updates into a single notification
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock
            code={`function batch<T>(fn: () => T): T`}
            language="typescript"
          />

          <h2 className="text-2xl font-semibold mb-4">Parameters</h2>
          <div className="p-4 border border-border rounded-lg">
            <code className="text-primary">fn</code>
            <p className="text-muted-foreground mt-2">
              Function containing state updates to batch.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            The return value of the provided function.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Examples</h2>
          <CodeBlock code={batchCode} language="typescript" filename="batch.ts" />

          <h2 className="text-2xl font-semibold mb-4">When to Use</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>batch</code> when you need to update multiple pieces of state
            at once and want to avoid multiple re-renders or notifications.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Notes</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Batching is store-specific - each store maintains its own batch context</li>
            <li>Listeners are notified once after the batch function completes</li>
            <li>Nested batches are supported</li>
            <li>Useful for updating related state values atomically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
