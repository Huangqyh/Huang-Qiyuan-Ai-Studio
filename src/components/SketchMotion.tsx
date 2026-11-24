import { motion } from 'motion/react';
import { ReactNode, useEffect } from 'react';

export const ARCHITECTURAL_EASE = [0.16, 1, 0.3, 1] as const;

export const SHEET_TRANSITION = {
  duration: 0.22,
  ease: ARCHITECTURAL_EASE,
} as const;

/**
 * Locks background document scrolling while a lightbox or modal sheet is open.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [locked]);
}

interface InkDividerProps {
  className?: string;
}

/**
 * Hand-drawn architectural ink rule that draws itself left-to-right as it enters the viewport.
 */
export function InkDivider({ className = '' }: InkDividerProps) {
  return (
    <div className={`w-full overflow-hidden no-print ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 1200 12"
        fill="none"
        preserveAspectRatio="none"
        className="w-full h-3 block text-[#C8C6BD]"
      >
        {/* Subtle primary fineliner stroke with slight organic draft variation */}
        <motion.path
          d="M 2 6.4 C 180 5.3, 410 7.1, 610 5.8 C 820 4.6, 1020 6.8, 1198 5.6"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.25 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.72, ease: ARCHITECTURAL_EASE }}
        />
        {/* Delicate end registration cross-ticks */}
        <motion.path
          d="M 10 2.5 L 10 9.5 M 1190 2.5 L 1190 9.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.75 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.3, delay: 0.45 }}
        />
      </svg>
    </div>
  );
}

interface InkUnderlineProps {
  className?: string;
  accent?: boolean;
}

/**
 * Delicate pen-drawn underline accent beneath editorial section titles.
 */
export function InkUnderline({ className = '', accent = false }: InkUnderlineProps) {
  return (
    <svg
      viewBox="0 0 160 10"
      fill="none"
      aria-hidden="true"
      className={`h-2.5 w-28 mt-1.5 overflow-visible no-print ${
        accent ? 'text-[#9E3B2E]/80' : 'text-[#141413]/35'
      } ${className}`}
    >
      <motion.path
        d="M 1 6.5 C 42 4.2, 104 3.8, 158 5.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.58, delay: 0.08, ease: ARCHITECTURAL_EASE }}
      />
    </svg>
  );
}

/**
 * Four architectural drafting crop ticks that animate in around a drawing frame on hover/focus.
 */
export function DraftingCornerMarks({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const strokeColor = tone === 'light' ? 'border-white/85' : 'border-[#141413]/45';
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-3 opacity-0 scale-[0.96] transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100"
    >
      <span className={`absolute top-0 left-0 w-3.5 h-3.5 border-t-[1.5px] border-l-[1.5px] ${strokeColor}`} />
      <span className={`absolute top-0 right-0 w-3.5 h-3.5 border-t-[1.5px] border-r-[1.5px] ${strokeColor}`} />
      <span className={`absolute bottom-0 left-0 w-3.5 h-3.5 border-b-[1.5px] border-l-[1.5px] ${strokeColor}`} />
      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-b-[1.5px] border-r-[1.5px] ${strokeColor}`} />
    </div>
  );
}

interface StaggerRevealItemProps {
  children: ReactNode;
  index: number;
  className?: string;
}

/**
 * Compositor-only staggered entrance animation for portfolio cards, CV entries, and sketch frames.
 */
export function StaggerRevealItem({
  children,
  index,
  className = '',
}: StaggerRevealItemProps) {
  const cappedDelay = Math.min(index, 5) * 0.055;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.42,
        delay: cappedDelay,
        ease: ARCHITECTURAL_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
