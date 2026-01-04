import { CodeBlock } from '@/components/code/CodeBlock';

const getStateCode = `const store = createStore({ count: 0, name: 'John' });

// Get current state
const state = store.getState();
console.log(state); // { count: 0, name: 'John' }`;

const setStateCode = `const store = createStore({ count: 0 });

// Update with partial object
store.setState({ count: 10 });

// Update with function
store.setState((state) => ({ count: state.count + 1 }));

// Update multiple properties
store.setState({ count: 5, name: 'Jane' });`;

const subscribeCode = `const store = createStore({ count: 0 });

// Subscribe to all changes
const unsubscribe = store.subscribe((state, prevState) => {
  console.log('Changed:', prevState, '->', state);
});

// Subscribe to specific value
const unsubCount = store.subscribe(
  (state) => state.count,
  (count, prevCount) => {
    console.log('Count changed:', prevCount, '->', count);
  }
);

// Unsubscribe
unsubscribe();`;

const mergeCode = `const store = createStore({
  user: { name: 'John', age: 30 },
  settings: { theme: 'light' }
});

// Deep merge
store.merge({
  user: { name: 'Jane' }, // Only updates name, keeps age
  settings: { theme: 'dark' }
});

// Result:
// {
//   user: { name: 'Jane', age: 30 },
//   settings: { theme: 'dark' }
// }`;

const resetCode = `const store = createStore({ count: 0, name: 'John' });

store.setState({ count: 100, name: 'Jane' });

// Reset to initial state
store.reset();
console.log(store.getState()); // { count: 0, name: 'John' }`;

export function StoreMethods() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* getState */}
        <section>
          <h1 className="text-4xl font-bold mb-4">Store API Reference</h1>
          <h2 className="text-3xl font-bold mb-4">getState</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get the current state snapshot
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">Signature</h3>
            <CodeBlock
              code={`function getState(): TState`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-2">Example</h3>
            <CodeBlock code={getStateCode} language="typescript" />
          </div>
        </section>

        {/* setState */}
        <section>
          <h2 className="text-3xl font-bold mb-4">setState</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Update state with partial object or function
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">Signature</h3>
            <CodeBlock
              code={`function setState(
  partial: Partial<TState> | ((state: TState) => Partial<TState>)
): void`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-2">Example</h3>
            <CodeBlock code={setStateCode} language="typescript" />
          </div>
        </section>

        {/* subscribe */}
        <section>
          <h2 className="text-3xl font-bold mb-4">subscribe</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Listen to state changes
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">Signature</h3>
            <CodeBlock
              code={`// Subscribe to all changes
function subscribe(listener: Listener<TState>): () => void;

// Subscribe with selector
function subscribe<TSelected>(
  selector: Selector<TState, TSelected>,
  listener: Listener<TSelected>,
  equalityFn?: EqualityFn<TSelected>
): () => void;`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-2">Example</h3>
            <CodeBlock code={subscribeCode} language="typescript" />
          </div>
        </section>

        {/* merge */}
        <section>
          <h2 className="text-3xl font-bold mb-4">merge</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Deep merge state
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">Signature</h3>
            <CodeBlock
              code={`function merge(partial: DeepPartial<TState>): void`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-2">Example</h3>
            <CodeBlock code={mergeCode} language="typescript" />
          </div>
        </section>

        {/* reset */}
        <section>
          <h2 className="text-3xl font-bold mb-4">reset</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Reset to initial state
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold mb-2">Signature</h3>
            <CodeBlock
              code={`function reset(): void`}
              language="typescript"
            />

            <h3 className="text-xl font-semibold mb-2">Example</h3>
            <CodeBlock code={resetCode} language="typescript" />
          </div>
        </section>
      </div>
    </div>
  );
}
