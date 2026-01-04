import { CodeBlock } from '@/components/code/CodeBlock';

const createStoreCode = `import { createStore } from '@oxog/state';

// Basic usage
const store = createStore({
  count: 0,
  name: 'John',
  increment: (state) => ({ count: state.count + 1 }),
  setName: (state, name: string) => ({ name }),
});

// With separate actions
const store = createStore(
  { count: 0 },
  {
    increment: (state) => ({ count: state.count + 1 }),
    decrement: (state) => ({ count: state.count - 1 }),
  }
);

// With plugins
const store = createStore({ count: 0 })
  .use(persist({ key: 'app' }))
  .use(devtools({ name: 'My Store' }));`;

export function CreateStore() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">createStore</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create a new reactive store with state and actions
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock
            code={`function createStore<TState>(
  initialState: TState,
  actions?: Actions<TState>
): Store<TState>`}
            language="typescript"
          />

          <h2 className="text-2xl font-semibold mb-4">Parameters</h2>
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-lg">
              <code className="text-primary">initialState</code>
              <p className="text-muted-foreground mt-2">
                The initial state object. Can include actions prefixed with <code>$</code>.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <code className="text-primary">actions</code>
              <span className="text-muted-foreground ml-2">(optional)</span>
              <p className="text-muted-foreground mt-2">
                Object containing action functions that receive state and return partial state updates.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            A <code>Store</code> instance with methods for state management.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Examples</h2>
          <CodeBlock code={createStoreCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4">Action Styles</h2>
          <p className="text-muted-foreground mb-4">
            You can define actions in three different ways:
          </p>

          <h3 className="text-xl font-semibold mb-2">Inline Actions</h3>
          <CodeBlock
            code={`const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
});`}
            language="typescript"
          />

          <h3 className="text-xl font-semibold mb-2">Separate Actions</h3>
          <CodeBlock
            code={`const store = createStore(
  { count: 0 },
  { increment: (state) => ({ count: state.count + 1 }) }
);`}
            language="typescript"
          />

          <h3 className="text-xl font-semibold mb-2">Fluent Builder</h3>
          <CodeBlock
            code={`const store = createStore({ count: 0 })
  .action('increment', (state) => ({ count: state.count + 1 }))
  .action('decrement', (state) => ({ count: state.count - 1 }));`}
            language="typescript"
          />
        </div>
      </div>
    </div>
  );
}
