import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicTestingCode = `import { createStore, createTestStore } from '@oxog/state';
import { describe, it, expect } from 'vitest';

// Your store
const createCounterStore = () => createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
  $set: (state, value: number) => ({ count: value }),
});

describe('Counter Store', () => {
  it('should increment count', () => {
    const store = createCounterStore();

    store.getState().increment();

    expect(store.getState().count).toBe(1);
  });

  it('should decrement count', () => {
    const store = createCounterStore();
    store.setState({ count: 5 });

    store.getState().decrement();

    expect(store.getState().count).toBe(4);
  });
});`;

const testStoreUtilitiesCode = `import { createTestStore, mockStore } from '@oxog/state/testing';

// createTestStore - creates isolated store instances
describe('with createTestStore', () => {
  it('provides isolated store per test', () => {
    const store = createTestStore({
      count: 0,
      $increment: (state) => ({ count: state.count + 1 }),
    });

    // Store is fresh for each test
    expect(store.getState().count).toBe(0);

    store.getState().increment();
    expect(store.getState().count).toBe(1);
  });
});

// mockStore - create a mock with spies
describe('with mockStore', () => {
  it('tracks action calls', () => {
    const store = mockStore({
      count: 0,
      $increment: (state) => ({ count: state.count + 1 }),
    });

    store.getState().increment();
    store.getState().increment();

    // Check if actions were called
    expect(store.actionCalls.increment).toBe(2);
  });
});`;

const asyncTestingCode = `import { createStore } from '@oxog/state';
import { waitFor } from '@testing-library/react';

const createUserStore = () => createStore({
  user: null,
  loading: false,
  $fetchUser: async (state, id: string) => {
    store.setState({ loading: true });
    const res = await fetch(\`/api/users/\${id}\`);
    const user = await res.json();
    return { user, loading: false };
  },
});

describe('Async Actions', () => {
  it('should fetch user', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ id: '1', name: 'John' }),
    });

    const store = createUserStore();

    // Call async action
    await store.getState().fetchUser('1');

    // Assert final state
    expect(store.getState().user).toEqual({ id: '1', name: 'John' });
    expect(store.getState().loading).toBe(false);
  });
});`;

const reactTestingCode = `import { render, screen, fireEvent } from '@testing-library/react';
import { createStore, useStore } from '@oxog/state';

// Component using store
const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
});

function Counter() {
  const count = useStore(store, (s) => s.count);
  const increment = useStore(store, (s) => s.increment);

  return (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}

describe('Counter Component', () => {
  beforeEach(() => {
    // Reset store before each test
    store.setState({ count: 0 });
  });

  it('displays current count', () => {
    render(<Counter />);

    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('increments on click', () => {
    render(<Counter />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});`;

const snapshotTestingCode = `import { createStore, getStoreSnapshot, restoreStoreSnapshot } from '@oxog/state';

describe('Snapshot Testing', () => {
  it('should match snapshot', () => {
    const store = createStore({
      todos: [
        { id: 1, text: 'Learn testing', done: true },
        { id: 2, text: 'Write tests', done: false },
      ],
    });

    // Get snapshot of current state
    const snapshot = getStoreSnapshot(store);

    expect(snapshot).toMatchSnapshot();
  });

  it('should restore from snapshot', () => {
    const store = createStore({ count: 0 });

    // Save initial state
    const snapshot = getStoreSnapshot(store);

    // Modify state
    store.setState({ count: 100 });
    expect(store.getState().count).toBe(100);

    // Restore from snapshot
    restoreStoreSnapshot(store, snapshot);
    expect(store.getState().count).toBe(0);
  });
});`;

const pluginTestingCode = `import { createStore, history, persist } from '@oxog/state';
import { mockStorage } from '@oxog/state/testing';

describe('Plugin Testing', () => {
  describe('history plugin', () => {
    it('should undo/redo', () => {
      const store = createStore({ count: 0 })
        .use(history({ limit: 10 }));

      store.setState({ count: 1 });
      store.setState({ count: 2 });

      store.undo();
      expect(store.getState().count).toBe(1);

      store.redo();
      expect(store.getState().count).toBe(2);
    });
  });

  describe('persist plugin', () => {
    it('should persist to storage', () => {
      const storage = mockStorage();

      const store = createStore({ count: 0 })
        .use(persist({ key: 'test', storage }));

      store.setState({ count: 42 });

      expect(storage.getItem('test')).toContain('42');
    });
  });
});`;

export function Testing() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Testing</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Testing utilities and patterns for @oxog/state
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Testing Basics</h2>
          <p className="text-muted-foreground mb-4">
            Testing stores is straightforward - create a store, call actions, assert state:
          </p>
          <CodeBlock code={basicTestingCode} language="typescript" filename="counter.test.ts" />

          <h2 className="text-2xl font-semibold mb-4">Test Utilities</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>createTestStore</code> for isolated tests and <code>mockStore</code> for spying:
          </p>
          <CodeBlock code={testStoreUtilitiesCode} language="typescript" filename="utilities.test.ts" />

          <h2 className="text-2xl font-semibold mb-4">Async Actions</h2>
          <p className="text-muted-foreground mb-4">
            Test async actions by awaiting them and asserting the final state:
          </p>
          <CodeBlock code={asyncTestingCode} language="typescript" filename="async.test.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Component Testing</h2>
          <p className="text-muted-foreground mb-4">
            Test components that use stores with React Testing Library:
          </p>
          <CodeBlock code={reactTestingCode} language="typescript" filename="Counter.test.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Snapshot Testing</h2>
          <p className="text-muted-foreground mb-4">
            Use snapshots to test complex state structures:
          </p>
          <CodeBlock code={snapshotTestingCode} language="typescript" filename="snapshot.test.ts" />

          <h2 className="text-2xl font-semibold mb-4">Testing Plugins</h2>
          <p className="text-muted-foreground mb-4">
            Test stores with plugins like history and persist:
          </p>
          <CodeBlock code={pluginTestingCode} language="typescript" filename="plugins.test.ts" />

          <h2 className="text-2xl font-semibold mb-4">Testing Tips</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Reset state before tests</strong>: Use beforeEach to ensure clean state</li>
            <li><strong>Mock external dependencies</strong>: Fetch, localStorage, etc.</li>
            <li><strong>Test actions in isolation</strong>: Unit test store logic separately</li>
            <li><strong>Use snapshots sparingly</strong>: Only for complex, stable structures</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/validation"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Validation
          </Link>
          <Link
            to="/docs/typescript"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            TypeScript
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
