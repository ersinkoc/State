import { CodeBlock } from '../components/CodeBlock';

export function GettingStarted() {
  const installCode = `npm install @oxog/state`;

  const createStoreCode = `import { createStore } from '@oxog/state';

// Create a store with initial state
const store = createStore({
  count: 0,
  name: 'Guest',
});

// Get current state
console.log(store.getState()); // { count: 0, name: 'Guest' }`;

  const updateStateCode = `// Update with partial object
store.setState({ count: 1 });

// Update with function
store.setState((state) => ({
  count: state.count + 1,
}));

// Deep merge
store.merge({ user: { name: 'John' } });`;

  const actionsCode = `// Inline actions (prefix with $)
const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
});

// Call actions
store.increment();
store.decrement();`;

  const subscriptionsCode = `// Subscribe to all changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('State changed:', state);
});

// Subscribe with selector
const unsubscribe2 = store.subscribe(
  (state) => state.count,
  (count, prevCount) => console.log('Count:', count)
);

// Unsubscribe
unsubscribe();`;

  const reactCode = `import { useStore } from '@oxog/state';

function Counter() {
  // Select specific state
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}`;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        Getting Started
      </h1>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Installation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Install the package using npm, yarn, or pnpm:
        </p>
        <CodeBlock code={installCode} language="bash" filename="terminal" />
      </section>

      {/* Creating a Store */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Creating a Store
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Use <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm">
            createStore
          </code>{' '}
          to create a reactive store with initial state:
        </p>
        <CodeBlock code={createStoreCode} language="typescript" filename="store.ts" />
      </section>

      {/* Updating State */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Updating State
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Update state using <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm">
            setState()
          </code>{' '}
          or{' '}
          <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm">
            merge()
          </code>
          :
        </p>
        <CodeBlock code={updateStateCode} language="typescript" filename="update.ts" />
      </section>

      {/* Actions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Actions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Define actions by prefixing functions with <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm">$</code>:
        </p>
        <CodeBlock code={actionsCode} language="typescript" filename="actions.ts" />
      </section>

      {/* Subscriptions */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Subscriptions
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Subscribe to state changes with optional selector:
        </p>
        <CodeBlock code={subscriptionsCode} language="typescript" filename="subscribe.ts" />
      </section>

      {/* React Integration */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          React Integration
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Use the <code className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono text-sm">
            useStore
          </code>{' '}
          hook to integrate with React components:
        </p>
        <CodeBlock code={reactCode} language="tsx" filename="Counter.tsx" />
      </section>
    </div>
  );
}
