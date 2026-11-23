import { Languages, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Locale, UI_TEXT } from '../i18n/translations';

interface HeaderProps {
  brandName: string;
  locale: Locale;
  onToggleLocale: () => void;
}

export function Header({ brandName, locale, onToggleLocale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = UI_TEXT[locale];

  const navItems = [
    { label: t.header.nav.works, href: '#works' },
    { label: t.header.nav.sketches, href: '#sketches' },
    { label: t.header.nav.models, href: '#models' },
    { label: t.header.nav.cv, href: '#cv' },
    { label: t.header.nav.contact, href: '#share' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8] border-b border-[#D6D4CC] no-print">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-editorial text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E3B2E]"
        >
          {brandName}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label={t.header.primaryNavAria}
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#575652]"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#9E3B2E] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#9E3B2E]/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E3B2E]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Language Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleLocale}
            aria-label={t.switchToLanguageAria}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#9E3B2E] rounded-[2px] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E3B2E]"
          >
            <Languages className="w-3.5 h-3.5" aria-hidden="true" />
            {t.switchToLanguageLabel}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? t.header.closeMenuAria : t.header.openMenuAria}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-[2px] text-[#141413] hover:bg-[#EFECE6] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label={t.header.mobileNavAria}
          className="md:hidden border-t border-[#D6D4CC] bg-[#FAFAF8] px-5 py-4 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-[#2C2C2A] hover:text-[#9E3B2E] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
