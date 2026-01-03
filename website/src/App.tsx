import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { GettingStarted } from './pages/GettingStarted';
import { ApiReference } from './pages/ApiReference';
import { Examples } from './pages/Examples';
import { Plugins } from './pages/Plugins';
import { Playground } from './pages/Playground';

type Page = 'home' | 'getting-started' | 'api' | 'examples' | 'plugins' | 'playground';

function App() {
  const [page, setPage] = useState<Page>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (stored) {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home onNavigate={setPage} />;
      case 'getting-started':
        return <GettingStarted />;
      case 'api':
        return <ApiReference />;
      case 'examples':
        return <Examples />;
      case 'plugins':
        return <Plugins />;
      case 'playground':
        return <Playground />;
      default:
        return <Home onNavigate={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar currentPage={page} onPageChange={setPage} onThemeToggle={toggleTheme} theme={theme} />
      <main className="min-h-screen">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
