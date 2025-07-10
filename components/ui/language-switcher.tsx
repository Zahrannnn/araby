'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Languages } from 'lucide-react';
import { getLocaleDisplayName, locales, type Locale } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] as Locale;

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie for preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 30}`;
    
    // Replace current locale in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    
    router.push(newPath);
  };

  if (variant === 'buttons') {
    return (
      <ToggleGroup
        type="single"
        value={currentLocale}
        onValueChange={(value) => value && handleLocaleChange(value as Locale)}
        className={className}
        variant="outline"
      >
        {locales.map((locale) => (
          <ToggleGroupItem
            key={locale}
            value={locale}
            aria-label={`Switch to ${getLocaleDisplayName(locale)}`}
            className="px-3 py-2"
          >
            {getLocaleDisplayName(locale)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`gap-2 ${className}`}
          aria-label="Select language"
        >
          <Languages className="h-4 w-4" />
          {getLocaleDisplayName(currentLocale)}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={`cursor-pointer ${
              currentLocale === locale ? 'bg-accent' : ''
            }`}
          >
            <Languages className="mr-2 h-4 w-4" />
            {getLocaleDisplayName(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 