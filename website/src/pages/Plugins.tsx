import { CodeBlock } from '../components/CodeBlock';

export function Plugins() {
  const persistCode = `import { persist } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(persist({ key: 'app' }));`;

  const devtoolsCode = `import { devtools } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(devtools({ name: 'My Store' }));`;

  const historyCode = `import { history } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(history({ limit: 50 }));

store.undo();
store.redo();`;

  const syncCode = `import { sync } from '@oxog/state';

const store = createStore({ count: 0 })
  .use(sync({ channel: 'app-state' }));`;

  const immerCode = `import { immer } from '@oxog/state';

const store = createStore({
  items: [{ id: 1, name: 'Item' }],
}).use(immer());

store.setState((draft) => {
  draft.items[0].name = 'Updated';
});`;

  const selectorCode = `import { selector } from '@oxog/state';

const store = createStore({
  items: [1, 2, 3],
}).use(selector({
  selectors: {
    total: (s) => s.items.reduce((a, b) => a + b, 0),
  },
}));`;

  const plugins = [
    {
      name: 'persist',
      description: 'Persist state to localStorage, sessionStorage, or any storage implementation.',
      code: persistCode,
    },
    {
      name: 'devtools',
      description: 'Connect to Redux DevTools extension for debugging.',
      code: devtoolsCode,
    },
    {
      name: 'history',
      description: 'Add undo/redo functionality to your store.',
      code: historyCode,
    },
    {
      name: 'sync',
      description: 'Synchronize state across browser tabs using BroadcastChannel.',
      code: syncCode,
    },
    {
      name: 'immer',
      description: 'Write immutable updates with mutable syntax using Proxy.',
      code: immerCode,
    },
    {
      name: 'selector',
      description: 'Define computed values that automatically update when dependencies change.',
      code: selectorCode,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Plugins
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Extend store functionality with plugins. @oxog/state comes with several built-in plugins.
      </p>

      <div className="space-y-12">
        {plugins.map((plugin) => (
          <section key={plugin.name}>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {plugin.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{plugin.description}</p>
            <CodeBlock code={plugin.code} language="typescript" />
          </section>
        ))}
      </div>
    </div>
  );
}
