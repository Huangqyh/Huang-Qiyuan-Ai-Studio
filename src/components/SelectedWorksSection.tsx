import { ArrowUpRight, Layers, Search, X } from 'lucide-react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { PortfolioProject, ProjectCategory } from '../types/portfolio';
import { CategoryFilter } from '../utils/portfolioLogic';
import { ArchitecturalImage } from './ArchitecturalImage';
import {
  DraftingCornerMarks,
  InkDivider,
  InkUnderline,
  StaggerRevealItem,
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

  return (
    <section id="works" className="pt-14 pb-16 lg:pt-16 lg:pb-20 bg-transparent">
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
                className="w-full sm:w-64 pl-9 pr-3 py-2 text-sm bg-white border border-[#DFDED8] rounded-md text-[#141413] placeholder:text-[#8A8882] focus:outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
              />
            </div>
          </div>
        </div>

        {/* Interactive Category Segmented Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 no-print">
          <div
            role="tablist"
            aria-label={t.categoryTabAria}
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F1F0EB]/95 border border-[#E5E4DC] rounded-lg"
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
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#575652] hover:text-[#141413]'
                  }`}
                >
                  {t.categories[category]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6B6A65]">
            {activeSkill && (
              <button
                type="button"
                onClick={onClearSkillFilter}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1D4ED8] bg-[#EFF4FF] hover:bg-[#E0EAFF] rounded-md transition-colors"
              >
                {t.skillFilterPrefix} {activeSkill}
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
            <span className="font-mono-tabular">{t.showingCount(projects.length, totalCount)}</span>
          </div>
        </div>

        {/* Empty State */}
        {projects.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white border border-[#E5E5E0] rounded-xl">
            <p className="font-editorial text-2xl text-[#141413] mb-2">{t.emptyTitle}</p>
            <p className="text-sm text-[#575652] mb-5">{t.emptyHint}</p>
            <button
              type="button"
              onClick={() => {
                onCategoryChange('All');
                onSearchChange('');
                onClearSkillFilter();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#141413] hover:bg-[#1D4ED8] rounded-md transition-colors"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          /* Editorial Bento Grid with Staggered Reveal, Tactile Zoom, and Soft Ink-Wash Overlay */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-7">
            {projects.map((project, index) => {
              const isLeadFeature =
                categoryFilter === 'All' &&
                !searchQuery &&
                !activeSkill &&
                index < 2;
              const coverPlate = project.plates[0];
              const plateLabel = `${project.plates.length} ${
                project.plates.length === 1 ? t.plateSingular : t.platePlural
              }`;

              return (
                <StaggerRevealItem
                  key={project.id}
                  index={index}
                  className={isLeadFeature ? 'lg:col-span-6 flex' : 'lg:col-span-4 flex'}
                >
                  <article className="group w-full flex flex-col bg-white border border-[#E5E5E0] rounded-xl overflow-hidden transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-[#BDBBB2] hover:shadow-[0_14px_30px_-20px_rgba(20,20,19,0.28)] print-break-avoid">
                    <button
                      type="button"
                      onClick={() => onSelectProject(project)}
                      aria-label={t.openAria(project.title)}
                      className="flex flex-col flex-1 text-left focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1D4ED8]"
                    >
                      {/* Drawing Plate Container with Tactile Zoom & Soft Ink-Wash Reveal Overlay */}
                      <div
                        className={`relative w-full overflow-hidden border-b border-[#EFECE6] bg-white ${
                          isLeadFeature ? 'h-[300px] sm:h-[340px]' : 'h-[260px] sm:h-[280px]'
                        }`}
                      >
                        <ArchitecturalImage
                          src={coverPlate?.imageUrl}
                          alt={`${project.title} — ${coverPlate?.caption || project.subtitle}`}
                          title={project.title}
                          plateNumber={coverPlate?.plateNumber || `PRJ. 0${index + 1}`}
                          variant="thumbnail"
                          fit={
                            project.id === '3rs-heritage-rethought' ||
                            project.id === 'permeable-sports-corridor'
                              ? 'cover'
                              : 'contain'
                          }
                          className={`w-full h-full ${
                            project.id === '3rs-heritage-rethought' ||
                            project.id === 'permeable-sports-corridor'
                              ? 'bg-[#FAF9F6]'
                              : 'bg-white p-2.5'
                          }`}
                          imgClassName={`${
                            project.id === 'permeable-sports-corridor' ? 'object-top ' : ''
                          }transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.048] group-focus-within:scale-[1.048]`}
                        />

                        {/* Soft Ink-Wash Reveal Veil on Hover / Keyboard Focus */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141413]/80 via-[#141413]/30 to-[#141413]/5 opacity-0 transition-opacity duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-focus-within:opacity-100"
                        />

                        {/* Architectural Corner Drafting Crop Marks */}
                        <DraftingCornerMarks tone="light" />

                        {/* Reveal Footer Cue inside Soft Ink-Wash Veil */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 bottom-0 px-5 py-4 flex items-end justify-between gap-3 text-white translate-y-2 opacity-0 transition-all duration-220 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                        >
                          <div className="flex items-center gap-2 text-xs font-mono-tabular text-white/90">
                            <Layers className="w-3.5 h-3.5 text-white/85 shrink-0" />
                            <span>
                              {plateLabel} · {project.scale}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-wide text-white whitespace-nowrap shrink-0">
                            {t.viewPlates}
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </div>
                      </div>

                      {/* Editorial Metadata & Title */}
                      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#6B6A65] mb-2">
                            <span>{t.categories[project.category] ?? project.category}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">{project.year}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">{plateLabel}</span>
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-editorial text-2xl font-semibold text-[#141413] leading-tight group-hover:text-[#1D4ED8] transition-colors">
                              {project.title}
                            </h3>
                            <ArrowUpRight
                              className="w-4 h-4 text-[#8A8882] group-hover:text-[#1D4ED8] shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              aria-hidden="true"
                            />
                          </div>

                          <p className="mt-2 text-sm text-[#575652] leading-relaxed line-clamp-3">
                            {project.summary}
                          </p>
                        </div>

                        {/* Clean unboxed tools & scale footer */}
                        <div className="pt-3 border-t border-[#F0EFEA] flex items-center justify-between gap-3 text-xs text-[#6B6A65]">
                          <span className="truncate">{project.tools.join(' · ')}</span>
                          <span className="font-mono-tabular shrink-0">{project.scale}</span>
                        </div>
                      </div>
                    </button>
                  </article>
                </StaggerRevealItem>
              );
            })}
          </div>
        )}
      </div>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-16 lg:mt-20">
        <InkDivider />
      </div>
    </section>
  );
}

export type { ProjectCategory };
