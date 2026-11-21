import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  brandName: string;
  pdfUrl: string;
}

export function Header({ brandName, pdfUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Works', href: '#works' },
    { label: 'Curriculum Vitae', href: '#cv' },
    { label: 'Sketches', href: '#sketches' },
    { label: '3D Models', href: '#models' },
    { label: 'Contact', href: '#share' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8] border-b border-[#E5E5E0] no-print">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          className="font-editorial text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
        >
          {brandName}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#575652]"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#141413] transition-colors duration-150 whitespace-nowrap shrink-0 py-1 border-b border-transparent hover:border-[#141413]/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single Visitor Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={pdfUrl}
            download="Huang_Qiyuan_CV_and_Portfolio.pdf"
            className="px-4 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
          >
            Download PDF
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-[#141413] hover:bg-[#EFECE6] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#E5E5E0] bg-[#FAFAF8] px-5 py-4 flex flex-col gap-1"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-[#2C2C2A] hover:text-[#1D4ED8] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
