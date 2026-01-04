import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const basicHookCode = `import { createStore, useStore } from '@oxog/state';

const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}`;

const multipleSelectorsCode = `import { createStore, useStore } from '@oxog/state';

const store = createStore({
  user: { name: 'John', age: 30 },
  posts: [] as Array<{ id: number; title: string }>,
});

function Profile() {
  // Multiple selectors - each creates its own subscription
  const name = useStore(store, (s) => s.user.name);
  const age = useStore(store, (s) => s.user.age);

  return (
    <div>
      <h1>{name}</h1>
      <p>Age: {age}</p>
    </div>
  );
}`;

const useCreateStoreCode = `import { useCreateStore, useStore } from '@oxog/state';

function Component() {
  // Store is created on first render
  const store = useCreateStore({
    count: 0,
    increment: (state) => ({ count: state.count + 1 }),
  });

  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return <button onClick={increment}>{count}</button>;
}`;

const useActionCode = `import { createStore, useStore, useAction } from '@oxog/state';

const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
});

function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useAction(store, 'increment');
  const decrement = useAction(store, 'decrement');

  return (
    <>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </>
  );
}`;

const asyncComponentCode = `import { createStore, useStore } from '@oxog/state';

const store = createStore({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (state, id: string) => {
    store.setState({ loading: true });
    try {
      const res = await fetch(\`/api/users/\${id}\`);
      const user = await res.json();
      return { user, loading: false };
    } catch (error) {
      return { error, loading: false };
    }
  },
});

function UserProfile({ userId }: { userId: string }) {
  const user = useStore(store, (s) => s.user);
  const loading = useStore(store, (s) => s.loading);
  const fetchUser = useStore(store, (s) => s.fetchUser);

  useEffect(() => {
    fetchUser(userId);
  }, [userId, fetchUser]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user</div>;

  return <div>{user.name}</div>;
}`;

export function ReactIntegration() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">React Integration</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Use @oxog/state with React hooks
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">useStore Hook</h2>
          <p className="text-muted-foreground mb-4">
            The primary hook for subscribing to store state changes:
          </p>
          <CodeBlock code={basicHookCode} language="typescript" filename="Counter.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Multiple Selectors</h2>
          <p className="text-muted-foreground mb-4">
            You can call <code>useStore</code> multiple times with different selectors:
          </p>
          <CodeBlock code={multipleSelectorsCode} language="typescript" filename="Profile.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Local Component Stores</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>useCreateStore</code> to create a store scoped to a component:
          </p>
          <CodeBlock code={useCreateStoreCode} language="typescript" filename="LocalStore.tsx" />

          <h2 className="text-2xl font-semibold mb-4">useAction Hook</h2>
          <p className="text-muted-foreground mb-4">
            Convenience hook for selecting actions from the store:
          </p>
          <CodeBlock code={useActionCode} language="typescript" filename="useAction.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Async Patterns</h2>
          <p className="text-muted-foreground mb-4">
            Handle async operations like data fetching:
          </p>
          <CodeBlock code={asyncComponentCode} language="typescript" filename="Async.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Performance Tips</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Use selectors</strong>: Only select what you need</li>
            <li><strong>Avoid selecting entire state</strong>: Break into smaller selections</li>
            <li><strong>Custom equality functions</strong>: For complex objects like arrays</li>
            <li><strong>Local stores</strong>: Use <code>useCreateStore</code> for component-specific state</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/selectors"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Selectors
          </Link>
          <Link
            to="/docs/plugins"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Plugins
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
