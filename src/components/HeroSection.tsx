import {
  ArrowDownRight,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Grid2x2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { ProfileInfo } from '../types/portfolio';
import { CanvasSurface } from '../utils/portfolioLogic';
import { ArchitecturalImage } from './ArchitecturalImage';
import { DraftingCornerMarks, InkDivider, InkUnderline } from './SketchMotion';

interface HeroSectionProps {
  profile: ProfileInfo;
  locale: Locale;
  projectCount: number;
  experienceCount: number;
  sketchCount: number;
  canvasSurface: CanvasSurface;
  copiedLink: boolean;
  onChangeSurface: (surface: CanvasSurface) => void;
  onCopyShowcaseLink: () => void;
  onOpenHeroPlate: () => void;
}

export function HeroSection({
  profile,
  locale,
  projectCount,
  experienceCount,
  sketchCount,
  canvasSurface,
  copiedLink,
  onChangeSurface,
  onCopyShowcaseLink,
  onOpenHeroPlate,
}: HeroSectionProps) {
  const t = UI_TEXT[locale].hero;

  return (
    <section id="top" className="relative bg-transparent">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 pt-6 pb-10 lg:pt-8 lg:pb-12">
        {/* Top corner bar: Drafting Surface toggle neatly positioned with explicit label */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#E5E4DC] no-print">
          <p className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#6B6A65]">
            {profile.institutionLine}
          </p>

          <div
            role="group"
            aria-label={t.canvasGroupAria}
            className="inline-flex items-center gap-1.5"
          >
            <span className="font-mono-tabular text-[11px] uppercase tracking-wider text-[#8A8882] mr-1">
              {t.surfaceLabel}
            </span>
            <div className="inline-flex items-center gap-0.5 p-0.5 bg-[#EFECE6] border border-[#D6D4CC] rounded-[2px]">
              <button
                type="button"
                aria-pressed={canvasSurface === 'paper'}
                onClick={() => onChangeSurface('paper')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-[1px] transition-colors whitespace-nowrap ${
                  canvasSurface === 'paper'
                    ? 'bg-white text-[#141413] shadow-2xs'
                    : 'text-[#575652] hover:text-[#141413]'
                }`}
              >
                <FileText className="w-3 h-3" aria-hidden="true" />
                {t.draftingPaper}
              </button>
              <button
                type="button"
                aria-pressed={canvasSurface === 'grid'}
                onClick={() => onChangeSurface('grid')}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-[1px] transition-colors whitespace-nowrap ${
                  canvasSurface === 'grid'
                    ? 'bg-white text-[#9E3B2E] shadow-2xs'
                    : 'text-[#575652] hover:text-[#141413]'
                }`}
              >
                <Grid2x2 className="w-3 h-3" aria-hidden="true" />
                {t.draftingGrid}
              </button>
            </div>
          </div>
        </div>

        {/* Split-screen architectural monograph hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Typography & Primary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-center py-1"
          >
            <div>
              <h1 className="font-editorial text-[clamp(2.65rem,5vw,4.45rem)] font-semibold leading-[1.02] tracking-tight text-[#141413]">
                {profile.fullName}
              </h1>
              <InkUnderline accent className="mb-4" />

              <p className="text-base sm:text-lg font-medium text-[#2B2B28] leading-snug max-w-xl mb-3">
                {profile.roleTitle}
              </p>

              <p className="text-[15px] leading-[1.68] text-[#575652] max-w-[60ch] mb-4">
                {profile.statement}
              </p>

              {/* Contact & Location clean inline text metadata (Email + LinkedIn, no public phone) */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#575652] mb-5">
                <span>{profile.location}</span>
                <span className="hidden sm:inline text-[#C5C4BC]" aria-hidden="true">
                  /
                </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="hover:text-[#9E3B2E] underline underline-offset-4 decoration-[#D4D3CC] hover:decoration-[#9E3B2E] transition-colors"
                >
                  {profile.email}
                </a>
                <span className="hidden sm:inline text-[#C5C4BC]" aria-hidden="true">
                  /
                </span>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#9E3B2E] underline underline-offset-4 decoration-[#D4D3CC] hover:decoration-[#9E3B2E] transition-colors"
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3" aria-hidden="true" />
                </a>
              </div>
            </div>

            {/* Primary CTA + Quiet Utility Action */}
            <div className="no-print">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#works"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-[2px] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E3B2E]"
                >
                  {t.exploreWorks}
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={onCopyShowcaseLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#141413] bg-[#F3F2EE] border border-[#D6D4CC] hover:border-[#9E3B2E]/50 hover:bg-[#EFECE6] rounded-[2px] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E3B2E]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-[#5A6E58]" aria-hidden="true" />
                      {t.linkCopied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" aria-hidden="true" />
                      {t.copyLink}
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Exhibition Framing of Huang Qiyuan's Cover Ink Study */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            <button
              type="button"
              onClick={onOpenHeroPlate}
              aria-label={`${t.inspectAriaPrefix} ${profile.heroPlateCaption}`}
              className="group relative h-[360px] lg:h-[430px] w-full text-left bg-white border border-[#D6D4CC] hover:border-[#9E3B2E]/60 rounded-[2px] overflow-hidden transition-all duration-220 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(20,20,19,0.28)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E3B2E]"
            >
              <ArchitecturalImage
                src={profile.heroPlateUrl}
                alt={profile.heroPlateCaption}
                title={profile.fullName}
                plateNumber={t.platePrefix}
                priority
                variant="thumbnail"
                fit="contain"
                className="w-full h-full bg-white p-3 sm:p-4"
                imgClassName="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
              />
              <DraftingCornerMarks tone="dark" />
            </button>
            <div className="mt-2.5 flex items-center justify-between gap-4 text-[11px] font-mono-tabular text-[#6B6A65]">
              <span className="truncate">{profile.heroPlateCaption}</span>
              <span className="shrink-0 uppercase">{t.handDrawn}</span>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Quantitative Summary Strip (completely visible above the fold on 1440x900) */}
        <div className="mt-8 pt-6 border-t border-[#D6D4CC] grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <p className="font-mono-tabular text-2xl sm:text-3xl font-medium text-[#141413]">
              {profile.gpaDisplay}
            </p>
            <p className="mt-1 text-xs text-[#575652]">{t.metrics.honours}</p>
          </div>
          <div>
            <p className="font-mono-tabular text-2xl sm:text-3xl font-medium text-[#141413]">
              {String(experienceCount).padStart(2, '0')}
            </p>
            <p className="mt-1 text-xs text-[#575652]">{t.metrics.firms}</p>
          </div>
          <div>
            <p className="font-mono-tabular text-2xl sm:text-3xl font-medium text-[#141413]">
              {String(projectCount).padStart(2, '0')}
            </p>
            <p className="mt-1 text-xs text-[#575652]">{t.metrics.projects}</p>
          </div>
          <div>
            <p className="font-mono-tabular text-2xl sm:text-3xl font-medium text-[#141413]">
              {String(sketchCount).padStart(2, '0')}
            </p>
            <p className="mt-1 text-xs text-[#575652]">{t.metrics.studies}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <InkDivider />
      </div>
    </section>
  );
}
