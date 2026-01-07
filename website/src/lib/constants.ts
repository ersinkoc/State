export const PACKAGE_NAME = '@oxog/state';
export const GITHUB_REPO = 'ersinkoc/state';
export const NPM_PACKAGE = '@oxog/state';
export const VERSION = '1.2.0';
export const DESCRIPTION = 'Zero-dependency reactive state management for any framework - featuring slices, computed values, effects, validation, and middleware support';
export const DOMAIN = 'state.oxog.dev';

export const DOCS_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs/introduction' },
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Core Concepts',
    items: [
      { title: 'Creating Stores', href: '/docs/creating-stores' },
      { title: 'Actions', href: '/docs/actions' },
      { title: 'Selectors', href: '/docs/selectors' },
      { title: 'React Integration', href: '/docs/react-integration' },
    ],
  },
  {
    title: 'Patterns',
    items: [
      { title: 'Slices', href: '/docs/slices' },
      { title: 'Computed Values', href: '/docs/computed' },
      { title: 'Store Federation', href: '/docs/federation' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Plugins', href: '/docs/plugins' },
      { title: 'Effects', href: '/docs/effects' },
      { title: 'Validation', href: '/docs/validation' },
      { title: 'Testing', href: '/docs/testing' },
      { title: 'TypeScript', href: '/docs/typescript' },
      { title: 'Best Practices', href: '/docs/best-practices' },
    ],
  },
];

export const API_SECTIONS = [
  {
    title: 'Core',
    items: [
      { title: 'createStore', href: '/api/create-store' },
      { title: 'useStore', href: '/api/use-store' },
      { title: 'batch', href: '/api/batch' },
    ],
  },
  {
    title: 'React Hooks',
    items: [
      { title: 'useShallow', href: '/api/use-shallow' },
      { title: 'useAction', href: '/api/use-action' },
      { title: 'useStoreSelector', href: '/api/use-store-selector' },
      { title: 'useSetState', href: '/api/use-set-state' },
    ],
  },
  {
    title: 'Store API',
    items: [
      { title: 'getState', href: '/api/get-state' },
      { title: 'setState', href: '/api/set-state' },
      { title: 'subscribe', href: '/api/subscribe' },
      { title: 'merge', href: '/api/merge' },
      { title: 'reset', href: '/api/reset' },
    ],
  },
  {
    title: 'Patterns',
    items: [
      { title: 'createSlice', href: '/api/create-slice' },
      { title: 'computed', href: '/api/computed' },
      { title: 'createFederation', href: '/api/create-federation' },
    ],
  },
  {
    title: 'Plugins',
    items: [
      { title: 'persist', href: '/api/persist' },
      { title: 'devtools', href: '/api/devtools' },
      { title: 'history', href: '/api/history' },
      { title: 'sync', href: '/api/sync' },
      { title: 'logger', href: '/api/logger' },
      { title: 'effects', href: '/api/effects' },
      { title: 'validate', href: '/api/validate' },
    ],
  },
];

export const EXAMPLES = [
  {
    category: 'Basic',
    items: [
      { title: 'Counter', href: '/examples#counter' },
      { title: 'Todo List', href: '/examples#todo-list' },
      { title: 'Form State', href: '/examples#form-state' },
    ],
  },
  {
    category: 'Intermediate',
    items: [
      { title: 'Data Fetching', href: '/examples#data-fetching' },
      { title: 'Shopping Cart', href: '/examples#shopping-cart' },
      { title: 'Auth State', href: '/examples#auth-state' },
    ],
  },
  {
    category: 'Advanced',
    items: [
      { title: 'Undo/Redo', href: '/examples#undo-redo' },
      { title: 'Cross-Tab Sync', href: '/examples#cross-tab-sync' },
      { title: 'Vanilla JS', href: '/examples#vanilla-js' },
    ],
  },
];
