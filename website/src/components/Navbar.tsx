import { Menu, X, Sun, Moon, Github } from 'lucide-react';
import { useState } from 'react';
import type { Page } from '../App';

interface NavbarProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onThemeToggle: () => void;
  theme: 'dark' | 'light';
}

const navItems: { key: Page; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'getting-started', label: 'Getting Started' },
  { key: 'api', label: 'API Reference' },
  { key: 'examples', label: 'Examples' },
  { key: 'plugins', label: 'Plugins' },
  { key: 'playground', label: 'Playground' },
];

export function Navbar({ currentPage, onPageChange, onThemeToggle, theme }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={() => onPageChange('home')}
            className="text-xl font-bold text-primary-600 dark:text-primary-400"
          >
            @oxog/state
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`text-sm font-medium transition-colors hover:text-primary-600 dark:hover:text-primary-400 ${
                currentPage === item.key
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/ersinkoc/state"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="GitHub repository"
          >
            <Github size={20} />
          </a>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <div className="space-y-1 px-4 pb-4 pt-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onPageChange(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
