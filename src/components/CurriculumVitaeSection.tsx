import { ChevronDown, ChevronUp, FileDown, Printer, X } from 'lucide-react';
import { useState } from 'react';
import {
  AdditionalVenture,
  CommunityServiceItem,
  EducationItem,
  SkillGroup,
  WorkExperience,
} from '../types/portfolio';
import { getMatchingExperienceIds } from '../utils/portfolioLogic';
import { InkDivider, InkUnderline, StaggerRevealItem } from './SketchMotion';

interface CurriculumVitaeSectionProps {
  experiences: WorkExperience[];
  education: EducationItem[];
  skillGroups: SkillGroup[];
  ventures: AdditionalVenture[];
  communityService: CommunityServiceItem[];
  pdfUrl: string;
  activeSkill: string | null;
  onToggleSkill: (skill: string) => void;
  onClearSkill: () => void;
}

export function CurriculumVitaeSection({
  experiences,
  education,
  skillGroups,
  ventures,
  communityService,
  pdfUrl,
  activeSkill,
  onToggleSkill,
  onClearSkill,
}: CurriculumVitaeSectionProps) {
  const [collapsedExpIds, setCollapsedExpIds] = useState<Record<string, boolean>>({});
  const matchedExpIds = getMatchingExperienceIds(experiences, activeSkill);

  const toggleExperience = (id: string) => {
    setCollapsedExpIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section id="cv" className="section-optimize pt-14 pb-16 lg:pt-16 lg:pb-20 bg-[#F5F4EF]/70">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <p className="font-mono-tabular text-xs text-[#6B6A65] mb-2">
              02. Curriculum Vitae
            </p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              Practice, Education &amp; Technical Proficiencies
            </h2>
            <InkUnderline />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141413] bg-white border border-[#DFDED8] hover:border-[#141413] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" aria-hidden="true" />
              Print CV
            </button>

            <a
              href={pdfUrl}
              download="Huang_Qiyuan_CV_and_Portfolio.pdf"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#141413] bg-white border border-[#DFDED8] hover:border-[#141413] rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <FileDown className="w-3.5 h-3.5" aria-hidden="true" />
              Full Portfolio PDF
            </a>
          </div>
        </div>

        {/* Two-column editorial CV grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Main Column: Work Experience & Education */}
          <div className="lg:col-span-8 space-y-12">
            {/* Architectural Practice Experience */}
            <div>
              <div className="flex items-center justify-between gap-4 pb-3 mb-6 border-b border-[#DFDED8]">
                <h3 className="text-sm font-semibold text-[#141413]">
                  Architectural Experience
                </h3>
                {activeSkill && (
                  <div className="flex items-center gap-2 text-xs text-[#1D4ED8]">
                    <span>
                      Highlighting roles using <strong>{activeSkill}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={onClearSkill}
                      aria-label={`Clear ${activeSkill} skill filter`}
                      className="p-0.5 rounded hover:bg-[#E0EAFF]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {experiences.map((exp, expIndex) => {
                  const isHighlighted = activeSkill ? matchedExpIds.has(exp.id) : false;
                  const isDimmed = Boolean(activeSkill) && !isHighlighted;
                  const isCollapsed = Boolean(collapsedExpIds[exp.id]);

                  return (
                    <StaggerRevealItem key={exp.id} index={expIndex}>
                      <article
                        data-highlighted={isHighlighted ? 'true' : 'false'}
                        className={`bg-white rounded-xl border transition-all duration-150 hover:border-[#C5C4BC] print-break-avoid ${
                          isHighlighted
                            ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/10'
                            : 'border-[#E5E5E0]'
                        } ${isDimmed ? 'opacity-50' : 'opacity-100'}`}
                      >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-editorial text-2xl font-semibold text-[#141413] leading-snug">
                              {exp.company}
                            </h4>
                            <p className="text-sm font-medium text-[#2C2C2A] mt-0.5">
                              {exp.role} · {exp.location}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono-tabular text-xs text-[#6B6A65]">
                              {exp.period}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleExperience(exp.id)}
                              aria-expanded={!isCollapsed}
                              aria-label={
                                isCollapsed
                                  ? `Expand details for ${exp.company}`
                                  : `Collapse details for ${exp.company}`
                              }
                              className="no-print inline-flex items-center justify-center w-8 h-8 rounded-md text-[#6B6A65] hover:text-[#141413] hover:bg-[#F3F2EE] transition-colors"
                            >
                              {isCollapsed ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronUp className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {!isCollapsed && (
                          <>
                            <ul className="space-y-2 text-sm text-[#575652] leading-relaxed mt-4">
                              {exp.highlights.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2.5">
                                  <span
                                    className="font-mono-tabular text-[11px] text-[#9A9890] mt-1 shrink-0"
                                    aria-hidden="true"
                                  >
                                    —
                                  </span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>

                            {exp.tools.length > 0 && (
                              <p className="mt-4 pt-3 border-t border-[#F0EFEA] text-xs text-[#6B6A65]">
                                Tools used: {exp.tools.join(' · ')}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                      </article>
                    </StaggerRevealItem>
                  );
                })}
              </div>
            </div>

            {/* Education */}
            <div>
              <div className="pb-3 mb-6 border-b border-[#DFDED8]">
                <h3 className="text-sm font-semibold text-[#141413]">Education</h3>
              </div>

              <div className="space-y-5">
                {education.map((edu) => (
                  <article
                    key={edu.id}
                    className="bg-white border border-[#E5E5E0] rounded-xl p-5 sm:p-6 print-break-avoid"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                      <h4 className="font-editorial text-2xl font-semibold text-[#141413]">
                        {edu.institution}
                      </h4>
                      <span className="font-mono-tabular text-xs text-[#6B6A65] shrink-0">
                        {edu.period}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-[#2C2C2A] mb-3">{edu.degree}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#575652] mb-4">
                      <span className="font-mono-tabular font-medium text-[#141413]">
                        GPA {edu.gpa}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{edu.honours}</span>
                    </div>

                    <p className="text-xs text-[#575652] leading-relaxed">
                      <span className="font-semibold text-[#141413]">Relevant Coursework: </span>
                      {edu.coursework.join(' · ')}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            {/* Independent Fabrication & Real Estate Services */}
            <div>
              <div className="pb-3 mb-6 border-b border-[#DFDED8]">
                <h3 className="text-sm font-semibold text-[#141413]">
                  Design-Build Fabrication &amp; Property Advisory
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {ventures.map((venture) => (
                  <article
                    key={venture.id}
                    className="bg-white border border-[#E5E5E0] rounded-xl p-5 print-break-avoid"
                  >
                    <p className="text-xs text-[#6B6A65] mb-1">{venture.category}</p>
                    <h4 className="font-editorial text-xl font-semibold text-[#141413] mb-2">
                      {venture.title}
                    </h4>
                    <p className="text-sm text-[#575652] leading-relaxed mb-3">
                      {venture.summary}
                    </p>
                    <p className="text-xs text-[#6B6A65]">{venture.tools.join(' · ')}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Interactive Skills Matrix & Community Leadership */}
          <div className="lg:col-span-4 space-y-10">
            {/* Interactive Software & Technical Skills Matrix */}
            <div className="bg-white border border-[#E5E5E0] rounded-xl p-6 print-break-avoid">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-semibold text-[#141413]">
                  Software &amp; Technical Skills
                </h3>
                {activeSkill && (
                  <button
                    type="button"
                    onClick={onClearSkill}
                    className="no-print text-xs font-medium text-[#1D4ED8] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <p className="text-xs text-[#6B6A65] mb-6 no-print">
                Select any tool to highlight matching firms and filter portfolio projects.
              </p>

              <div className="space-y-5">
                {skillGroups.map((group) => (
                  <div key={group.id} className="pb-4 border-b border-[#F0EFEA] last:border-b-0 last:pb-0">
                    <h4 className="text-xs font-medium text-[#6B6A65] mb-2.5">
                      {group.category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((skill) => {
                        const isSelected = activeSkill === skill;
                        return (
                          <button
                            key={skill}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => onToggleSkill(skill)}
                            className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap ${
                              isSelected
                                ? 'bg-[#1D4ED8] text-white'
                                : 'bg-[#F3F2EE] text-[#2C2C2A] hover:bg-[#E5E4DC]'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Service */}
            <div className="bg-white border border-[#E5E5E0] rounded-xl p-6 print-break-avoid">
              <h3 className="text-sm font-semibold text-[#141413] pb-3 mb-5 border-b border-[#F0EFEA]">
                Community Service &amp; Leadership
              </h3>

              <div className="space-y-6">
                {communityService.map((item) => (
                  <article key={item.id}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-[#141413]">
                        {item.organization}
                      </h4>
                      <span className="font-mono-tabular text-[11px] text-[#6B6A65] shrink-0">
                        {item.period}
                      </span>
                    </div>
                    <p className="text-xs text-[#575652] mb-2">
                      {item.role} · {item.location}
                    </p>
                    <ul className="space-y-1 text-xs text-[#575652] leading-relaxed">
                      {item.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-16 lg:mt-20">
        <InkDivider />
      </div>
    </section>
  );
}
