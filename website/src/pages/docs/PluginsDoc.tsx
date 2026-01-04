import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Puzzle, Zap, RefreshCw, Database, Radio, Bug } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const pluginUsageCode = `import { createStore } from '@oxog/state';
import { persist, history, sync, devtools } from '@oxog/state';

// Use plugins with fluent API
const store = createStore({
  count: 0,
  user: null,
})
  .use(persist({ key: 'app-state' }))
  .use(history({ limit: 100 }))
  .use(sync({ channel: 'app-sync' }))
  .use(devtools({ name: 'My Store' }));`;

const pluginOrderCode = `// Plugin execution order matters!
// Plugins are called in the order they are added

const store = createStore({ count: 0 })
  .use(persist({ key: 'app' }))   // 1st: Restores state from storage
  .use(history({ limit: 50 }))    // 2nd: Tracks state history
  .use(devtools({ name: 'App' })) // 3rd: DevTools integration`;

const multipleStoresCode = `// Each store can have its own plugins
const userStore = createStore({ user: null })
  .use(persist({ key: 'user' }));

const settingsStore = createStore({ theme: 'dark' })
  .use(persist({ key: 'settings' }))
  .use(sync({ channel: 'settings' }));

const counterStore = createStore({ count: 0 })
  .use(history({ limit: 20 }));`;

const plugins = [
  {
    name: 'persist',
    icon: Database,
    description: 'Persist state to localStorage or sessionStorage with automatic hydration.',
    link: '/api/persist',
  },
  {
    name: 'history',
    icon: RefreshCw,
    description: 'Enable undo/redo functionality with configurable history limit.',
    link: '/api/history',
  },
  {
    name: 'sync',
    icon: Radio,
    description: 'Synchronize state across browser tabs using BroadcastChannel.',
    link: '/api/sync',
  },
  {
    name: 'devtools',
    icon: Bug,
    description: 'Integration with browser Redux DevTools for debugging.',
    link: '/api/devtools',
  },
];

export function PluginsDoc() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Plugins</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Extend your store with powerful built-in plugins
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-primary" />
            Plugin System
          </h2>
          <p className="mb-4 text-muted-foreground">
            @oxog/state uses a micro-kernel architecture with a plugin system that allows
            you to extend the core functionality. Plugins can add new methods to stores,
            intercept state changes, and integrate with external tools.
          </p>

          <h3 className="text-xl font-semibold mb-4">Using Plugins</h3>
          <CodeBlock code={pluginUsageCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            Available Plugins
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {plugins.map((plugin) => {
              const Icon = plugin.icon;
              return (
                <Link
                  key={plugin.name}
                  to={plugin.link}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                >
                  <Icon className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">{plugin.name}</h4>
                    <p className="text-sm text-muted-foreground">{plugin.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          <h3 className="text-xl font-semibold mb-4">Plugin Order</h3>
          <p className="text-muted-foreground mb-4">
            The order in which you add plugins matters. Plugins are executed in the order
            they are registered, so put restoration plugins (like persist) first.
          </p>
          <CodeBlock code={pluginOrderCode} language="typescript" filename="plugin-order.ts" />

          <h3 className="text-xl font-semibold mb-4 mt-8">Multiple Stores</h3>
          <p className="text-muted-foreground mb-4">
            Each store can use different plugins based on its needs:
          </p>
          <CodeBlock code={multipleStoresCode} language="typescript" filename="multiple-stores.ts" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Creating Custom Plugins</h4>
            <p className="text-muted-foreground">
              Want to create your own plugin? Check out the{' '}
              <Link to="/plugins" className="text-primary hover:underline">
                Custom Plugins guide
              </Link>{' '}
              for detailed instructions on the plugin interface and lifecycle hooks.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/react-integration"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            React Integration
          </Link>
          <Link
            to="/docs/typescript"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            TypeScript
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
