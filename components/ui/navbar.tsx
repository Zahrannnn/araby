'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { LanguageSwitcher } from './language-switcher';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface NavItem {
  name: string;
  translationKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: ('super-admin' | 'company' | 'employee')[];
}

interface NavbarProps {
  locale: string;
  userRole?: 'super-admin' | 'company' | 'employee';
  userName?: string;
  companyName?: string;
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    translationKey: 'dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['company', 'employee'],
  },
  {
    name: 'Clients',
    translationKey: 'clients',
    href: '/company/clients',
    icon: UserGroupIcon,
    roles: ['company'],
  },
  {
    name: 'Quotes',
    translationKey: 'quotes',
    href: '/company/quotes',
    icon: DocumentTextIcon,
    roles: ['company'],
  },
  {
    name: 'Tasks',
    translationKey: 'tasks',
    href: '/company/tasks',
    icon: ClipboardDocumentListIcon,
    roles: ['company', 'employee'],
  },
  {
    name: 'Employees',
    translationKey: 'employees',
    href: '/company/employees',
    icon: UsersIcon,
    roles: ['company'],
  },
  {
    name: 'Companies',
    translationKey: 'companies',
    href: '/super-admin/companies',
    icon: BuildingOfficeIcon,
    roles: ['super-admin'],
  },
  {
    name: 'Analytics',
    translationKey: 'analytics',
    href: '/super-admin/analytics',
    icon: ChartBarIcon,
    roles: ['super-admin'],
  },
];

export function Navbar({ locale, userRole = 'company', userName = 'John Doe', companyName = 'Araby CRM' }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations();

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(userRole)
  );

  const isActiveRoute = (href: string) => {
    // Remove locale from pathname for comparison
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    return pathWithoutLocale === href || pathWithoutLocale.startsWith(href + '/');
  };

  const getNavLink = (href: string) => `/${locale}${href}`;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={getNavLink('/dashboard')} className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                  {companyName}
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {filteredNavItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.name}
                    href={getNavLink(item.href)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {t(item.translationKey) || item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher variant="dropdown" />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <BellIcon className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userRole === 'super-admin' ? t('roles.superAdmin') || 'Super Administrator' : 
                     userRole === 'company' ? t('roles.companyManager') || 'Company Manager' : 
                     t('roles.employee') || 'Employee'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  {t('profile') || 'Profile'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CogIcon className="mr-2 h-4 w-4" />
                  {t('settings') || 'Settings'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                  <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4" />
                  {t('auth.signOut') || 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            {filteredNavItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  href={getNavLink(item.href)}
                  className={`block px-3 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {t(item.translationKey) || item.name}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="px-4">
              <div className="text-base font-medium text-gray-800 dark:text-white">
                {userName}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {userRole === 'super-admin' ? t('roles.superAdmin') || 'Super Administrator' : 
                 userRole === 'company' ? t('roles.companyManager') || 'Company Manager' : 
                 t('roles.employee') || 'Employee'}
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href={`/${locale}/profile`}
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('profile') || 'Profile'}
              </Link>
              <Link
                href={`/${locale}/settings`}
                className="block px-4 py-2 text-base font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('settings') || 'Settings'}
              </Link>
              <button
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('auth.signOut') || 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 