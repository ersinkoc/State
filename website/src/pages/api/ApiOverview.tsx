import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';
import { API_SECTIONS } from '@/lib/constants';

export function ApiOverview() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">API Reference</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Complete API documentation for @oxog/state
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Explore the complete API reference for all functions, types, and plugins
            available in @oxog/state.
          </p>

          {API_SECTIONS.map((section) => (
            <div key={section.title} className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors group"
                  >
                    <Code2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
