import { CodeBlock } from '@/components/code/CodeBlock';
import { Puzzle, Zap, Sparkles } from 'lucide-react';

const persistCode = `import { createStore, persist } from '@oxog/state';

const store = createStore({
  user: null,
  theme: 'light',
})
.use(persist({
  key: 'app-state',
  storage: localStorage,
  // v1.2.0 Enhanced options
  version: 1,
  migrate: (state, version) => {
    // Migration logic between versions
    return state;
  },
  partialize: (state) => ({ theme: state.theme }), // Only persist theme
  encrypt: (data) => btoa(data),  // Optional encryption
  decrypt: (data) => atob(data),
  writeDebounce: 100, // Debounce writes
  onRehydrateStorage: (state) => console.log('Hydrated:', state),
}));`;

const historyCode = `import { createStore, history, hasHistory } from '@oxog/state';

const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
})
.use(history({ limit: 50 }));

// Undo last change
store.undo();

// Redo last undone change
store.redo();

// Check if store has history plugin
if (hasHistory(store)) {
  console.log('Can undo:', store.canUndo());
  console.log('Can redo:', store.canRedo());
}`;

const syncCode = `import { createStore, sync, triggerSync } from '@oxog/state';

const store = createStore({
  todos: [],
})
.use(sync({
  channel: 'app-state',
}));

// Manually trigger sync to other tabs
triggerSync(store);`;

const loggerCode = `import { createStore, logger, createLogger } from '@oxog/state';

// Simple logger
const store = createStore({ count: 0 })
  .use(logger());

// Custom logger with options
const customLogger = createLogger({
  level: 'debug',
  collapsed: true,
  diff: true,
  timestamp: true,
  filter: (action, state) => state.count > 0,
});

const store2 = createStore({ count: 0 }).use(customLogger);`;

const effectsCode = `import { createStore, effects, createEffect } from '@oxog/state';

const store = createStore({
  userId: null,
  user: null,
  loading: false,
})
.use(effects({
  // Effect runs when userId changes
  fetchUser: createEffect(
    (state) => state.userId,
    async (userId, { setState, signal }) => {
      if (!userId) return;
      setState({ loading: true });

      const res = await fetch(\`/api/users/\${userId}\`, { signal });
      const user = await res.json();

      setState({ user, loading: false });
    },
    { debounce: 300 }
  ),
}));`;

const validateCode = `import { createStore, validate, createValidator, combineValidators } from '@oxog/state';

// Simple validation
const store = createStore({
  email: '',
  age: 0,
})
.use(validate({
  validator: (state) => {
    const errors = [];
    if (!state.email.includes('@')) {
      errors.push({ field: 'email', message: 'Invalid email' });
    }
    if (state.age < 0 || state.age > 150) {
      errors.push({ field: 'age', message: 'Invalid age' });
    }
    return { valid: errors.length === 0, errors };
  },
  timing: 'before', // 'before' | 'after' | 'both'
  onError: (errors) => console.error('Validation failed:', errors),
}));

// Using Zod schema
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
});

const zodStore = createStore({ email: '', age: 0 })
  .use(validate({ schema }));`;

const customPluginCode = `import type { Plugin } from '@oxog/state';

const analyticsPlugin: Plugin = {
  name: 'analytics',
  version: '1.0.0',

  install(store) {
    store.subscribe((state, prevState) => {
      // Track state changes
      analytics.track('state_changed', {
        from: prevState,
        to: state,
      });
    });
  },

  onStateChange(state, prevState) {
    // Called on every state change
  },

  onDestroy() {
    // Cleanup when store is destroyed
  },
};

const store = createStore({ count: 0 }).use(analyticsPlugin);`;

const plugins = [
  {
    name: 'persist',
    description: 'Persist state to localStorage/sessionStorage with encryption, migration, and versioning support',
    code: persistCode,
    isNew: false,
  },
  {
    name: 'history',
    description: 'Undo/redo functionality with time travel debugging',
    code: historyCode,
    isNew: false,
  },
  {
    name: 'sync',
    description: 'Synchronize state across browser tabs using BroadcastChannel',
    code: syncCode,
    isNew: false,
  },
  {
    name: 'logger',
    description: 'Development logging with diff, timestamps, and filtering',
    code: loggerCode,
    isNew: true,
  },
  {
    name: 'effects',
    description: 'Reactive side effects with debounce, cleanup, and abort support',
    code: effectsCode,
    isNew: true,
  },
  {
    name: 'validate',
    description: 'Schema-agnostic validation supporting Zod, Yup, or custom validators',
    code: validateCode,
    isNew: true,
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
              <div key={plugin.name} className="border border-border rounded-lg p-6 relative">
                {plugin.isNew && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <Sparkles className="w-3 h-3" />
                    New in v1.2
                  </span>
                )}
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
