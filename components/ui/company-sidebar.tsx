'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  CreditCardIcon,
  UserGroupIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { useNotifications } from '@/hooks/useNotifications';
import Image from 'next/image';

interface CompanySidebarProps {
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
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Dashboard',
    translationKey: 'dashboard',
    href: '/company',
    icon: HomeIcon,
  },
  {
    name: 'Kunden',
    translationKey: 'customers',
    href: '/company/customers',
    icon: UsersIcon,
  },
  {
    name: 'Angebote',
    translationKey: 'offers',
    href: '/company/offers',
    icon: DocumentTextIcon,
  },
  {
    name: 'Rechnungen',
    translationKey: 'invoices',
    href: '/company/invoices',
    icon: ReceiptPercentIcon,
  },
  {
    name: 'Aufgaben',
    translationKey: 'tasks',
    href: '/company/tasks',
    icon: CheckCircleIcon,
  },
  {
    name: 'Ausgaben',
    translationKey: 'expenses',
    href: '/company/expenses',
    icon: CreditCardIcon,
  },
  {
    name: 'Mitarbeiter',
    translationKey: 'employees',
    href: '/company/employees',
    icon: UserGroupIcon,
  },
  {
    name: 'Einstellungen',
    translationKey: 'settings',
    href: '/company/company-settings',
    icon: Cog6ToothIcon,
  },
];

export function CompanySidebar({ 
  locale, 
  isCollapsed = false, 
  className 
}: CompanySidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();
  const { getUnreadCount } = useNotifications();

  const isActiveRoute = (href: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/');
  };

  const getNavLink = (href: string) => `/${locale}${href}`;

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    window.location.href = '/login';
  };

  // Mobile menu toggle button (shown only on mobile)
  const MobileMenuToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="md:hidden fixed top-4 left-4 z-50 bg-white shadow-md border"
    >
      {isMobileMenuOpen ? (
        <XMarkIcon className="h-5 w-5" />
      ) : (
        <Bars3Icon className="h-5 w-5" />
      )}
    </Button>
  );

  // Mobile overlay
  const MobileOverlay = () => (
    isMobileMenuOpen && (
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
        onClick={closeMobileMenu}
      />
    )
  );

  const SidebarContent = () => (
    <>
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex flex-col items-center space-y-2">
            <Image 
              src="https://i.postimg.cc/PfWyMjKv/image-removebg-preview.png" 
              alt="NEDX" 
              width={120} 
              height={40}
              className="object-contain"
            />
            <p className="text-sm text-gray-600 font-medium">{t('roles.companyManager')}</p>
          </div>
        )}
        
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={closeMobileMenu}
          className="md:hidden absolute top-4 right-4"
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 mx-4 my-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-semibold text-lg">M</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">Geschäftsführer@Firma.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = isActiveRoute(item.href);

          return (
            <Link
              key={item.name}
              href={getNavLink(item.href)}
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                isActive 
                  ? "bg-[#f22e3e] text-white" 
                  : "text-gray-700 hover:bg-gray-50",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? (t(item.translationKey) || item.name) : undefined}
            >
              <item.icon className={cn(
                "flex-shrink-0 h-5 w-5",
                isActive ? "text-white" : "text-gray-500",
                !isCollapsed && "mr-3"
              )} />
              
              {!isCollapsed && (
                <span>{t(item.translationKey) || item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4">
        {!isCollapsed ? (
          <div className="space-y-3">
            {/* Language Section */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">{t('ui.changeLanguage') || 'Change Language'}</p>
              <LanguageSwitcher variant="dropdown" className="w-full" />
            </div>
            
            {/* Separator */}
            <div className="border-t border-gray-100"></div>
            
            {/* Notifications */}
            <div className="flex items-center space-x-3 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="relative">
                <BellIcon className="h-5 w-5" />
                {getUnreadCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">•</span>
                  </span>
                )}
              </div>
              <span className="text-sm">{t('notifications.button') || 'Notifications'}</span>
              {getUnreadCount() > 0 && (
                <span className="ml-auto inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                  {getUnreadCount()}
                </span>
              )}
            </div>
            
            {/* Log out */}
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-600 hover:bg-gray-50 text-sm px-2" 
              onClick={handleLogout}
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              {t('logout') || 'Log out'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 items-center">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
              >
                <BellIcon className="h-4 w-4" />
              </Button>
              {getUnreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Toggle */}
      <MobileMenuToggle />

      {/* Mobile Overlay */}
      <MobileOverlay />

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out",
        // Desktop sidebar
        "hidden md:flex",
        isCollapsed ? "w-16" : "w-72",
        // Mobile sidebar
        "md:relative",
        isMobileMenuOpen && "fixed inset-y-0 left-0 z-40 w-72 flex md:hidden",
        className
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <aside className={cn(
          "md:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 h-full flex flex-col transition-transform duration-300 ease-in-out transform",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </aside>
      )}
    </>
  );
} 