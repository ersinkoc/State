import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <div className="text-9xl font-bold text-primary/20">404</div>
          <h1 className="text-4xl font-bold mt-4 mb-2">Page Not Found</h1>
          <p className="text-xl text-muted-foreground">
            Sorry, we couldn't find the page you're looking for.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link to="/">
            <Button size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant="outline" size="lg" className="gap-2">
              <Search className="w-4 h-4" />
              Browse Docs
            </Button>
          </Link>
        </div>

        <div className="p-6 bg-muted rounded-lg text-left">
          <h2 className="font-semibold mb-4">Popular Pages</h2>
          <ul className="space-y-2">
            <li>
              <Link
                to="/docs/introduction"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Introduction - Get started with @oxog/state
              </Link>
            </li>
            <li>
              <Link
                to="/docs/quick-start"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quick Start - Build your first store
              </Link>
            </li>
            <li>
              <Link
                to="/api"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                API Reference - Complete API documentation
              </Link>
            </li>
            <li>
              <Link
                to="/examples"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Examples - See @oxog/state in action
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
