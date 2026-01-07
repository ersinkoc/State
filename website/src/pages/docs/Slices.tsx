import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicSliceCode = `import { createStore, createSlice } from '@oxog/state';

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

// Create a settings slice
const settingsSlice = createSlice('settings', {
  theme: 'light' as 'light' | 'dark',
  notifications: true,
  $toggleTheme: (state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  }),
  $toggleNotifications: (state) => ({
    notifications: !state.notifications,
  }),
});

// Combine slices into a store
const store = createStore({
  ...userSlice,
  ...settingsSlice,
});`;

const accessingSlicesCode = `import { useStore } from '@oxog/state';

function UserProfile() {
  // Access user slice state
  const name = useStore(store, (s) => s.user.name);
  const isLoggedIn = useStore(store, (s) => s.user.isLoggedIn);
  const login = useStore(store, (s) => s.user.login);
  const logout = useStore(store, (s) => s.user.logout);

  if (!isLoggedIn) {
    return <button onClick={() => login('John', 'john@example.com')}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function SettingsPanel() {
  // Access settings slice
  const theme = useStore(store, (s) => s.settings.theme);
  const toggleTheme = useStore(store, (s) => s.settings.toggleTheme);

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}`;

const sliceWithComputedCode = `import { createSlice, computed } from '@oxog/state';

const cartSlice = createSlice('cart', {
  items: [] as Array<{ id: string; name: string; price: number; quantity: number }>,

  // Computed values
  totalItems: computed((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  ),
  totalPrice: computed((state) =>
    state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  ),

  // Actions
  $addItem: (state, item: { id: string; name: string; price: number }) => {
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  },

  $removeItem: (state, id: string) => ({
    items: state.items.filter((item) => item.id !== id),
  }),

  $clearCart: () => ({ items: [] }),
});`;

const sliceTypesCode = `import { createSlice, InferSliceState, InferSliceActions } from '@oxog/state';

// Define slice
const counterSlice = createSlice('counter', {
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
  $decrement: (state) => ({ count: state.count - 1 }),
  $set: (state, value: number) => ({ count: value }),
});

// Infer types from slice
type CounterState = InferSliceState<typeof counterSlice>;
// { counter: { count: number } }

type CounterActions = InferSliceActions<typeof counterSlice>;
// { counter: { increment: () => void; decrement: () => void; set: (value: number) => void } }`;

export function Slices() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Slices</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Organize your store into modular, reusable slices
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What are Slices?</h2>
          <p className="text-muted-foreground mb-4">
            Slices are a way to organize your state into logical, isolated modules.
            Each slice manages its own piece of state and actions, making your code
            more maintainable and reusable.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Creating Slices</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>createSlice</code> to define a named slice with its state and actions:
          </p>
          <CodeBlock code={basicSliceCode} language="typescript" filename="slices.ts" />

          <h2 className="text-2xl font-semibold mb-4">Using Slices in Components</h2>
          <p className="text-muted-foreground mb-4">
            Access slice state and actions through the namespaced path:
          </p>
          <CodeBlock code={accessingSlicesCode} language="typescript" filename="components.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Slices with Computed Values</h2>
          <p className="text-muted-foreground mb-4">
            Combine slices with computed values for derived state:
          </p>
          <CodeBlock code={sliceWithComputedCode} language="typescript" filename="cart-slice.ts" />

          <h2 className="text-2xl font-semibold mb-4">TypeScript Support</h2>
          <p className="text-muted-foreground mb-4">
            Infer types from your slices for full type safety:
          </p>
          <CodeBlock code={sliceTypesCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>One slice per domain</strong>: Keep related state together</li>
            <li><strong>Prefix actions with $</strong>: Makes actions easy to identify</li>
            <li><strong>Use computed for derived values</strong>: Avoid duplicating state</li>
            <li><strong>Keep slices focused</strong>: Small, single-purpose slices are easier to test</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/react-integration"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            React Integration
          </Link>
          <Link
            to="/docs/computed"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Computed Values
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
