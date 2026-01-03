import { Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-semibold text-gray-900 dark:text-gray-100">@oxog/state</p>
            <p>MIT License</p>
            <p>© 2025 Ersin Koç</p>
          </div>

          {/* Right side */}
          <a
            href="https://github.com/ersinkoc/state"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Github size={18} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
