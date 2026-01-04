import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';

interface DocsLayoutProps {
  type: 'docs' | 'api';
}

export function DocsLayout({ type }: DocsLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex">
        <Sidebar type={type} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
