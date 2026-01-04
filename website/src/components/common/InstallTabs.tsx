import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NPM_PACKAGE } from '@/lib/constants';

const PACKAGE_MANAGERS = [
  { name: 'npm', command: `npm install ${NPM_PACKAGE}` },
  { name: 'yarn', command: `yarn add ${NPM_PACKAGE}` },
  { name: 'pnpm', command: `pnpm add ${NPM_PACKAGE}` },
  { name: 'bun', command: `bun add ${NPM_PACKAGE}` },
] as const;

type PackageManagerName = typeof PACKAGE_MANAGERS[number]['name'];

export function InstallTabs() {
  const [activeTab, setActiveTab] = useState<PackageManagerName>('npm');
  const [copied, setCopied] = useState(false);

  const activeCommand = PACKAGE_MANAGERS.find(pm => pm.name === activeTab)?.command || '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {PACKAGE_MANAGERS.map((pm) => (
          <button
            key={pm.name}
            onClick={() => setActiveTab(pm.name)}
            className={cn(
              "flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === pm.name
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {pm.name}
          </button>
        ))}
      </div>
      <div className="relative">
        <pre className="px-4 py-3 bg-card border border-border rounded-lg text-sm font-mono overflow-x-auto">
          <code>{activeCommand}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-accent transition-colors"
          aria-label="Copy command"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
