import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicActionCode = `import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

store.increment();
console.log(store.count); // 1`;

const actionWithArgsCode = `import { createStore } from '@oxog/state';

const store = createStore({
  items: [] as string[],
  addItem: (state, item: string) => ({
    items: [...state.items, item]
  }),
  removeItem: (state, index: number) => ({
    items: state.items.filter((_, i) => i !== index)
  }),
});

store.addItem('Apple');
store.addItem('Banana');
store.removeItem(0);`;

const asyncActionCode = `import { createStore } from '@oxog/state';

const store = createStore({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (state, id: string) => {
    store.setState({ loading: true, error: null });
    try {
      const res = await fetch(\`/api/users/\${id}\`);
      const user = await res.json();
      return { user, loading: false };
    } catch (error) {
      return { error, loading: false };
    }
  },
});

await store.fetchUser(123);`;

const actionBestPracticesCode = `// ✅ Good: Actions return partial state
const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
});

// ❌ Bad: Actions modify state directly
const store = createStore({
  count: 0,
  increment: (state) => {
    state.count++; // Don't do this!
    return state;
  },
});

// ✅ Good: Actions are pure
const store = createStore({
  todos: [],
  addTodo: (state, text: string) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  }),
});

// ❌ Bad: Actions have side effects
const store = createStore({
  todos: [],
  addTodo: (state, text: string) => {
    console.log('Adding todo'); // Side effect
    fetch('/api/todos'); // Side effect
    return { todos: [...state.todos, { text }] };
  },
});`;

export function Actions() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Actions</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Define state transformations with actions
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Basic Actions</h2>
          <p className="text-muted-foreground mb-4">
            Actions are functions that receive the current state and return a partial state update:
          </p>
          <CodeBlock code={basicActionCode} language="typescript" filename="action.ts" />

          <h2 className="text-2xl font-semibold mb-4">Actions with Arguments</h2>
          <p className="text-muted-foreground mb-4">
            Actions can receive additional arguments after the state:
          </p>
          <CodeBlock code={actionWithArgsCode} language="typescript" filename="args.ts" />

          <h2 className="text-2xl font-semibold mb-4">Async Actions</h2>
          <p className="text-muted-foreground mb-4">
            Actions can be async for data fetching and other asynchronous operations:
          </p>
          <CodeBlock code={asyncActionCode} language="typescript" filename="async.ts" />

          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <CodeBlock code={actionBestPracticesCode} language="typescript" filename="practices.ts" />

          <h2 className="text-2xl font-semibold mb-4">Action Guidelines</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Return partial state</strong>: Only return the properties that changed</li>
            <li><strong>Keep actions pure</strong>: No side effects in actions</li>
            <li><strong>Use async for API calls</strong>: Return promises for async operations</li>
            <li><strong>Name actions clearly</strong>: Use verbs like increment, add, remove, set</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/creating-stores"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Creating Stores
          </Link>
          <Link
            to="/docs/selectors"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Selectors
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
