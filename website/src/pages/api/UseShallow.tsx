import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function useShallow<T>(
  selector: (state: S) => T
): (state: S) => T`;

const basicUsageCode = `import { createStore, useStore, useShallow } from '@oxog/state';

const store = createStore({
  users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
  settings: { theme: 'dark', lang: 'en' },
});

function Component() {
  // Without useShallow - re-renders on ANY state change
  // because object reference changes each render
  // const data = useStore(store, s => ({ users: s.users, settings: s.settings }));

  // With useShallow - only re-renders when object VALUES change
  const data = useStore(
    store,
    useShallow(s => ({
      users: s.users,
      settings: s.settings,
    }))
  );

  return <div>{data.users.length} users</div>;
}`;

const arrayUsageCode = `import { useStore, useShallow } from '@oxog/state';

function UserList() {
  // Shallow compare array elements
  const users = useStore(
    store,
    useShallow(s => s.users.map(u => u.name))
  );

  // Only re-renders when user names actually change
  return (
    <ul>
      {users.map(name => <li key={name}>{name}</li>)}
    </ul>
  );
}`;

const comparisonCode = `// Without useShallow - always re-renders
const Component1 = () => {
  // New object created every render = new reference = re-render
  const { a, b } = useStore(store, s => ({ a: s.a, b: s.b }));
  return <div>{a} {b}</div>;
};

// With useShallow - re-renders only when values change
const Component2 = () => {
  // Shallow equality check: { a: 1, b: 2 } === { a: 1, b: 2 } → true
  const { a, b } = useStore(store, useShallow(s => ({ a: s.a, b: s.b })));
  return <div>{a} {b}</div>;
};`;

export function UseShallow() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">useShallow</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Wrap selectors that return objects to prevent unnecessary re-renders
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>useShallow</code> creates a selector wrapper that uses shallow equality
            comparison instead of reference equality. This prevents re-renders when
            a selector returns a new object or array with the same values.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="Component.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Array Usage</h2>
          <p className="text-muted-foreground mb-4">
            Also works for arrays - compares elements by position:
          </p>
          <CodeBlock code={arrayUsageCode} language="typescript" filename="UserList.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Comparison</h2>
          <p className="text-muted-foreground mb-4">
            Understand when <code>useShallow</code> helps:
          </p>
          <CodeBlock code={comparisonCode} language="typescript" filename="comparison.tsx" />

          <h2 className="text-2xl font-semibold mb-4">When to Use</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Selectors that return objects: <code>{'s => ({ a: s.a, b: s.b })'}</code></li>
            <li>Selectors that return arrays: <code>{'s => s.items.map(i => i.id)'}</code></li>
            <li>Selecting multiple properties at once</li>
          </ul>

          <h2 className="text-2xl font-semibold mb-4">When NOT to Use</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>Selecting primitive values: <code>{'s => s.count'}</code></li>
            <li>Selecting stable references: <code>{'s => s.user'}</code></li>
            <li>Deep nested object comparison (use custom equality)</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/use-store"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            useStore
          </Link>
          <Link
            to="/api/use-action"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            useAction
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
