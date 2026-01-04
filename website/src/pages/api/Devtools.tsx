import { CodeBlock } from '@/components/code/CodeBlock';
import { Bug, Eye, Clock } from 'lucide-react';

const basicUsageCode = `import { createStore } from '@oxog/state';
import { devtools } from '@oxog/state';

const store = createStore({
  count: 0,
  user: null,
})
.use(devtools({
  name: 'My Store',
}));

// Open Redux DevTools in your browser to:
// - Inspect current state
// - View action history
// - Time-travel debugging
// - Export/import state`;

const optionsCode = `interface DevtoolsOptions {
  // Store name in DevTools
  name: string;

  // Enable/disable (default: true in development)
  enabled?: boolean;

  // Include action payloads (default: true)
  trace?: boolean;

  // Max actions in history (default: 50)
  maxAge?: number;

  // Serialize state for DevTools
  serialize?: {
    options?: object;
    replacer?: (key: string, value: unknown) => unknown;
    reviver?: (key: string, value: unknown) => unknown;
  };
}`;

const multipleStoresCode = `// Each store appears separately in DevTools
const userStore = createStore({ user: null })
  .use(devtools({ name: 'User Store' }));

const cartStore = createStore({ items: [] })
  .use(devtools({ name: 'Shopping Cart' }));

const settingsStore = createStore({ theme: 'dark' })
  .use(devtools({ name: 'Settings' }));`;

const productionCode = `const store = createStore({ count: 0 })
.use(devtools({
  name: 'App Store',
  // Only enable in development
  enabled: process.env.NODE_ENV === 'development',
}));

// Or conditionally apply the plugin
const store = createStore({ count: 0 });

if (process.env.NODE_ENV === 'development') {
  store.use(devtools({ name: 'App Store' }));
}`;

const actionNamesCode = `const store = createStore({
  count: 0,
}, {
  // Action names appear in DevTools
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
  setCount: (state, value: number) => ({ count: value }),
});

store.use(devtools({ name: 'Counter' }));

// DevTools shows:
// - Counter/increment
// - Counter/decrement
// - Counter/setCount (with payload)`;

const timeTravelCode = `// DevTools features for debugging:

// 1. State inspection - View current state tree
// 2. Action log - See all dispatched actions
// 3. Time travel - Jump to any previous state
// 4. State diff - See what changed per action
// 5. Export/Import - Save and restore state snapshots

// Jump to a specific state programmatically
store.devtools?.jumpToState(5); // Jump to state at index 5

// Pause recording
store.devtools?.pause();

// Resume recording
store.devtools?.resume();`;

export function Devtools() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">devtools</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Integration with Redux DevTools for debugging and time-travel
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 p-4 mb-8 bg-muted rounded-lg">
            <Bug className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold mb-1">Redux DevTools Integration</h3>
              <p className="text-sm text-muted-foreground">
                Use the Redux DevTools browser extension to debug your state.
                Install from{' '}
                <a
                  href="https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Chrome Web Store
                </a>
                {' '}or{' '}
                <a
                  href="https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Firefox Add-ons
                </a>.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Options</h2>
          <CodeBlock code={optionsCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <Eye className="w-6 h-6 text-primary" />
            Multiple Stores
          </h2>
          <p className="text-muted-foreground mb-4">
            Each store appears as a separate instance in DevTools:
          </p>
          <CodeBlock code={multipleStoresCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Production Mode</h2>
          <p className="text-muted-foreground mb-4">
            Disable DevTools in production builds:
          </p>
          <CodeBlock code={productionCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Action Names</h2>
          <p className="text-muted-foreground mb-4">
            Named actions appear with meaningful names in DevTools:
          </p>
          <CodeBlock code={actionNamesCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Time Travel Debugging
          </h2>
          <p className="text-muted-foreground mb-4">
            DevTools enables powerful debugging capabilities:
          </p>
          <CodeBlock code={timeTravelCode} language="typescript" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">DevTools Features</h4>
            <ul className="grid grid-cols-2 gap-2 text-muted-foreground">
              <li>State inspection</li>
              <li>Action history</li>
              <li>Time travel</li>
              <li>State diff</li>
              <li>Export/Import</li>
              <li>Action filtering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
