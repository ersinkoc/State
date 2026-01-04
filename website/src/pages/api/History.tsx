import { CodeBlock } from '@/components/code/CodeBlock';
import { RefreshCw, Undo2, Redo2, History as HistoryIcon } from 'lucide-react';

const basicUsageCode = `import { createStore } from '@oxog/state';
import { history } from '@oxog/state';

const store = createStore({
  count: 0,
  items: [],
})
.use(history());

// Make some changes
store.setState({ count: 1 });
store.setState({ count: 2 });
store.setState({ count: 3 });

// Undo last change
store.undo(); // count: 2

// Undo again
store.undo(); // count: 1

// Redo
store.redo(); // count: 2`;

const optionsCode = `interface HistoryOptions {
  // Maximum history entries (default: 100)
  limit?: number;

  // Filter which state changes to track
  filter?: (state: State, prevState: State) => boolean;

  // Paths to track (default: all)
  paths?: string[];
}`;

const limitedHistoryCode = `const store = createStore({ count: 0 })
.use(history({
  limit: 50, // Keep last 50 states
}));

// When limit is exceeded, oldest entries are removed
for (let i = 0; i < 100; i++) {
  store.setState({ count: i });
}

// Only last 50 states are available for undo`;

const filteredHistoryCode = `const store = createStore({
  text: '',
  cursorPosition: 0,
})
.use(history({
  // Only track text changes, not cursor movement
  filter: (state, prevState) => state.text !== prevState.text,
}));

// Typing "hello" creates 5 history entries
store.setState({ text: 'h', cursorPosition: 1 });
store.setState({ text: 'he', cursorPosition: 2 });
store.setState({ text: 'hel', cursorPosition: 3 });
store.setState({ text: 'hell', cursorPosition: 4 });
store.setState({ text: 'hello', cursorPosition: 5 });

// Cursor movement doesn't create history
store.setState({ text: 'hello', cursorPosition: 0 });`;

const pathsHistoryCode = `const store = createStore({
  user: { name: 'John', email: 'john@example.com' },
  ui: { sidebarOpen: true },
  cache: { data: null },
})
.use(history({
  // Only track user changes
  paths: ['user'],
}));

// Creates history entry
store.setState({ user: { name: 'Jane', email: 'jane@example.com' } });

// Does NOT create history entry
store.setState({ ui: { sidebarOpen: false } });`;

const historyStateCode = `const store = createStore({ count: 0 })
.use(history());

// Check history state
const canUndo = store.canUndo();  // boolean
const canRedo = store.canRedo();  // boolean

// Get history info
const info = store.getHistoryInfo();
// {
//   past: 5,      // number of undo steps available
//   future: 2,    // number of redo steps available
//   current: 3,   // current position in history
// }

// Clear history
store.clearHistory();`;

const reactExampleCode = `function UndoRedoControls() {
  const canUndo = useStore(store, () => store.canUndo());
  const canRedo = useStore(store, () => store.canRedo());

  return (
    <div className="flex gap-2">
      <button
        onClick={() => store.undo()}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        onClick={() => store.redo()}
        disabled={!canRedo}
      >
        Redo
      </button>
    </div>
  );
}

// With keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      }
      if (e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        store.redo();
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);`;

export function History() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">history</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Enable undo/redo functionality with configurable history tracking
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 p-4 mb-8 bg-muted rounded-lg">
            <RefreshCw className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold mb-1">Undo/Redo Made Simple</h3>
              <p className="text-sm text-muted-foreground">
                Add time-travel capabilities to any store with a single plugin.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Options</h2>
          <CodeBlock code={optionsCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-primary" />
            History Limit
          </h2>
          <p className="text-muted-foreground mb-4">
            Limit memory usage by capping history entries:
          </p>
          <CodeBlock code={limitedHistoryCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Filtered History</h2>
          <p className="text-muted-foreground mb-4">
            Only track significant changes:
          </p>
          <CodeBlock code={filteredHistoryCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Path-Based Tracking</h2>
          <p className="text-muted-foreground mb-4">
            Track changes to specific state paths:
          </p>
          <CodeBlock code={pathsHistoryCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-primary" />
            <Redo2 className="w-5 h-5 text-primary" />
            History State
          </h2>
          <p className="text-muted-foreground mb-4">
            Query and manage history state:
          </p>
          <CodeBlock code={historyStateCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">React Example</h2>
          <p className="text-muted-foreground mb-4">
            Build undo/redo controls in React:
          </p>
          <CodeBlock code={reactExampleCode} language="typescript" filename="UndoRedo.tsx" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Methods Added to Store</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><code>store.undo()</code> - Undo last change</li>
              <li><code>store.redo()</code> - Redo last undone change</li>
              <li><code>store.canUndo()</code> - Check if undo is available</li>
              <li><code>store.canRedo()</code> - Check if redo is available</li>
              <li><code>store.clearHistory()</code> - Clear all history</li>
              <li><code>store.getHistoryInfo()</code> - Get history state info</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
