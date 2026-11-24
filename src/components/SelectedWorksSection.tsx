import { ArrowUpRight, Layers, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { PortfolioProject, ProjectCategory } from '../types/portfolio';
import { CategoryFilter } from '../utils/portfolioLogic';
import { ArchitecturalImage } from './ArchitecturalImage';
import {
  ARCHITECTURAL_EASE,
  DraftingCornerMarks,
  InkDivider,
  InkUnderline,
  SHEET_TRANSITION,
} from './SketchMotion';

interface SelectedWorksSectionProps {
  projects: PortfolioProject[];
  totalCount: number;
  locale: Locale;
  categoryFilter: CategoryFilter;
  searchQuery: string;
  activeSkill: string | null;
  onCategoryChange: (category: CategoryFilter) => void;
  onSearchChange: (query: string) => void;
  onClearSkillFilter: () => void;
  onSelectProject: (project: PortfolioProject) => void;
}

const CATEGORIES: CategoryFilter[] = [
  'All',
  'NUS Year 3',
  'NUS Year 2',
  'NUS Year 1',
  'Individual BIM',
  'Professional',
];

const PROJECT_COVER_OVERRIDES: Record<string, string> = {
  'permeable-sports-corridor': '/assets/portfolio/covers/y3s2-corridor-cover.jpg',
  '3rs-heritage-rethought': '/assets/portfolio/covers/y3s1-3rs-cover.jpg',
  'bend-boo-climatic-facade': '/assets/models/y2s2-photos/01-physical-model-boards.jpg',
  'open-celmer': '/assets/models/y2s1-photos/01-side-elevation-circulation.jpg',
};

export function SelectedWorksSection({
  projects,
  totalCount,
  locale,
  categoryFilter,
  searchQuery,
  activeSkill,
  onCategoryChange,
  onSearchChange,
  onClearSkillFilter,
  onSelectProject,
}: SelectedWorksSectionProps) {
  const t = UI_TEXT[locale].works;
  const [showArchive, setShowArchive] = useState(false);

  const isFiltered =
    categoryFilter !== 'All' || searchQuery.trim().length > 0 || activeSkill !== null;

  const featuredProjects = projects.filter((p) => p.featured);
  const hasCuratedSubset = !isFiltered && featuredProjects.length > 0 && featuredProjects.length < projects.length;
  const displayedProjects = hasCuratedSubset && !showArchive ? featuredProjects : projects;
  const archiveRemainder = projects.length - featuredProjects.length;

  return (
    <section id="works" className="pt-14 pb-16 lg:pt-16 lg:pb-20 bg-transparent no-print">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        {/* Section Heading & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="font-mono-tabular text-xs text-[#6B6A65] mb-2">{t.eyebrow}</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              {t.heading}
            </h2>
            <InkUnderline />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 no-print">
            {/* Search Filter */}
            <div className="relative">
              <Search
                className="w-4 h-4 text-[#787670] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="works-search" className="sr-only">
                {t.searchAria}
              </label>
              <input
                id="works-search"
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white border border-[#D6D4CC] rounded-[2px] text-[#141413] placeholder:text-[#8A8882] focus:outline-none focus:border-[#9E3B2E] focus:ring-2 focus:ring-[#9E3B2E]/15"
              />
            </div>
          </div>
        </div>

        {/* Interactive Category Segmented Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 no-print">
          <div
            role="tablist"
            aria-label={t.categoryTabAria}
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F1F0EB] border border-[#D6D4CC] rounded-[2px]"
          >
            {CATEGORIES.map((category) => {
              const active = categoryFilter === category;
              return (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => onCategoryChange(category)}
                  className={`relative px-3.5 py-1.5 text-xs font-medium rounded-[1px] transition-colors duration-150 whitespace-nowrap shrink-0 ${
                    active ? 'text-white' : 'text-[#575652] hover:text-[#141413]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="works-category-pill"
                      transition={SHEET_TRANSITION}
                      aria-hidden="true"
                      className="absolute inset-0 bg-[#141413] rounded-[1px]"
                    />
                  )}
                  <span className="relative z-10">{t.categories[category]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B6A65]">
            {activeSkill && (
              <button
                type="button"
                onClick={onClearSkillFilter}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#9E3B2E] bg-[#F6ECEA] border border-[#9E3B2E]/30 hover:bg-[#EEDCD8] rounded-[2px] transition-colors"
              >
                {t.skillFilterPrefix} {activeSkill}
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            <span className="font-mono-tabular">
              {t.showingCount(displayedProjects.length, totalCount)}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {displayedProjects.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white border border-[#D6D4CC] rounded-[2px]">
            <p className="font-editorial text-2xl text-[#141413] mb-2">{t.emptyTitle}</p>
            <p className="text-sm text-[#575652] mb-5">{t.emptyHint}</p>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('All');
                onSearchChange('');
                onClearSkillFilter();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#9E3B2E] rounded-[2px] transition-colors"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <>
            {/* Editorial 2-Column Drawing-Sheet Grid for Featured Works (consistent 4:3 framing) */}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 ${
                hasCuratedSubset && !showArchive ? 'lg:grid-cols-2 gap-7' : 'lg:grid-cols-12 gap-7'
              }`}
            >
              <AnimatePresence mode="popLayout">
                {displayedProjects.map((project, index) => {
                  const useTwoColHeroGrid = hasCuratedSubset && !showArchive;
                  const isLeadFeature =
                    !useTwoColHeroGrid &&
                    categoryFilter === 'All' &&
                    !searchQuery &&
                    !activeSkill &&
                    index < 2;
                  const coverPlate = project.plates[0];
                  const coverImageUrl = PROJECT_COVER_OVERRIDES[project.id] || coverPlate?.imageUrl;
                  const plateLabel = `${project.plates.length} ${
                    project.plates.length === 1 ? t.plateSingular : t.platePlural
                  }`;
                  const titleBlockCode = `${coverPlate?.plateNumber || `PRJ. 0${index + 1}`} · ${
                    project.scale
                  } · ${project.tools.slice(0, 2).join(' · ').toUpperCase()}`;

                  return (
                    <motion.div
                      key={project.id}
                      layout="position"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        duration: 0.28,
                        delay: Math.min(index, 4) * 0.04,
                        ease: ARCHITECTURAL_EASE,
                      }}
                      className={
                        useTwoColHeroGrid
                          ? 'flex'
                          : isLeadFeature
                            ? 'lg:col-span-6 flex'
                            : 'lg:col-span-4 flex'
                      }
                    >
                      <article className="group w-full flex flex-col bg-white border border-[#D6D4CC] rounded-[2px] overflow-hidden transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[#9E3B2E]/60 hover:shadow-[0_14px_30px_-20px_rgba(20,20,19,0.28)] print-break-avoid">
                        <button
                          type="button"
                          onClick={() => onSelectProject(project)}
                          aria-label={t.openAria(project.title)}
                          className="flex flex-col flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#9E3B2E]"
                        >
                          {/* Uniform 4:3 Full-Bleed Architectural Plate Frame */}
                          <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[#D6D4CC] bg-[#F7F6F2]">
                            <ArchitecturalImage
                              src={coverImageUrl}
                              alt={`${project.title} — ${coverPlate?.caption || project.subtitle}`}
                              title={project.title}
                              plateNumber={coverPlate?.plateNumber || `PRJ. 0${index + 1}`}
                              variant="thumbnail"
                              fit="cover"
                              className="w-full h-full bg-[#F7F6F2]"
                              imgClassName="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035] group-focus-within:scale-[1.035]"
                            />

                            {/* Subtle Ink-Wash Reveal Veil on Hover / Keyboard Focus */}
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141413]/75 via-[#141413]/20 to-transparent opacity-0 transition-opacity duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-within:opacity-100"
                            />

                            {/* Architectural Corner Drafting Crop Marks */}
                            <DraftingCornerMarks tone="light" />

                            {/* Reveal Footer Cue inside Veil */}
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-x-0 bottom-0 px-5 py-3.5 flex items-end justify-between gap-3 text-white translate-y-2 opacity-0 transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                            >
                              <div className="flex items-center gap-2 text-xs font-mono-tabular text-white/95">
                                <Layers className="w-3.5 h-3.5 text-white/90 shrink-0" />
                                <span>{plateLabel}</span>
                              </div>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-white whitespace-nowrap shrink-0">
                                {t.viewPlates}
                                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </span>
                            </div>
                          </div>

                          {/* Title-Block Metadata & Unclipped Summary */}
                          <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono-tabular text-[11px] uppercase tracking-wider text-[#6B6A65] mb-2">
                                <span>{t.categories[project.category] ?? project.category}</span>
                                <span aria-hidden="true">·</span>
                                <span>{project.year}</span>
                                <span aria-hidden="true">·</span>
                                <span>{plateLabel}</span>
                              </div>

                              <div className="flex items-start justify-between gap-3">
                                <h3 className="font-editorial text-2xl font-semibold text-[#141413] leading-tight group-hover:text-[#9E3B2E] transition-colors">
                                  {project.title}
                                </h3>
                                <ArrowUpRight
                                  className="w-4 h-4 text-[#8A8882] group-hover:text-[#9E3B2E] shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                  aria-hidden="true"
                                />
                              </div>

                              <p className="mt-2 text-sm text-[#575652] leading-relaxed">
                                {project.summary}
                              </p>
                            </div>

                            {/* Title-Block Sheet Stamp Footer */}
                            <div className="pt-3 border-t border-[#E6E4DC] flex items-center justify-between gap-3 font-mono-tabular text-[11px] text-[#6B6A65]">
                              <span className="truncate">{titleBlockCode}</span>
                              <span className="shrink-0 text-[#9E3B2E] font-medium">
                                {project.studioOrContext.split('·')[0].trim()}
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {hasCuratedSubset && archiveRemainder > 0 && (
              <div className="mt-8 flex justify-center no-print">
                <button
                  type="button"
                  onClick={() => setShowArchive((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono-tabular uppercase tracking-wider font-medium text-[#141413] bg-white border border-[#D6D4CC] hover:border-[#9E3B2E] hover:text-[#9E3B2E] rounded-[2px] transition-colors"
                >
                  {showArchive ? t.showFeaturedOnly : t.showArchive(archiveRemainder)}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-16 lg:mt-20">
        <InkDivider />
      </div>
    </section>
  );
}

export type { ProjectCategory };
