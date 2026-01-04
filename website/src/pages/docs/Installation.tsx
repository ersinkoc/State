import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CodeBlock } from '@/components/code/CodeBlock';
import { InstallTabs } from '@/components/common/InstallTabs';

const peerDepsCode = `# npm
npm install react@^18

# yarn
yarn add react@^18

# pnpm
pnpm add react@^18

# bun
bun add react@^18`;

const importCode = `// ES Modules
import { createStore, useStore } from '@oxog/state';

// CommonJS
const { createStore, useStore } = require('@oxog/state');`;

export function Installation() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Installation</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Get started with @oxog/state in your project
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl font-semibold mb-4">Package Manager</h2>
          <p className="mb-4 text-muted-foreground">
            Install @oxog/state using your preferred package manager:
          </p>
          <div className="mb-8">
            <InstallTabs />
          </div>

          <h2 className="text-2xl font-semibold mb-4">Peer Dependencies</h2>
          <p className="mb-4 text-muted-foreground">
            If you're using React, make sure you have React 18 or higher installed:
          </p>
          <CodeBlock code={peerDepsCode} language="bash" filename="terminal" />

          <h2 className="text-2xl font-semibold mb-4">Importing</h2>
          <p className="mb-4 text-muted-foreground">
            You can import the functions you need from the package:
          </p>
          <CodeBlock code={importCode} language="typescript" filename="index.ts" />

          <h2 className="text-2xl font-semibold mb-4">TypeScript Support</h2>
          <p className="mb-4 text-muted-foreground">
            @oxog/state is written in TypeScript and includes type definitions out of
            the box. No additional @types packages are needed.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <p className="text-muted-foreground mb-4">
            After installation, check out the Quick Start guide to create your first store.
          </p>
        </div>

        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Link
            to="/docs/introduction"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Introduction
          </Link>
          <Link
            to="/docs/quick-start"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            Quick Start
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
