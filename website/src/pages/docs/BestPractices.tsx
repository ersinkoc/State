import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const storeOrganizationGood = `// stores/userStore.ts
export const userStore = createStore({
  user: null as User | null,
  isLoading: false,
  error: null as string | null,
});

// stores/settingsStore.ts
export const settingsStore = createStore({
  theme: 'light' as 'light' | 'dark',
  language: 'en',
  notifications: true,
});

// stores/index.ts - Export all stores
export { userStore } from './userStore';
export { settingsStore } from './settingsStore';`;

const storeOrganizationBad = `// DON'T: Giant monolithic store
const store = createStore({
  user: null,
  isLoading: false,
  error: null,
  theme: 'light',
  language: 'en',
  notifications: true,
  todos: [],
  selectedTodoId: null,
  cart: [],
  cartTotal: 0,
  // ... 50 more properties
});`;

const selectorsGood = `// Use granular selectors
function UserProfile() {
  const name = useStore(userStore, (s) => s.user?.name);
  const email = useStore(userStore, (s) => s.user?.email);

  return (
    <div>
      <h1>{name}</h1>
      <p>{email}</p>
    </div>
  );
}`;

const selectorsBad = `// DON'T: Select entire state when you only need parts
function UserProfile() {
  const state = useStore(userStore);

  // This re-renders on ANY state change, even unrelated ones
  return (
    <div>
      <h1>{state.user?.name}</h1>
      <p>{state.user?.email}</p>
    </div>
  );
}`;

const actionsGood = `const todoStore = createStore({
  todos: [] as Todo[],
  filter: 'all' as Filter,
}, {
  // Pure actions - only transform state
  addTodo: (state, text: string) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }],
  }),

  toggleTodo: (state, id: number) => ({
    todos: state.todos.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    ),
  }),

  setFilter: (state, filter: Filter) => ({ filter }),
});

// Side effects happen outside the store
async function fetchTodos() {
  todoStore.setState({ isLoading: true });
  try {
    const todos = await api.getTodos();
    todoStore.setState({ todos, isLoading: false });
  } catch (error) {
    todoStore.setState({ error: error.message, isLoading: false });
  }
}`;

const batchingCode = `import { batch } from '@oxog/state';

// Without batching: 3 re-renders
function resetApp() {
  userStore.setState({ user: null });
  settingsStore.setState({ theme: 'light' });
  todoStore.setState({ todos: [] });
}

// With batching: 1 re-render
function resetApp() {
  batch(() => {
    userStore.setState({ user: null });
    settingsStore.setState({ theme: 'light' });
    todoStore.setState({ todos: [] });
  });
}`;

const derivedStateCode = `// DON'T: Store derived state
const store = createStore({
  items: [] as Item[],
  total: 0, // Derived from items - will get out of sync!
});

// DO: Compute derived state with selectors
const store = createStore({
  items: [] as Item[],
});

// Derived values as selectors
function useTotal() {
  return useStore(store, (s) =>
    s.items.reduce((sum, item) => sum + item.price, 0)
  );
}

function useItemCount() {
  return useStore(store, (s) => s.items.length);
}`;

export function BestPractices() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Best Practices</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Patterns and recommendations for scalable state management
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            Store Organization
          </h2>
          <p className="text-muted-foreground mb-4">
            Split your state into multiple small, focused stores instead of one large store:
          </p>

          <div className="flex items-center gap-2 mb-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Good: Multiple focused stores</span>
          </div>
          <CodeBlock code={storeOrganizationGood} language="typescript" filename="stores/index.ts" />

          <div className="flex items-center gap-2 mb-2 mt-6 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Avoid: Monolithic store</span>
          </div>
          <CodeBlock code={storeOrganizationBad} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Selector Optimization</h2>
          <p className="text-muted-foreground mb-4">
            Use granular selectors to minimize re-renders:
          </p>

          <div className="flex items-center gap-2 mb-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Good: Granular selectors</span>
          </div>
          <CodeBlock code={selectorsGood} language="typescript" />

          <div className="flex items-center gap-2 mb-2 mt-6 text-red-500">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Avoid: Selecting entire state</span>
          </div>
          <CodeBlock code={selectorsBad} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Pure Actions</h2>
          <p className="text-muted-foreground mb-4">
            Keep actions pure and handle side effects separately:
          </p>
          <CodeBlock code={actionsGood} language="typescript" filename="todoStore.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Batching Updates
          </h2>
          <p className="text-muted-foreground mb-4">
            Use batch() when updating multiple stores to prevent unnecessary re-renders:
          </p>
          <CodeBlock code={batchingCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Derived State</h2>
          <p className="text-muted-foreground mb-4">
            Never store derived values - compute them with selectors:
          </p>
          <CodeBlock code={derivedStateCode} language="typescript" />

          <div className="mt-8 p-4 bg-muted rounded-lg space-y-3">
            <h4 className="font-semibold">Summary</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                <span className="text-muted-foreground">Split state into focused, domain-specific stores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                <span className="text-muted-foreground">Use granular selectors to minimize re-renders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                <span className="text-muted-foreground">Keep actions pure, handle side effects outside stores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                <span className="text-muted-foreground">Batch multiple updates to reduce re-renders</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                <span className="text-muted-foreground">Compute derived values with selectors, not stored state</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/typescript"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            TypeScript
          </Link>
          <Link
            to="/api"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            API Reference
          </Link>
        </div>
      </div>
    </div>
  );
}
