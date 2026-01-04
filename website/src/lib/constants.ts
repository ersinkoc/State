export const PACKAGE_NAME = '@oxog/state';
export const GITHUB_REPO = 'ersinkoc/state';
export const NPM_PACKAGE = '@oxog/state';
export const VERSION = '1.0.0';
export const DESCRIPTION = 'Zero-dependency reactive state management for any framework';
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
    title: 'Advanced',
    items: [
      { title: 'Plugins', href: '/docs/plugins' },
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
    title: 'Plugins',
    items: [
      { title: 'persist', href: '/api/persist' },
      { title: 'devtools', href: '/api/devtools' },
      { title: 'history', href: '/api/history' },
      { title: 'sync', href: '/api/sync' },
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
