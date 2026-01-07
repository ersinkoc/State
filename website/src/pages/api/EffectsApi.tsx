import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const signatureCode = `function effects(effectsMap: Record<string, Effect>): Plugin

function createEffect<T>(
  selector: (state: S) => T,
  effectFn: (value: T, context: EffectContext) => void | Promise<void>,
  options?: EffectOptions
): Effect

interface EffectContext {
  setState: (partial: Partial<S>) => void;
  getState: () => S;
  signal: AbortSignal;
  onCleanup: (fn: () => void) => void;
}

interface EffectOptions {
  debounce?: number;
  fireImmediately?: boolean;
  equalityFn?: (a: T, b: T) => boolean;
}`;

const basicUsageCode = `import { createStore, effects, createEffect } from '@oxog/state';

const store = createStore({
  searchTerm: '',
  results: [],
  loading: false,
})
.use(effects({
  search: createEffect(
    (state) => state.searchTerm,
    async (term, { setState, signal }) => {
      if (!term) {
        setState({ results: [] });
        return;
      }

      setState({ loading: true });
      const res = await fetch(\`/api/search?q=\${term}\`, { signal });
      const results = await res.json();
      setState({ results, loading: false });
    },
    { debounce: 300 }
  ),
}));`;

const effectContextCode = `createEffect(
  (state) => state.value,
  async (value, context) => {
    // setState - update store state
    context.setState({ loading: true });

    // getState - read current state
    const current = context.getState();

    // signal - AbortSignal for cancelling requests
    await fetch('/api', { signal: context.signal });

    // onCleanup - register cleanup function
    context.onCleanup(() => {
      console.log('Effect cleaned up');
    });
  }
);`;

const cleanupCode = `import { createEffect } from '@oxog/state';

const websocketEffect = createEffect(
  (state) => state.roomId,
  (roomId, { onCleanup }) => {
    const ws = new WebSocket(\`wss://api.example.com/\${roomId}\`);

    ws.onmessage = (e) => {
      // Handle message
    };

    // Cleanup runs before next effect execution
    // or when the store is destroyed
    onCleanup(() => {
      ws.close();
    });
  }
);`;

const optionsCode = `import { createEffect } from '@oxog/state';

createEffect(
  (state) => state.query,
  async (query, { setState }) => {
    // Effect implementation
  },
  {
    // Wait 300ms after last change before running
    debounce: 300,

    // Run immediately when effect is registered
    fireImmediately: true,

    // Custom equality check for selector result
    equalityFn: (a, b) => a.toLowerCase() === b.toLowerCase(),
  }
);`;

export function EffectsApi() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold font-mono">effects</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Reactive side effects plugin with debounce, cleanup, and abort support
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Signature</h2>
          <CodeBlock code={signatureCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-muted-foreground mb-4">
            The <code>effects</code> plugin enables reactive side effects that run
            when selected state changes. Effects are perfect for data fetching,
            subscriptions, and other async operations.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="search.ts" />

          <h2 className="text-2xl font-semibold mb-4">Effect Context</h2>
          <p className="text-muted-foreground mb-4">
            The effect function receives a context object with useful utilities:
          </p>
          <CodeBlock code={effectContextCode} language="typescript" filename="context.ts" />

          <h2 className="text-2xl font-semibold mb-4">Context Properties</h2>
          <table className="w-full text-left border-collapse mb-8">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-4">Property</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>setState</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2">Update store state</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>getState</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2">Read current state</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>signal</code></td>
                <td className="py-2 pr-4"><code>AbortSignal</code></td>
                <td className="py-2">For cancelling async operations</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>onCleanup</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2">Register cleanup function</td>
              </tr>
            </tbody>
          </table>

          <h2 className="text-2xl font-semibold mb-4">Cleanup</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>onCleanup</code> to clean up resources:
          </p>
          <CodeBlock code={cleanupCode} language="typescript" filename="cleanup.ts" />

          <h2 className="text-2xl font-semibold mb-4">Options</h2>
          <CodeBlock code={optionsCode} language="typescript" filename="options.ts" />

          <h2 className="text-2xl font-semibold mb-4">Effect Options</h2>
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
                <td className="py-2 pr-4"><code>debounce</code></td>
                <td className="py-2 pr-4"><code>number</code></td>
                <td className="py-2 pr-4"><code>0</code></td>
                <td className="py-2">Debounce delay in ms</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>fireImmediately</code></td>
                <td className="py-2 pr-4"><code>boolean</code></td>
                <td className="py-2 pr-4"><code>false</code></td>
                <td className="py-2">Run on registration</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4"><code>equalityFn</code></td>
                <td className="py-2 pr-4"><code>function</code></td>
                <td className="py-2 pr-4"><code>===</code></td>
                <td className="py-2">Custom equality check</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/api/logger"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            logger
          </Link>
          <Link
            to="/api/validate"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            validate
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
