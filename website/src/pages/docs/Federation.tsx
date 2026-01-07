import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicFederationCode = `import { createStore, createFederation } from '@oxog/state';

// Create independent stores
const userStore = createStore({
  name: 'John',
  email: 'john@example.com',
  $updateName: (state, name: string) => ({ name }),
});

const cartStore = createStore({
  items: [] as Array<{ id: string; quantity: number }>,
  $addItem: (state, id: string) => ({
    items: [...state.items, { id, quantity: 1 }],
  }),
});

const settingsStore = createStore({
  theme: 'light' as 'light' | 'dark',
  language: 'en',
});

// Federate stores into a single interface
const federation = createFederation({
  user: userStore,
  cart: cartStore,
  settings: settingsStore,
});`;

const federationAccessCode = `// Access federated state
const state = federation.getState();
console.log(state.user.name);      // 'John'
console.log(state.cart.items);     // []
console.log(state.settings.theme); // 'light'

// Subscribe to all changes
federation.subscribe((state) => {
  console.log('State changed:', state);
});

// Subscribe to specific store
federation.subscribeStore('user', (userState) => {
  console.log('User changed:', userState);
});

// Access individual stores
federation.stores.user.setState({ name: 'Jane' });
federation.stores.cart.getState().addItem('product-1');`;

const federationReactCode = `import { useFederation, useFederationStore } from '@oxog/state';

// Use entire federation
function App() {
  const state = useFederation(federation);

  return (
    <div>
      <h1>Welcome, {state.user.name}</h1>
      <p>Cart items: {state.cart.items.length}</p>
      <p>Theme: {state.settings.theme}</p>
    </div>
  );
}

// Use specific store from federation
function UserProfile() {
  const user = useFederationStore(federation, 'user');
  const updateName = useFederationStore(federation, 'user', (s) => s.updateName);

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => updateName('New Name')}>
        Update Name
      </button>
    </div>
  );
}

// Use with selectors
function CartSummary() {
  const itemCount = useFederationStore(
    federation,
    'cart',
    (s) => s.items.length
  );

  return <span>Items in cart: {itemCount}</span>;
}`;

const federationCrossStoreCode = `import { createStore, createFederation } from '@oxog/state';

const authStore = createStore({
  isLoggedIn: false,
  userId: null as string | null,
});

const dataStore = createStore({
  userData: null,
  loading: false,
});

const federation = createFederation({
  auth: authStore,
  data: dataStore,
});

// Cross-store effect: fetch user data when logged in
authStore.subscribe(
  (state) => state.isLoggedIn,
  async (isLoggedIn) => {
    if (isLoggedIn) {
      const userId = authStore.getState().userId;
      dataStore.setState({ loading: true });

      const userData = await fetchUser(userId);
      dataStore.setState({ userData, loading: false });
    } else {
      dataStore.setState({ userData: null });
    }
  }
);`;

const federationTypesCode = `import { createFederation, InferFederationState } from '@oxog/state';

const federation = createFederation({
  user: userStore,
  cart: cartStore,
  settings: settingsStore,
});

// Infer the complete federated state type
type AppState = InferFederationState<typeof federation>;
// {
//   user: { name: string; email: string; updateName: (name: string) => void };
//   cart: { items: Array<{ id: string; quantity: number }>; addItem: (id: string) => void };
//   settings: { theme: 'light' | 'dark'; language: string };
// }`;

export function Federation() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Store Federation</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Combine multiple stores into a unified interface
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What is Store Federation?</h2>
          <p className="text-muted-foreground mb-4">
            Store federation allows you to combine multiple independent stores into
            a single unified interface. This is useful for large applications where
            you want to keep stores modular but need a way to access them together.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Creating a Federation</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>createFederation</code> to combine stores:
          </p>
          <CodeBlock code={basicFederationCode} language="typescript" filename="federation.ts" />

          <h2 className="text-2xl font-semibold mb-4">Accessing Federated State</h2>
          <p className="text-muted-foreground mb-4">
            Access state and subscribe to changes across all federated stores:
          </p>
          <CodeBlock code={federationAccessCode} language="typescript" filename="access.ts" />

          <h2 className="text-2xl font-semibold mb-4">React Integration</h2>
          <p className="text-muted-foreground mb-4">
            Use hooks to access federated stores in React components:
          </p>
          <CodeBlock code={federationReactCode} language="typescript" filename="components.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Cross-Store Effects</h2>
          <p className="text-muted-foreground mb-4">
            Stores in a federation remain independent but can react to each other's changes:
          </p>
          <CodeBlock code={federationCrossStoreCode} language="typescript" filename="effects.ts" />

          <h2 className="text-2xl font-semibold mb-4">TypeScript Support</h2>
          <p className="text-muted-foreground mb-4">
            Infer types from your federation for full type safety:
          </p>
          <CodeBlock code={federationTypesCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4">When to Use Federation</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Large applications</strong>: Keep domain logic separated</li>
            <li><strong>Team collaboration</strong>: Different teams can own different stores</li>
            <li><strong>Lazy loading</strong>: Add stores to federation dynamically</li>
            <li><strong>Testing</strong>: Test stores independently or together</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/computed"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Computed Values
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
