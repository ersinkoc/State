import { CodeBlock } from '../components/CodeBlock';

export function ApiReference() {
  const createStoreExample = `import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
});`;

  const getStateExample = `const state = store.getState();
console.log(state.count); // 0`;

  const setStateExample = `// With object
store.setState({ count: 1 });

// With function
store.setState((state) => ({
  count: state.count + 1,
}));`;

  const subscribeExample = `// Subscribe to all changes
const unsubscribe = store.subscribe((state) => {
  console.log(state);
});

// Subscribe with selector
const unsubscribe2 = store.subscribe(
  (state) => state.count,
  (count) => console.log('Count:', count)
);`;

  const useStoreExample = `import { useStore } from '@oxog/state';

function Component() {
  const count = useStore(store, (s) => s.count);
  return <div>{count}</div>;
}`;

  const apis = [
    {
      name: 'createStore',
      description: 'Creates a new reactive store.',
      signature: 'createStore<TState>(initialState: TState): Store<TState>',
      example: createStoreExample,
    },
    {
      name: 'store.getState',
      description: 'Returns the current state.',
      signature: 'getState(): TState',
      example: getStateExample,
    },
    {
      name: 'store.setState',
      description: 'Updates state with partial object or function.',
      signature: 'setState(partial: Partial<TState> | ((state: TState) => Partial<TState>)): void',
      example: setStateExample,
    },
    {
      name: 'store.subscribe',
      description: 'Subscribes to state changes.',
      signature: 'subscribe(listener): () => void',
      example: subscribeExample,
    },
    {
      name: 'useStore',
      description: 'React hook for subscribing to store.',
      signature: 'useStore<TSelected>(store, selector?, equalityFn?): TSelected',
      example: useStoreExample,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        API Reference
      </h1>

      <div className="space-y-12">
        {apis.map((api) => (
          <section key={api.name}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {api.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{api.description}</p>
            <div className="mb-4">
              <code className="block px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 font-mono text-sm overflow-x-auto">
                {api.signature}
              </code>
            </div>
            <CodeBlock code={api.example} language="typescript" />
          </section>
        ))}
      </div>
    </div>
  );
}
