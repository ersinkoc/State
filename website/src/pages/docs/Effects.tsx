import { CodeBlock } from '@/components/code/CodeBlock';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';

const basicEffectCode = `import { createStore, effects, createEffect } from '@oxog/state';

const store = createStore({
  userId: null as string | null,
  user: null,
  loading: false,
  error: null,
})
.use(effects({
  // Effect triggers when userId changes
  fetchUser: createEffect(
    (state) => state.userId,  // Selector - when this changes, effect runs
    async (userId, { setState, signal }) => {
      if (!userId) return;

      setState({ loading: true, error: null });

      try {
        const res = await fetch(\`/api/users/\${userId}\`, { signal });
        const user = await res.json();
        setState({ user, loading: false });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setState({ error: error.message, loading: false });
        }
      }
    }
  ),
}));`;

const effectOptionsCode = `import { createEffect } from '@oxog/state';

const searchEffect = createEffect(
  (state) => state.searchQuery,
  async (query, { setState }) => {
    const results = await searchApi(query);
    setState({ results });
  },
  {
    // Debounce: wait 300ms after last change before running
    debounce: 300,

    // Run immediately on mount
    fireImmediately: true,

    // Custom equality to determine when to re-run
    equalityFn: (a, b) => a.toLowerCase() === b.toLowerCase(),
  }
);`;

const effectCleanupCode = `import { createEffect } from '@oxog/state';

const websocketEffect = createEffect(
  (state) => state.roomId,
  (roomId, { setState, onCleanup }) => {
    if (!roomId) return;

    // Connect to websocket
    const ws = new WebSocket(\`wss://api.example.com/rooms/\${roomId}\`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setState((state) => ({
        messages: [...state.messages, message],
      }));
    };

    // Cleanup function runs before next effect or on unmount
    onCleanup(() => {
      ws.close();
    });
  }
);`;

const multipleEffectsCode = `import { createStore, effects, createEffect } from '@oxog/state';

const store = createStore({
  filters: { category: 'all', sortBy: 'date' },
  products: [],
  analytics: { pageViews: 0 },
})
.use(effects({
  // Fetch products when filters change
  fetchProducts: createEffect(
    (state) => state.filters,
    async (filters, { setState }) => {
      const products = await fetchProducts(filters);
      setState({ products });
    },
    { debounce: 200 }
  ),

  // Track page views
  trackAnalytics: createEffect(
    (state) => state.analytics.pageViews,
    (pageViews) => {
      sendAnalytics('page_view', { count: pageViews });
    }
  ),
}));`;

const effectWithAbortCode = `import { createEffect } from '@oxog/state';

// The signal parameter is automatically provided for aborting requests
const fetchEffect = createEffect(
  (state) => state.searchTerm,
  async (term, { setState, signal }) => {
    setState({ loading: true });

    try {
      // Pass signal to fetch - request will be cancelled if effect re-runs
      const res = await fetch(\`/api/search?q=\${term}\`, { signal });
      const data = await res.json();
      setState({ results: data, loading: false });
    } catch (error) {
      // AbortError means the request was cancelled - not a real error
      if (error.name === 'AbortError') {
        return; // Silently ignore
      }
      setState({ error: error.message, loading: false });
    }
  },
  { debounce: 300 }
);`;

export function Effects() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-4xl font-bold">Effects</h1>
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
            New in v1.2
          </span>
        </div>
        <p className="text-xl text-muted-foreground mb-8">
          Reactive side effects with automatic cleanup and abort support
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">What are Effects?</h2>
          <p className="text-muted-foreground mb-4">
            Effects are reactive side effects that run when selected state changes.
            They're perfect for data fetching, subscriptions, and other async operations
            that need to respond to state changes.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <p className="text-muted-foreground mb-4">
            Create effects using the <code>effects</code> plugin and <code>createEffect</code>:
          </p>
          <CodeBlock code={basicEffectCode} language="typescript" filename="effects.ts" />

          <h2 className="text-2xl font-semibold mb-4">Effect Options</h2>
          <p className="text-muted-foreground mb-4">
            Configure effects with debouncing, immediate execution, and custom equality:
          </p>
          <CodeBlock code={effectOptionsCode} language="typescript" filename="options.ts" />

          <h2 className="text-2xl font-semibold mb-4">Cleanup Functions</h2>
          <p className="text-muted-foreground mb-4">
            Use <code>onCleanup</code> to clean up resources when the effect re-runs or unmounts:
          </p>
          <CodeBlock code={effectCleanupCode} language="typescript" filename="cleanup.ts" />

          <h2 className="text-2xl font-semibold mb-4">Multiple Effects</h2>
          <p className="text-muted-foreground mb-4">
            Define multiple effects in a single plugin call:
          </p>
          <CodeBlock code={multipleEffectsCode} language="typescript" filename="multiple.ts" />

          <h2 className="text-2xl font-semibold mb-4">Abort Controller</h2>
          <p className="text-muted-foreground mb-4">
            Effects provide an abort signal for cancelling in-flight requests:
          </p>
          <CodeBlock code={effectWithAbortCode} language="typescript" filename="abort.ts" />

          <h2 className="text-2xl font-semibold mb-4">Best Practices</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li><strong>Use debounce for user input</strong>: Prevent excessive API calls</li>
            <li><strong>Handle AbortError</strong>: Don't treat cancelled requests as errors</li>
            <li><strong>Always clean up</strong>: Close connections, clear timers in onCleanup</li>
            <li><strong>Keep effects focused</strong>: One effect per concern</li>
          </ul>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/plugins"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Plugins
          </Link>
          <Link
            to="/docs/validation"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Validation
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
