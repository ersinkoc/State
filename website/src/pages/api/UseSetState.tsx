import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function useSetState<TState>(
  store: Store<TState>
): (partial: Partial<TState> | ((state: TState) => Partial<TState>)) => void`;

const basicUsageCode = `import { createStore, useStore, useSetState } from '@oxog/state';

const store = createStore({
  name: '',
  email: '',
  age: 0,
});

function Form() {
  const { name, email, age } = useStore(store);
  const setState = useSetState(store);

  return (
    <form>
      <input
        value={name}
        onChange={(e) => setState({ name: e.target.value })}
        placeholder="Name"
      />
      <input
        value={email}
        onChange={(e) => setState({ email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="number"
        value={age}
        onChange={(e) => setState({ age: Number(e.target.value) })}
        placeholder="Age"
      />
    </form>
  );
}`;

const functionUpdaterCode = `import { useSetState } from '@oxog/state';

function Counter() {
  const count = useStore(store, s => s.count);
  const setState = useSetState(store);

  // Function updater for accessing current state
  const increment = () => setState(state => ({ count: state.count + 1 }));
  const decrement = () => setState(state => ({ count: state.count - 1 }));

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}`;

const dynamicUpdateCode = `import { useSetState } from '@oxog/state';

const store = createStore({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

function DynamicForm() {
  const state = useStore(store);
  const setState = useSetState(store);

  // Single handler for all inputs using computed property names
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({ [name]: value });
  };

  return (
    <form>
      <input name="firstName" value={state.firstName} onChange={handleChange} />
      <input name="lastName" value={state.lastName} onChange={handleChange} />
      <input name="email" value={state.email} onChange={handleChange} />
      <input name="phone" value={state.phone} onChange={handleChange} />
    </form>
  );
}`;

const stableReferenceCode = `import { useSetState } from '@oxog/state';
import { useCallback, memo } from 'react';

const ExpensiveChild = memo(({ onUpdate }: { onUpdate: (value: string) => void }) => {
  console.log('Child rendered');
  return <input onChange={(e) => onUpdate(e.target.value)} />;
});

function Parent() {
  // setState is stable - doesn't change between renders
  const setState = useSetState(store);

  // No need for useCallback - setState is already stable
  const handleUpdate = (value: string) => setState({ name: value });

  return <ExpensiveChild onUpdate={handleUpdate} />;
}`;

export function UseSetState() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">useSetState</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Get a stable setState function for partial state updates
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            <code>useSetState</code> returns a stable reference to the store's <code>setState</code>
            function. This is useful for forms and other scenarios where you need to update
            specific properties without defining actions.
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
                <td className="py-2 pr-4"><code>store</code></td>
                <td className="py-2 pr-4"><code>Store&lt;TState&gt;</code></td>
                <td className="py-2">The store to get setState from</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="Form.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Function Updater</h2>
          <p className="text-muted-foreground mb-4">
            Pass a function to access the current state:
          </p>
          <CodeBlock code={functionUpdaterCode} language="typescript" filename="Counter.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Dynamic Updates</h2>
          <p className="text-muted-foreground mb-4">
            Use computed property names for dynamic form fields:
          </p>
          <CodeBlock code={dynamicUpdateCode} language="typescript" filename="DynamicForm.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Stable Reference</h2>
          <p className="text-muted-foreground mb-4">
            The returned function is stable and can be safely passed to memoized children:
          </p>
          <CodeBlock code={stableReferenceCode} language="typescript" filename="stable.tsx" />

          <h2 className="text-2xl font-semibold mb-4">Returns</h2>
          <p className="text-muted-foreground mb-4">
            Returns the store's <code>setState</code> function with a stable reference.
            Accepts either a partial state object or a function that receives current
            state and returns a partial state.
          </p>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/use-store-selector"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            useStoreSelector
          </Link>
          <Link
            to="/api/get-state"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            getState
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
