import { CodeBlock } from '@/components/code/CodeBlock';
import { Radio, Wifi, TabletSmartphone } from 'lucide-react';

const basicUsageCode = `import { createStore } from '@oxog/state';
import { sync } from '@oxog/state';

const store = createStore({
  user: null,
  theme: 'light',
  notifications: [],
})
.use(sync({
  channel: 'app-state',
}));

// Changes in one tab are automatically synced to all other tabs
// Open the same page in multiple tabs to see it in action`;

const optionsCode = `interface SyncOptions {
  // Unique channel name for this store
  channel: string;

  // Sync specific paths only (default: all)
  paths?: string[];

  // Debounce sync broadcasts (ms)
  debounce?: number;

  // Handle incoming state (for conflict resolution)
  merge?: (local: State, remote: State) => State;

  // Enable/disable sync (default: true)
  enabled?: boolean;
}`;

const partialSyncCode = `const store = createStore({
  user: { name: 'John', sessionId: 'abc123' },
  preferences: { theme: 'dark', language: 'en' },
  localState: { sidebarOpen: true },
})
.use(sync({
  channel: 'app-sync',
  // Only sync preferences across tabs
  paths: ['preferences'],
}));

// Synced across tabs:
store.setState({ preferences: { theme: 'light', language: 'fr' } });

// NOT synced (tab-local):
store.setState({ localState: { sidebarOpen: false } });`;

const conflictResolutionCode = `const store = createStore({
  count: 0,
  lastUpdated: Date.now(),
})
.use(sync({
  channel: 'counter-sync',
  merge: (local, remote) => {
    // Last-write-wins strategy
    if (remote.lastUpdated > local.lastUpdated) {
      return remote;
    }
    return local;
  },
}));

// Or merge specific fields
.use(sync({
  channel: 'app-sync',
  merge: (local, remote) => ({
    // Take remote user
    user: remote.user,
    // Keep local notifications
    notifications: local.notifications,
    // Merge items arrays
    items: [...new Set([...local.items, ...remote.items])],
  }),
}));`;

const debouncedSyncCode = `const store = createStore({
  searchQuery: '',
  filters: {},
})
.use(sync({
  channel: 'search-sync',
  debounce: 300, // Wait 300ms between syncs
}));

// Rapid typing only syncs after user stops
store.setState({ searchQuery: 'h' });
store.setState({ searchQuery: 'he' });
store.setState({ searchQuery: 'hel' });
store.setState({ searchQuery: 'hell' });
store.setState({ searchQuery: 'hello' });
// Only "hello" is synced to other tabs`;

const leaderElectionCode = `const store = createStore({
  isLeader: false,
  leaderId: null as string | null,
})
.use(sync({
  channel: 'leader-election',
}));

// Simple leader election
const tabId = crypto.randomUUID();

// Claim leadership on startup
if (!store.getState().leaderId) {
  store.setState({ leaderId: tabId, isLeader: true });
}

// Listen for leadership changes
store.subscribe((state) => {
  const isLeader = state.leaderId === tabId;
  if (isLeader !== state.isLeader) {
    store.setState({ isLeader });
  }
});

// Release leadership on tab close
window.addEventListener('beforeunload', () => {
  if (store.getState().leaderId === tabId) {
    store.setState({ leaderId: null, isLeader: false });
  }
});`;

const reactExampleCode = `function SyncStatus() {
  const theme = useStore(store, (s) => s.theme);

  return (
    <div className="p-4 border rounded">
      <h3>Current Theme: {theme}</h3>
      <p className="text-sm text-gray-500">
        Open this page in another tab and change the theme -
        it will sync automatically!
      </p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => store.setState({ theme: 'light' })}>
          Light
        </button>
        <button onClick={() => store.setState({ theme: 'dark' })}>
          Dark
        </button>
      </div>
    </div>
  );
}`;

export function Sync() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">sync</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Synchronize state across browser tabs using BroadcastChannel
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 p-4 mb-8 bg-muted rounded-lg">
            <Radio className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold mb-1">Real-time Tab Synchronization</h3>
              <p className="text-sm text-muted-foreground">
                Changes in one tab are instantly reflected in all other tabs of the same origin.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Basic Usage</h2>
          <CodeBlock code={basicUsageCode} language="typescript" filename="store.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Options</h2>
          <CodeBlock code={optionsCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <TabletSmartphone className="w-6 h-6 text-primary" />
            Partial Sync
          </h2>
          <p className="text-muted-foreground mb-4">
            Sync only specific parts of state:
          </p>
          <CodeBlock code={partialSyncCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Conflict Resolution</h2>
          <p className="text-muted-foreground mb-4">
            Handle conflicts when tabs have different state:
          </p>
          <CodeBlock code={conflictResolutionCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-primary" />
            Debounced Sync
          </h2>
          <p className="text-muted-foreground mb-4">
            Reduce sync frequency for rapidly changing state:
          </p>
          <CodeBlock code={debouncedSyncCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Leader Election</h2>
          <p className="text-muted-foreground mb-4">
            Implement leader election pattern across tabs:
          </p>
          <CodeBlock code={leaderElectionCode} language="typescript" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">React Example</h2>
          <p className="text-muted-foreground mb-4">
            Demo component showing cross-tab sync:
          </p>
          <CodeBlock code={reactExampleCode} language="typescript" filename="SyncStatus.tsx" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Browser Support</h4>
            <p className="text-muted-foreground">
              Uses the{' '}
              <a
                href="https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                BroadcastChannel API
              </a>
              , supported in all modern browsers. Falls back gracefully in unsupported environments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
