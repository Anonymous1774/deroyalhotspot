import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  customTitle?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, customTitle }) => {
  const location = useLocation();

  // Route map lookup for default admin pages
  const routeNameMap: Record<string, string> = {
    'admin': 'Admin Dashboard',
    'plans': 'Internet Plans',
    'profiles': 'Bandwidth Profiles',
    'vouchers': 'Voucher Management',
    'sessions': 'Active Sessions',
    'logs': 'Audit System Logs',
    'settings': 'Network & Domain Settings',
    'login': 'Administrator Sign In',
  };

  // Build breadcrumb steps from current location if items not explicitly passed
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    if (items && items.length > 0) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Portal', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const label = isLast && customTitle 
        ? customTitle 
        : (routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1));
      
      breadcrumbs.push({
        label,
        path: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbList = getBreadcrumbs();

  // Schema.org JSON-LD microdata structure
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbList.map((item, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': item.label,
      'item': item.path ? `https://deroyalhotspot.name.ng${item.path}` : undefined,
    })),
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 py-1.5 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {breadcrumbList.map((item, idx) => {
          const isLast = idx === breadcrumbList.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
              {idx > 0 && <ChevronRight size={14} className="text-slate-400 dark:text-slate-600 flex-shrink-0" />}
              {isLast || !item.path ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                >
                  {idx === 0 && <Home size={13} className="text-slate-400" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
