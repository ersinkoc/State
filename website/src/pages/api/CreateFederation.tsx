import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const signatureCode = `function createFederation<T extends Record<string, Store<any>>>(
  stores: T
): Federation<T>

interface Federation<T> {
  getState(): FederatedState<T>;
  subscribe(listener: (state: FederatedState<T>) => void): () => void;
  subscribeStore<K extends keyof T>(
    key: K,
    listener: (state: StoreState<T[K]>) => void
  ): () => void;
  stores: T;
}`;

const basicUsageCode = `import { createStore, createFederation } from '@oxog/state';

// Create independent stores
const userStore = createStore({
  name: 'John',
  email: 'john@example.com',
  $updateName: (state, name: string) => ({ name }),
});

const cartStore = createStore({
  items: [] as Array<{ id: string; qty: number }>,
  $addItem: (state, id: string) => ({
    items: [...state.items, { id, qty: 1 }],
  }),
});

const settingsStore = createStore({
  theme: 'light' as 'light' | 'dark',
  language: 'en',
});

// Create federation
const federation = createFederation({
  user: userStore,
  cart: cartStore,
  settings: settingsStore,
});`;

const accessingStateCode = `// Get complete federated state
const state = federation.getState();
console.log(state.user.name);       // 'John'
console.log(state.cart.items);      // []
console.log(state.settings.theme);  // 'light'

// Subscribe to all changes
const unsubscribe = federation.subscribe((state) => {
  console.log('State changed:', state);
});

// Subscribe to specific store
const unsubUser = federation.subscribeStore('user', (userState) => {
  console.log('User changed:', userState);
});

// Access individual stores directly
federation.stores.user.setState({ name: 'Jane' });
federation.stores.cart.getState().addItem('product-1');`;

const reactUsageCode = `import { useFederation, useFederationStore } from '@oxog/state';

// Use entire federation state
function App() {
  const state = useFederation(federation);

  return (
    <div>
      <h1>Welcome, {state.user.name}</h1>
      <p>Cart: {state.cart.items.length} items</p>
      <p>Theme: {state.settings.theme}</p>
    </div>
  );
}

// Use specific store from federation
function UserProfile() {
  const user = useFederationStore(federation, 'user');

  return <h1>{user.name}</h1>;
}

// Use with selector
function CartCount() {
  const itemCount = useFederationStore(
    federation,
    'cart',
    (s) => s.items.length
  );

  return <span>{itemCount} items</span>;
}`;

const typesCode = `import { createFederation, InferFederationState } from '@oxog/state';

const federation = createFederation({
  user: userStore,
  cart: cartStore,
});

// Infer complete state type
type AppState = InferFederationState<typeof federation>;
// {
//   user: { name: string; email: string; updateName: (name: string) => void };
//   cart: { items: Array<{ id: string; qty: number }>; addItem: (id: string) => void };
// }`;

const crossStoreCode = `// Stores can react to each other via subscriptions
userStore.subscribe(
  (state) => state.name,
  (name) => {
    // Update analytics when user name changes
    analyticsStore.setState({ lastUserName: name });
  }
);

// Or coordinate through effects
cartStore.subscribe(
  (state) => state.items.length,
  (count) => {
    if (count > 0) {
      settingsStore.setState({ hasActiveCart: true });
    }
  }
);`;

export function CreateFederation() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">createFederation</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Combine multiple independent stores into a unified interface
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>createFederation</code> combines multiple independent stores into
            a single interface while keeping them decoupled. Each store maintains
            its own state and can be updated independently.
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
                <td className="py-2 pr-4"><code>stores</code></td>
                <td className="py-2 pr-4"><code>Record&lt;string, Store&gt;</code></td>
                <td className="py-2">Object mapping names to stores</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="federation.ts" />

          <h2 className="text-2xl font-semibold mb-4">Accessing State</h2>
          <CodeBlock code={accessingStateCode} language="typescript" filename="access.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Integration</h2>
          <CodeBlock code={reactUsageCode} language="typescript" filename="components.tsx" />

          <h2 className="text-2xl font-semibold mb-4">TypeScript</h2>
          <CodeBlock code={typesCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4">Cross-Store Communication</h2>
          <p className="text-muted-foreground mb-4">
            Stores in a federation can still react to each other:
          </p>
          <CodeBlock code={crossStoreCode} language="typescript" filename="cross-store.ts" />

          <h2 className="text-2xl font-semibold mb-4">Federation Methods</h2>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Method</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>getState()</code></td>
                <td className="py-2">Get combined state from all stores</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>subscribe(listener)</code></td>
                <td className="py-2">Subscribe to any state change</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>subscribeStore(key, listener)</code></td>
                <td className="py-2">Subscribe to specific store changes</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>stores</code></td>
                <td className="py-2">Direct access to individual stores</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">When to Use Federation</h4>
            <ul className="list-disc list-inside text-muted-foreground">
              <li><strong>Large applications</strong> - Keep domain logic separated</li>
              <li><strong>Team collaboration</strong> - Different teams own different stores</li>
              <li><strong>Lazy loading</strong> - Add stores to federation dynamically</li>
              <li><strong>Testing</strong> - Test stores independently or together</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/computed"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            computed
          </Link>
          <div />
        </div>
      </div>
    </div>
  );
}
