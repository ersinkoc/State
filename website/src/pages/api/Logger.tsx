import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function logger(options?: LoggerOptions): Plugin

interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  collapsed?: boolean;
  diff?: boolean;
  timestamp?: boolean;
  filter?: (action: string, state: any) => boolean;
}`;

const basicUsageCode = `import { createStore, logger } from '@oxog/state';

const store = createStore({
  count: 0,
  $increment: (state) => ({ count: state.count + 1 }),
})
.use(logger());

// Console output on increment:
// [Store] Action: increment
// prev state: { count: 0 }
// next state: { count: 1 }`;

const optionsCode = `import { createStore, logger, createLogger } from '@oxog/state';

// Using logger with options
const store = createStore({ count: 0 })
  .use(logger({
    level: 'debug',      // Minimum log level
    collapsed: true,     // Collapse console groups
    diff: true,          // Show state diff
    timestamp: true,     // Show timestamps
  }));

// Or use createLogger for reusable configuration
const customLogger = createLogger({
  level: 'info',
  collapsed: true,
  diff: true,
  timestamp: true,
});

const store2 = createStore({ count: 0 }).use(customLogger);`;

const filterCode = `import { createStore, logger } from '@oxog/state';

const store = createStore({
  count: 0,
  lastUpdated: Date.now(),
  $increment: (state) => ({ count: state.count + 1, lastUpdated: Date.now() }),
  $updateTime: () => ({ lastUpdated: Date.now() }),
})
.use(logger({
  // Only log when count changes
  filter: (action, state) => action === 'increment',
}));

// updateTime actions won't be logged`;

const productionCode = `import { createStore, logger } from '@oxog/state';

const store = createStore({ count: 0 });

// Only add logger in development
if (process.env.NODE_ENV === 'development') {
  store.use(logger({
    collapsed: true,
    diff: true,
  }));
}`;

export function Logger() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">logger</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Development logging with diff, timestamps, and filtering
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            The <code>logger</code> plugin logs state changes to the console during
            development. It supports collapsible groups, state diffs, timestamps,
            and custom filtering.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Options</h2>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Option</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Default</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>level</code></td>
                <td className="py-2 pr-4"><code>string</code></td>
                <td className="py-2 pr-4"><code>'info'</code></td>
                <td className="py-2">Minimum log level</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>collapsed</code></td>
                <td className="py-2 pr-4"><code>boolean</code></td>
                <td className="py-2 pr-4"><code>false</code></td>
                <td className="py-2">Collapse console groups</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>diff</code></td>
                <td className="py-2 pr-4"><code>boolean</code></td>
                <td className="py-2 pr-4"><code>false</code></td>
                <td className="py-2">Show state diff</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>timestamp</code></td>
                <td className="py-2 pr-4"><code>boolean</code></td>
                <td className="py-2 pr-4"><code>false</code></td>
                <td className="py-2">Show timestamps</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>filter</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2 pr-4"><code>undefined</code></td>
                <td className="py-2">Filter which changes to log</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="logger.ts" />

          <h2 className="text-2xl font-semibold mb-4">Custom Options</h2>
          <CodeBlock code={optionsCode} language="typescript" filename="options.ts" />

          <h2 className="text-2xl font-semibold mb-4">Filtering Logs</h2>
          <p className="text-muted-foreground mb-4">
            Use the filter option to only log specific state changes:
          </p>
          <CodeBlock code={filterCode} language="typescript" filename="filter.ts" />

          <h2 className="text-2xl font-semibold mb-4">Production Usage</h2>
          <p className="text-muted-foreground mb-4">
            Only enable logging in development:
          </p>
          <CodeBlock code={productionCode} language="typescript" filename="production.ts" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Note</h4>
            <p className="text-muted-foreground">
              The logger plugin should only be used in development. Make sure to
              conditionally add it based on your environment to avoid console
              noise in production.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/sync"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            sync
          </Link>
          <Link
            to="/api/effects"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            effects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
