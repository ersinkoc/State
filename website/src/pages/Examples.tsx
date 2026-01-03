import { CodeBlock } from '../components/CodeBlock';

export function Examples() {
  const counterCode = `import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
  $increment: (s) => ({ count: s.count + 1 }),
  $decrement: (s) => ({ count: s.count - 1 }),
});

store.increment();
console.log(store.getState().count); // 1`;

  const asyncCode = `const store = createStore({
  data: null,
  loading: false,
  $fetch: async (s, url) => {
    store.setState({ loading: true });
    const res = await fetch(url);
    const data = await res.json();
    return { data, loading: false };
  },
});

await store.fetch('/api/users');`;

  const persistCode = `import { persist } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(persist({ key: 'my-app' }));`;

  const historyCode = `import { history } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(history({ limit: 50 }));

store.setState({ count: 1 });
store.setState({ count: 2 });

store.undo(); // { count: 1 }
store.redo(); // { count: 2 }`;

  const examples = [
    {
      title: 'Counter',
      description: 'Basic counter with increment/decrement actions.',
      code: counterCode,
    },
    {
      title: 'Async Data Fetching',
      description: 'Handle async operations with loading states.',
      code: asyncCode,
    },
    {
      title: 'Persistence',
      description: 'Persist state to localStorage automatically.',
      code: persistCode,
    },
    {
      title: 'Undo/Redo',
      description: 'Add time-travel debugging with history plugin.',
      code: historyCode,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Examples
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Practical examples to help you get started with @oxog/state.
      </p>

      <div className="space-y-12">
        {examples.map((example) => (
          <section key={example.title}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {example.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{example.description}</p>
            <CodeBlock code={example.code} language="typescript" />
          </section>
        ))}
      </div>
    </div>
  );
}
