import { Languages, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { ARCHITECTURAL_EASE, SHEET_TRANSITION } from './SketchMotion';

interface HeaderProps {
  brandName: string;
  locale: Locale;
  onToggleLocale: () => void;
}

const SECTION_HREFS = ['#works', '#sketches', '#models', '#cv', '#share'] as const;

export function Header({ brandName, locale, onToggleLocale }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { scrollYProgress } = useScroll();
  const t = UI_TEXT[locale];

  const navItems = [
    { label: t.header.nav.works, href: '#works' },
    { label: t.header.nav.sketches, href: '#sketches' },
    { label: t.header.nav.models, href: '#models' },
    { label: t.header.nav.cv, href: '#cv' },
    { label: t.header.nav.contact, href: '#share' },
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      if (y < 140) {
        setActiveSection(null);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const elements = SECTION_HREFS.map((href) => document.querySelector(href)).filter(
      (el): el is Element => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (window.scrollY < 140) return;
        const intersecting = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (intersecting[0]?.target.id) {
          setActiveSection(`#${intersecting[0].target.id}`);
        }
      },
      { rootMargin: '-22% 0px -58% 0px', threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#D6D4CC] transition-[background-color,box-shadow] duration-200 no-print ${
        scrolled
          ? 'bg-[#FAFAF8]/95 backdrop-blur-[2px] shadow-[0_1px_12px_-6px_rgba(20,20,19,0.16)]'
          : 'bg-[#FAFAF8]'
      }`}
    >
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
          {navItems.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActiveSection(item.href)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9E3B2E] ${
                  isActive ? 'text-[#9E3B2E]' : 'hover:text-[#9E3B2E]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="header-active-nav"
                    transition={SHEET_TRANSITION}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -bottom-[1px] h-[1.5px] bg-[#9E3B2E]"
                  />
                )}
              </a>
            );
          })}
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

      {/* Scroll-progress drafting hairline along bottom border */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-[#9E3B2E]/80"
      />

      {/* Mobile navigation drawer */}
      <AnimatePresence initial={false}>
        {mobileMenuOpen && (
          <motion.nav
            aria-label={t.header.mobileNavAria}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: ARCHITECTURAL_EASE }}
            className="md:hidden overflow-hidden border-t border-[#D6D4CC] bg-[#FAFAF8]"
          >
            <div className="px-5 py-4 flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeSection === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setActiveSection(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className={`py-2.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-[#9E3B2E]' : 'text-[#2C2C2A] hover:text-[#9E3B2E]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
