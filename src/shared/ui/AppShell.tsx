import { NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { useI18n } from '../i18n/I18nProvider';

export function AppShell({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const navItems = [
    { to: '/', label: t('nav.library') },
    { to: '/import', label: t('nav.import') },
    { to: '/settings', label: t('nav.settings') }
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{t('app.eyebrow')}</p>
          <h1>{t('app.title')}</h1>
        </div>
      </header>
      <main className="content">{children}</main>
      <nav className="bottom-nav" aria-label={t('app.title')}>
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
