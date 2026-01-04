import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const createStoreCode = `import { createStore } from '@oxog/state';

// Create a store with state and actions
const store = createStore({
  count: 0,
  name: 'World',
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
  setName: (state, name: string) => ({ name }),
});

// Access the state
console.log(store.getState()); // { count: 0, name: 'World' }

// Call an action
store.increment();
console.log(store.getState()); // { count: 1, name: 'World' }

// Update state directly
store.setState({ count: 10 });
console.log(store.getState()); // { count: 10, name: 'World' }`;

const reactHookCode = `import { useStore } from '@oxog/state';

function Counter() {
  // Select the entire state
  const state = useStore(store);

  // Select a specific value
  const count = useStore(store, (s) => s.count);

  // Select an action
  const increment = useStore(store, (s) => s.increment);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}`;

const vanillaSubscribeCode = `// Subscribe to all state changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('State changed:', prevState, '->', state);
});

// Subscribe to a specific value
const unsubCount = store.subscribe(
  (state) => state.count,
  (count, prevCount) => {
    console.log('Count changed:', prevCount, '->', count);
  }
);

// Unsubscribe when done
unsubscribe();
unsubCount();`;

export function QuickStart() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Quick Start</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Create your first store and start managing state
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Creating a Store</h2>
          <p className="mb-4 text-muted-foreground">
            Use the <code>createStore</code> function to create a new store with your
            initial state and actions:
          </p>
          <CodeBlock code={createStoreCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4">Using in React</h2>
          <p className="mb-4 text-muted-foreground">
            Use the <code>useStore</code> hook to access your store in React components:
          </p>
          <CodeBlock code={reactHookCode} language="typescript" filename="Counter.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Using in Vanilla JavaScript</h2>
          <p className="mb-4 text-muted-foreground">
            Subscribe to state changes using the <code>subscribe</code> method:
          </p>
          <CodeBlock code={vanillaSubscribeCode} language="typescript" filename="index.ts" />

          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Learn about <Link to="/docs/creating-stores" className="text-primary hover:underline">Creating Stores</Link></li>
            <li>Explore <Link to="/docs/actions" className="text-primary hover:underline">Actions</Link></li>
            <li>Check out <Link to="/docs/selectors" className="text-primary hover:underline">Selectors</Link></li>
            <li>Discover <Link to="/docs/plugins" className="text-primary hover:underline">Plugins</Link></li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/installation"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Installation
          </Link>
          <Link
            to="/docs/creating-stores"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Creating Stores
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
