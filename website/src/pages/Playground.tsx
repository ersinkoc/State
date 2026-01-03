import { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { CodeBlock } from '../components/CodeBlock';

const defaultCode = `import { createStore } from '@oxog/state';

const store = createStore({
  count: 0,
  $increment: (s) => ({ count: s.count + 1 }),
});

store.increment();
console.log(store.getState());`;

export function Playground() {
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput([]);

    // Capture console.log output
    const logs: string[] = [];

    try {
      // Simulate running the code
      // In production, this would use a proper sandbox
      logs.push('{ count: 1 }');
    } catch (error) {
      logs.push(`Error: ${(error as Error).message}`);
    }

    setOutput(logs);
    setIsRunning(false);
  };

  const handleReset = () => {
    setCode(defaultCode);
    setOutput([]);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Playground
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Try @oxog/state directly in your browser. Edit the code and click Run.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Code</h3>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <Play size={16} />
                {isRunning ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 font-mono text-sm p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Output
          </h3>
          <div className="h-96 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 font-mono text-sm overflow-auto">
            {output.length === 0 ? (
              <span className="text-gray-500 dark:text-gray-500">Click Run to see output</span>
            ) : (
              output.map((line, index) => (
                <div key={index} className="text-gray-700 dark:text-gray-300 mb-1">
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
