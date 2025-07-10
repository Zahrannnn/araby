'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  HomeIcon,
  BuildingOfficeIcon,
  CogIcon,
  BellIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import Image from 'next/image';
interface SuperAdminSidebarProps {
  locale: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

interface SidebarItem {
  name: string;
  translationKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  subItems?: SidebarSubItem[];
}

interface SidebarSubItem {
  name: string;
  translationKey: string;
  href: string;
  badge?: string | number;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    translationKey: 'dashboard',
    href: '/super-admin',
    icon: HomeIcon,
  },
  {
    name: 'Companies',
    translationKey: 'companies',
    href: '/super-admin/companies',
    icon: BuildingOfficeIcon,
    badge: '127',
    subItems: [
      {
        name: 'All Companies',
        translationKey: 'allCompanies',
        href: '/super-admin/companies',
      },
      {
        name: 'Pending Approval',
        translationKey: 'pendingApproval',
        href: '/super-admin/companies/pending',
        badge: '3',
      },
      {
        name: 'Suspended',
        translationKey: 'suspended',
        href: '/super-admin/companies/suspended',
        badge: '2',
      },
    ],
  },
  
 
  
  {
    name: 'Settings',
    translationKey: 'settings',
    href: '/super-admin/settings',
    icon: CogIcon,
    subItems: [
      {
        name: 'General',
        translationKey: 'general',
        href: '/super-admin/settings/general',
      },
      {
        name: 'Email Templates',
        translationKey: 'emailTemplates',
        href: '/super-admin/settings/email',
      },
      {
        name: 'Feature Flags',
        translationKey: 'featureFlags',
        href: '/super-admin/settings/features',
      },
    ],
  },
];

export function SuperAdminSidebar({ 
  locale, 
  isCollapsed = false, 
  className 
}: SuperAdminSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const t = useTranslations();

  const isActiveRoute = (href: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/');
  };

  const getNavLink = (href: string) => `/${locale}${href}`;

  const toggleExpanded = (itemName: string) => {
    if (isCollapsed) return;
    
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => {
    return expandedItems.includes(itemName) && !isCollapsed;
  };

  return (
    <aside className={cn(
      "bg-sidebar border-r border-sidebar-border h-full flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-3 flex-col">
            <Image src="https://i.postimg.cc/PfWyMjKv/image-removebg-preview.png" alt="NEDX" width={100} height={100} />
            <div>
              <p className="text-xs text-sidebar-foreground/60">Super Admin Portal</p>
            </div>
          </div>
        )}
        
       
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const itemExpanded = isExpanded(item.name);

          return (
            <div key={item.name}>
              {/* Main Item */}
              <div
                className={cn(
                  "group flex items-center justify-between w-full rounded-md transition-colors hover:bg-[#f22e3e] hover:text-white",
                  isActive 
                    ? "bg-[#f22e3e] text-white" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Link
                  href={getNavLink(item.href)}
                  className={cn(
                    `flex items-center flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-[#f22e3e] hover:text-white ${pathname.includes(item.href) ? 'bg-[#f22e3e] text-white' : ''}`,
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? (t(item.translationKey) || item.name) : undefined}
                >
                  <item.icon className={cn(
                    "flex-shrink-0",
                    isCollapsed ? "h-5 w-5" : "h-5 w-5 mr-3"
                  )} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{t(item.translationKey) || item.name}</span>
                      {item.badge && (
                        <span className={cn(
                          "ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          item.badge === '!' 
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-sidebar-primary/10 text-sidebar-primary"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>

                {/* Expand/Collapse Button for Sub Items */}
                {hasSubItems && !isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpanded(item.name)}
                    className="h-8 w-8 mr-1 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  >
                    <ChevronRightIcon 
                      className={cn(
                        "h-4 w-4 transition-transform",
                        itemExpanded && "rotate-90"
                      )} 
                    />
                  </Button>
                )}
              </div>

              {/* Sub Items */}
              {hasSubItems && itemExpanded && !isCollapsed && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const isSubActive = isActiveRoute(subItem.href);
                    return (
                      <Link
                        key={subItem.name}
                        href={getNavLink(subItem.href)}
                        className={cn(
                          "flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors",
                          isSubActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <span>{t(subItem.translationKey) || subItem.name}</span>
                        {subItem.badge && (
                          <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-sidebar-primary/10 text-sidebar-primary">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Collapsed Badge */}
              {isCollapsed && item.badge && (
                <div className="absolute left-8 -mt-8 z-10">
                  <span className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                    item.badge === '!' 
                      ? "bg-red-500 text-white"
                      : "bg-sidebar-primary text-sidebar-primary-foreground"
                  )}>
                    {item.badge}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/50" 
              onClick={() => {
                document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
                window.location.href = '/login';
              }}
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
              {t('logout')}
            </Button>
            <div className="space-y-1">
              <p className="text-xs text-sidebar-foreground/60 px-1">{t('ui.changeLanguage')}</p>
              <LanguageSwitcher variant="dropdown" className="w-full" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 items-center">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <BellIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <QuestionMarkCircleIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
} 