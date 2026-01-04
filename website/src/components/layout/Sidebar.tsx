import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DOCS_SECTIONS, API_SECTIONS } from '@/lib/constants';
import { ChevronRight } from 'lucide-react';

interface SidebarProps {
  type: 'docs' | 'api';
}

export function Sidebar({ type }: SidebarProps) {
  const location = useLocation();
  const sections = type === 'docs' ? DOCS_SECTIONS : API_SECTIONS;

  return (
    <aside className="w-64 border-r border-border bg-card/50 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <nav className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 px-2 text-sm font-semibold text-foreground">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.href}>
                    <NavLink
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      {isActive && <ChevronRight className="w-4 h-4" />}
                      <span className={isActive ? "" : "ml-6"}>{item.title}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
