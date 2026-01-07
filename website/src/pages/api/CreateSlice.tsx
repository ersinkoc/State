import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function createSlice<N extends string, S extends object>(
  name: N,
  initialState: S
): { [K in N]: S }`;

const basicUsageCode = `import { createStore, createSlice } from '@oxog/state';

// Create a user slice
const userSlice = createSlice('user', {
  name: '',
  email: '',
  isLoggedIn: false,
  $login: (state, name: string, email: string) => ({
    name,
    email,
    isLoggedIn: true,
  }),
  $logout: () => ({
    name: '',
    email: '',
    isLoggedIn: false,
  }),
});

// Combine with store
const store = createStore({
  ...userSlice,
  // Add more slices or state
});

// Access: store.getState().user.name
// Actions: store.getState().user.login('John', 'john@example.com')`;

const multipleSlicesCode = `import { createStore, createSlice } from '@oxog/state';

const userSlice = createSlice('user', {
  name: '',
  $setName: (state, name: string) => ({ name }),
});

const cartSlice = createSlice('cart', {
  items: [] as Array<{ id: string; qty: number }>,
  $addItem: (state, id: string) => ({
    items: [...state.items, { id, qty: 1 }],
  }),
});

const settingsSlice = createSlice('settings', {
  theme: 'light' as 'light' | 'dark',
  $toggleTheme: (state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  }),
});

// Combine all slices
const store = createStore({
  ...userSlice,
  ...cartSlice,
  ...settingsSlice,
});

// Type-safe access
const userName = store.getState().user.name;
const cartItems = store.getState().cart.items;
const theme = store.getState().settings.theme;`;

const withReactCode = `import { useStore } from '@oxog/state';

function UserProfile() {
  const name = useStore(store, (s) => s.user.name);
  const isLoggedIn = useStore(store, (s) => s.user.isLoggedIn);
  const login = useStore(store, (s) => s.user.login);
  const logout = useStore(store, (s) => s.user.logout);

  if (!isLoggedIn) {
    return (
      <button onClick={() => login('John', 'john@example.com')}>
        Login
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}`;

const typesCode = `import { createSlice, InferSliceState, InferSliceActions } from '@oxog/state';

const counterSlice = createSlice('counter', {
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $set: (state, value: number) => ({ count: value }),
});

// Infer state type
type CounterState = InferSliceState<typeof counterSlice>;
// { counter: { count: number } }

// Infer actions type
type CounterActions = InferSliceActions<typeof counterSlice>;
// { counter: { increment: () => void; set: (value: number) => void } }`;

export function CreateSlice() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">createSlice</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Create namespaced state slices for modular store organization
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>createSlice</code> creates a namespaced piece of state that can be
            combined with other slices to form a complete store. Each slice has its
            own state and actions, isolated under a namespace.
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
                <td className="py-2 pr-4"><code>name</code></td>
                <td className="py-2 pr-4"><code>string</code></td>
                <td className="py-2">Namespace for the slice</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>initialState</code></td>
                <td className="py-2 pr-4"><code>object</code></td>
                <td className="py-2">Initial state and actions for the slice</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="slice.ts" />

          <h2 className="text-2xl font-semibold mb-4">Multiple Slices</h2>
          <p className="text-muted-foreground mb-4">
            Combine multiple slices into a single store:
          </p>
          <CodeBlock code={multipleSlicesCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Integration</h2>
          <CodeBlock code={withReactCode} language="typescript" filename="UserProfile.tsx" />

          <h2 className="text-2xl font-semibold mb-4">TypeScript</h2>
          <p className="text-muted-foreground mb-4">
            Infer types from slices for full type safety:
          </p>
          <CodeBlock code={typesCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            Returns an object with a single key (the slice name) containing
            the initial state and actions. Spread this into <code>createStore</code>.
          </p>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/reset"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            reset
          </Link>
          <Link
            to="/api/computed"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            computed
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
