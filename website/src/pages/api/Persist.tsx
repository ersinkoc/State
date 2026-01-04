import { CodeBlock } from '@/components/code/CodeBlock';
import { Database, HardDrive, Zap } from 'lucide-react';

const basicUsageCode = `import { createStore } from '@oxog/state';
import { persist } from '@oxog/state';

const store = createStore({
  user: null,
  theme: 'light',
  preferences: {},
})
.use(persist({
  key: 'app-state',
}));

// State is automatically saved to localStorage
// and restored on page reload`;

const optionsCode = `interface PersistOptions {
  // Required: Storage key
  key: string;

  // Storage backend (default: localStorage)
  storage?: Storage;

  // Partial state selection
  paths?: string[];

  // Version for migrations
  version?: number;

  // Migration function
  migrate?: (persisted: unknown, version: number) => State;

  // Serialize/deserialize functions
  serialize?: (state: State) => string;
  deserialize?: (str: string) => State;

  // Debounce writes (ms)
  debounce?: number;
}`;

const storageOptionsCode = `// localStorage (default)
store.use(persist({ key: 'app' }));

// sessionStorage (cleared when tab closes)
store.use(persist({
  key: 'app',
  storage: sessionStorage,
}));

// Custom storage (e.g., IndexedDB adapter)
const customStorage: Storage = {
  getItem: (key) => myDB.get(key),
  setItem: (key, value) => myDB.set(key, value),
  removeItem: (key) => myDB.delete(key),
};

store.use(persist({
  key: 'app',
  storage: customStorage,
}));`;

const partialPersistCode = `const store = createStore({
  user: { name: 'John', token: 'secret' },
  ui: { theme: 'dark', sidebarOpen: true },
  cache: { /* large cached data */ },
});

// Only persist specific paths
store.use(persist({
  key: 'app',
  paths: ['user.name', 'ui.theme'],
  // token and cache are NOT persisted
}));`;

const migrationCode = `const store = createStore({
  count: 0,
  items: [],
})
.use(persist({
  key: 'app',
  version: 2,
  migrate: (persisted, version) => {
    if (version === 1) {
      // Migrate from v1 to v2
      return {
        ...persisted,
        items: persisted.todos || [], // renamed field
      };
    }
    return persisted;
  },
}));`;

const serializationCode = `import superjson from 'superjson';

const store = createStore({
  createdAt: new Date(),
  data: new Map([['key', 'value']]),
})
.use(persist({
  key: 'app',
  // Handle Date, Map, Set, etc.
  serialize: (state) => superjson.stringify(state),
  deserialize: (str) => superjson.parse(str),
}));`;

const debounceCode = `const store = createStore({ count: 0 })
.use(persist({
  key: 'app',
  debounce: 300, // Wait 300ms after last change before saving
}));

// Rapid updates only write once after settling
store.setState({ count: 1 });
store.setState({ count: 2 });
store.setState({ count: 3 });
// Only one write to storage after 300ms`;

export function Persist() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">persist</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Persist state to localStorage or sessionStorage with automatic hydration
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 p-4 mb-8 bg-muted rounded-lg">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold mb-1">Automatic Persistence</h3>
              <p className="text-sm text-muted-foreground">
                State is automatically saved and restored across page reloads.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Options</h2>
          <CodeBlock code={optionsCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-primary" />
            Storage Options
          </h2>
          <CodeBlock code={storageOptionsCode} language="typescript" filename="storage.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Partial Persistence</h2>
          <p className="text-muted-foreground mb-4">
            Only persist specific parts of your state:
          </p>
          <CodeBlock code={partialPersistCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Migrations</h2>
          <p className="text-muted-foreground mb-4">
            Handle schema changes between versions:
          </p>
          <CodeBlock code={migrationCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Custom Serialization</h2>
          <p className="text-muted-foreground mb-4">
            Handle non-JSON types like Date, Map, Set:
          </p>
          <CodeBlock code={serializationCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Debounced Writes
          </h2>
          <p className="text-muted-foreground mb-4">
            Avoid excessive writes during rapid updates:
          </p>
          <CodeBlock code={debounceCode} language="typescript" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Methods Added to Store</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><code>store.clearPersisted()</code> - Clear persisted state from storage</li>
              <li><code>store.hydrate()</code> - Manually trigger hydration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
