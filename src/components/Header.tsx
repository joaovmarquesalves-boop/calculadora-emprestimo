import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { useSiteConfig } from '../context/SiteConfigContext';

const Header = () => {
  const {
    config: { header, company },
  } = useSiteConfig();

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:flex-nowrap">
        <Link to="/" className="flex items-center gap-3 text-left">
          <img
            src={header.logoUrl || logo}
            alt={header.companyName}
            className="h-10 w-10"
            loading="eager"
          />
          <span className="text-lg font-semibold tracking-tight text-primary-900">
            {header.companyName}
          </span>
        </Link>

        <nav className="flex flex-1 items-center justify-end gap-4 text-sm font-medium text-primary-800">
          {company.enabled && (
            <NavLink
              to="/empresa"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 transition ${
                  isActive
                    ? 'bg-primary-100 text-primary-900 shadow-highlight'
                    : 'hover:text-primary-600'
                }`
              }
            >
              Nossa empresa
            </NavLink>
          )}
        </nav>

        <span className="w-full text-sm font-medium text-primary-700 md:w-auto md:text-right">
          {header.tagline}
        </span>
      </div>
    </header>
  );
};

export default Header;
