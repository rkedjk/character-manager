import { NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const navItems = [
  { to: '/', label: 'Library' },
  { to: '/import', label: 'Import' },
  { to: '/settings', label: 'Settings' }
];

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Local-first PWA</p>
          <h1>Character Manager</h1>
        </div>
      </header>
      <main className="content">{children}</main>
      <nav className="bottom-nav" aria-label="Primary">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
