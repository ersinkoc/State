import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Shield, Code2 } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';

const basicTypesCode = `import { createStore, useStore } from '@oxog/state';

// Define your state type
interface AppState {
  count: number;
  user: User | null;
  items: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Create a fully typed store
const store = createStore<AppState>({
  count: 0,
  user: null,
  items: [],
});`;

const actionsTypesCode = `interface CounterState {
  count: number;
}

interface CounterActions {
  increment: () => void;
  decrement: () => void;
  setCount: (value: number) => void;
}

const store = createStore<CounterState>({
  count: 0,
}, {
  increment: (state) => ({ count: state.count + 1 }),
  decrement: (state) => ({ count: state.count - 1 }),
  setCount: (state, value: number) => ({ count: value }),
});

// Type-safe action calls
store.getState().increment();  // OK
store.getState().setCount(10); // OK
store.getState().setCount("10"); // Error: string not assignable to number`;

const selectorTypesCode = `interface AppState {
  users: User[];
  selectedId: string | null;
}

// Selector with inferred return type
function useSelectedUser() {
  return useStore(store, (state) => {
    if (!state.selectedId) return null;
    return state.users.find(u => u.id === state.selectedId);
  }); // Type: User | null | undefined
}

// Selector with explicit return type
function useUserCount(): number {
  return useStore(store, (state) => state.users.length);
}

// Multiple selectors
function useUserState() {
  const users = useStore(store, (s) => s.users);
  const selectedId = useStore(store, (s) => s.selectedId);

  return { users, selectedId };
}`;

const pluginTypesCode = `import type { Plugin, Store } from '@oxog/state';

// Typed plugin definition
interface LoggerOptions {
  prefix?: string;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

const loggerPlugin: Plugin<LoggerOptions> = {
  name: 'logger',
  version: '1.0.0',

  install(store: Store<unknown>, options?: LoggerOptions) {
    const prefix = options?.prefix || '[Store]';
    const level = options?.logLevel || 'info';

    store.subscribe((state, prevState) => {
      console[level](\`\${prefix} State changed:\`, { prevState, state });
    });
  },
};

// Usage with type inference
const store = createStore({ count: 0 })
  .use(loggerPlugin, { prefix: '[Counter]', logLevel: 'debug' });`;

const strictModeCode = `// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// With strict mode, you get better type inference
const store = createStore({
  count: 0,
  name: '', // inferred as string, not any
});

// Strict null checks catch potential issues
const user = store.getState().user; // User | null
user.name; // Error: Object is possibly 'null'
user?.name; // OK: string | undefined`;

export function TypeScript() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">TypeScript</h1>
        <p className="text-xl text-muted-foreground mb-8">
          First-class TypeScript support with full type inference
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <div className="flex items-center gap-3 p-4 mb-8 bg-muted rounded-lg">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold mb-1">Built with TypeScript</h3>
              <p className="text-sm text-muted-foreground">
                @oxog/state is written in TypeScript with strict mode enabled.
                Get full type safety and autocompletion out of the box.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            Basic Types
          </h2>
          <p className="text-muted-foreground mb-4">
            Define your state interface for full type checking:
          </p>
          <CodeBlock code={basicTypesCode} language="typescript" filename="types.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Typed Actions</h2>
          <p className="text-muted-foreground mb-4">
            Actions are fully typed with parameters and return types:
          </p>
          <CodeBlock code={actionsTypesCode} language="typescript" filename="actions.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Typed Selectors</h2>
          <p className="text-muted-foreground mb-4">
            Selectors automatically infer their return type from the callback:
          </p>
          <CodeBlock code={selectorTypesCode} language="typescript" filename="selectors.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Plugin Types</h2>
          <p className="text-muted-foreground mb-4">
            Plugins can be fully typed with their options:
          </p>
          <CodeBlock code={pluginTypesCode} language="typescript" filename="plugin.ts" />

          <h2 className="text-2xl font-semibold mb-4 mt-8">Strict Mode</h2>
          <p className="text-muted-foreground mb-4">
            For the best experience, enable TypeScript strict mode:
          </p>
          <CodeBlock code={strictModeCode} language="json" filename="tsconfig.json" />

          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Type Exports</h4>
            <p className="text-muted-foreground mb-2">
              All types are exported from the main package:
            </p>
            <CodeBlock
              code={`import type {
  Store,
  Plugin,
  StateSelector,
  Subscriber
} from '@oxog/state';`}
              language="typescript"
            />
          </div>
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
            to="/docs/best-practices"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Best Practices
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
