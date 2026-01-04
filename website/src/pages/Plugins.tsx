import { CodeBlock } from '@/components/code/CodeBlock';
import { Puzzle, Zap } from 'lucide-react';

const persistCode = `import { createStore } from '@oxog/state';
import { persist } from '@oxog/state';

const store = createStore({
  user: null,
  theme: 'light',
})
.use(persist({
  key: 'app-state',
  storage: localStorage, // or sessionStorage
}));`;

const historyCode = `import { createStore } from '@oxog/state';
import { history } from '@oxog/state';

const store = createStore({
  count: 0,
  increment: (state) => ({ count: state.count + 1 }),
})
.use(history({ limit: 50 }));

// Undo last change
store.undo();

// Redo last undone change
store.redo();`;

const syncCode = `import { createStore } from '@oxog/state';
import { sync } from '@oxog/state';

const store = createStore({
  todos: [],
})
.use(sync({
  channel: 'app-state',
}));`;

const customPluginCode = `import type { Plugin } from '@oxog/state';

const loggerPlugin: Plugin = {
  name: 'logger',
  version: '1.0.0',

  install(store) {
    // Log all state changes
    store.subscribe((state, prevState) => {
      console.log('State changed:', prevState, '->', state);
    });
  },

  onStateChange(state, prevState) {
    console.log('onStateChange:', prevState, '->', state);
  },
};

const store = createStore({ count: 0 }).use(loggerPlugin);`;

const plugins = [
  {
    name: 'persist',
    description: 'Persist state to localStorage or sessionStorage',
    code: persistCode,
  },
  {
    name: 'history',
    description: 'Undo/redo functionality with time travel',
    code: historyCode,
  },
  {
    name: 'sync',
    description: 'Synchronize state across browser tabs',
    code: syncCode,
  },
];

export function Plugins() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Plugins</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Extend functionality with the plugin system
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            @oxog/state includes several built-in plugins to extend the core functionality.
            You can also create your own custom plugins.
          </p>

          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Built-in Plugins
          </h2>

          <div className="space-y-8 mb-12">
            {plugins.map((plugin) => (
              <div key={plugin.name} className="border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">{plugin.name}</h3>
                <p className="text-muted-foreground mb-4">{plugin.description}</p>
                <CodeBlock code={plugin.code} language="typescript" filename={`${plugin.name}.ts`} />
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-primary" />
            Custom Plugins
          </h2>

          <p className="text-muted-foreground mb-4">
            You can create custom plugins by implementing the Plugin interface:
          </p>

          <CodeBlock code={customPluginCode} language="typescript" filename="custom-plugin.ts" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Plugin Lifecycle</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><code>install(store, options)</code> - Called when plugin is registered</li>
              <li><code>onInit(store)</code> - Called after all plugins are installed</li>
              <li><code>onStateChange(state, prevState)</code> - Called on state change</li>
              <li><code>onError(error)</code> - Called when an error occurs</li>
              <li><code>onDestroy()</code> - Called when plugin is unregistered</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
