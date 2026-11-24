import { Box, Check, ChevronLeft, ChevronRight, Copy, X, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { PointerEvent, useEffect, useRef, useState } from 'react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { PortfolioProject } from '../types/portfolio';
import { buildProjectDeepLinkUrl } from '../utils/portfolioLogic';
import { ArchitecturalImage } from './ArchitecturalImage';
import { ARCHITECTURAL_EASE, SHEET_TRANSITION, useBodyScrollLock } from './SketchMotion';

interface ProjectLightboxProps {
  project: PortfolioProject | null;
  locale: Locale;
  onClose: () => void;
  projects?: PortfolioProject[];
  onSelectProject?: (project: PortfolioProject) => void;
  linkedModelId?: string | null;
  onInspect3DModel?: (modelId: string) => void;
}

export function ProjectLightbox({
  project,
  locale,
  onClose,
  projects,
  onSelectProject,
  linkedModelId,
  onInspect3DModel,
}: ProjectLightboxProps) {
  const [plateIndex, setPlateIndex] = useState(0);
  const [zoom, setZoom] = useState<1 | 1.5 | 2>(1);
  const [copiedProjectLink, setCopiedProjectLink] = useState(false);
  const [isPanning, setIsPanning] = useState(false);

  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const panStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const t = UI_TEXT[locale].lightbox;
  const catNames = UI_TEXT[locale].works.categories;

  useBodyScrollLock(Boolean(project));

  useEffect(() => {
    setPlateIndex(0);
    setZoom(1);
    setCopiedProjectLink(false);
    setIsPanning(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && project.plates.length > 1) {
        setPlateIndex((prev) => (prev + 1) % project.plates.length);
        setZoom(1);
      } else if (e.key === 'ArrowLeft' && project.plates.length > 1) {
        setPlateIndex((prev) => (prev - 1 + project.plates.length) % project.plates.length);
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  const activePlate = project ? project.plates[plateIndex] : undefined;

  const currentProjectIndex =
    project && projects ? projects.findIndex((p) => p.id === project.id) : -1;
  const hasProjectCycling = Boolean(
    projects && projects.length > 1 && onSelectProject && currentProjectIndex >= 0
  );
  const prevProject =
    hasProjectCycling && projects
      ? projects[(currentProjectIndex - 1 + projects.length) % projects.length]
      : null;
  const nextProject =
    hasProjectCycling && projects ? projects[(currentProjectIndex + 1) % projects.length] : null;

  const cycleZoom = () => {
    setZoom((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1));
  };

  const handleCopyDeepLink = async () => {
    if (!project || typeof window === 'undefined') return;
    const url = buildProjectDeepLinkUrl(window.location.href, project.id);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback ignored in headless environments
    }
    setCopiedProjectLink(true);
    window.setTimeout(() => setCopiedProjectLink(false), 2400);
  };

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || !canvasViewportRef.current) return;
    if (e.button !== 0) return;
    panStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: canvasViewportRef.current.scrollLeft,
      scrollTop: canvasViewportRef.current.scrollTop,
    };
    setIsPanning(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current.active || !canvasViewportRef.current) return;
    const dx = e.clientX - panStateRef.current.startX;
    const dy = e.clientY - panStateRef.current.startY;
    canvasViewportRef.current.scrollLeft = panStateRef.current.scrollLeft - dx;
    canvasViewportRef.current.scrollTop = panStateRef.current.scrollTop - dy;
  };

  const stopPanning = (e: PointerEvent<HTMLDivElement>) => {
    if (!panStateRef.current.active) return;
    panStateRef.current.active = false;
    setIsPanning(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} ${t.ariaSuffix}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: ARCHITECTURAL_EASE }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/85 backdrop-blur-xs p-3 sm:p-6 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="project-lightbox-panel"
            initial={{ opacity: 0, scale: 0.985, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.985, y: 8 }}
            transition={SHEET_TRANSITION}
            className="relative w-full max-w-[1320px] max-h-[92vh] bg-[#FAFAF8] border border-[#D6D4CC] rounded-[2px] overflow-hidden flex flex-col lg:flex-row shadow-2xl"
          >
            {/* Left/Main High-Res Drawing Plate Viewport */}
            <div className="lg:flex-1 min-w-0 flex flex-col bg-[#F1F0EB] min-h-[320px] lg:min-h-[680px] max-h-[55vh] lg:max-h-[92vh]">
              {/* Plate Toolbar */}
              <div className="flex items-center justify-between gap-4 px-5 py-3 bg-white border-b border-[#D6D4CC]">
                <div className="flex items-center gap-2 text-xs text-[#575652] min-w-0">
                  <span className="font-mono-tabular font-medium text-[#141413] shrink-0">
                    {activePlate ? activePlate.plateNumber : t.noPlate}
                  </span>
                  {activePlate && (
                    <>
                      <span aria-hidden="true">/</span>
                      <span className="truncate">{activePlate.caption}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {activePlate && (
                    <button
                      type="button"
                      onClick={cycleZoom}
                      aria-label={zoom === 2 ? t.resetZoomAria : t.zoomInAria}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#141413] bg-[#F3F2EE] hover:bg-[#E7E5DE] rounded-[2px] transition-colors whitespace-nowrap"
                    >
                      {zoom > 1 ? (
                        <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                      <span className="font-mono-tabular">{Math.round(zoom * 100)}%</span>
                    </button>
                  )}

                  {project.plates.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setPlateIndex(
                            (prev) => (prev - 1 + project.plates.length) % project.plates.length
                          );
                          setZoom(1);
                        }}
                        aria-label={t.prevPlateAria}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-[2px] text-[#141413] hover:bg-[#EFECE6] transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPlateIndex((prev) => (prev + 1) % project.plates.length);
                          setZoom(1);
                        }}
                        aria-label={t.nextPlateAria}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-[2px] text-[#141413] hover:bg-[#EFECE6] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Scrollable Zoomable & Drag-Pannable Drawing Canvas */}
              <div
                ref={canvasViewportRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={stopPanning}
                onPointerCancel={stopPanning}
                className={`flex-1 overflow-auto p-4 sm:p-5 flex select-none ${
                  zoom > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
                }`}
              >
                <div
                  className="m-auto transition-all duration-200"
                  style={{
                    width: zoom === 1 ? '100%' : `${zoom * 100}%`,
                    maxWidth: zoom === 1 ? '860px' : 'none',
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activePlate?.id || `${project.id}-empty`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.16, ease: ARCHITECTURAL_EASE }}
                    >
                      <ArchitecturalImage
                        src={activePlate?.imageUrl}
                        alt={
                          activePlate ? `${project.title} — ${activePlate.caption}` : project.title
                        }
                        title={project.title}
                        plateNumber={activePlate?.plateNumber}
                        draggable={false}
                        fit="contain"
                        className={`w-full bg-white border border-[#D6D4CC] rounded-[2px] p-2.5 ${
                          zoom === 1 ? 'h-[42vh] lg:h-[66vh]' : 'min-h-[68vh]'
                        }`}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Multi-Plate Thumbnail Switcher */}
              {project.plates.length > 1 && (
                <div className="px-5 py-3 bg-white border-t border-[#D6D4CC] flex items-center gap-2.5 overflow-x-auto">
                  {project.plates.map((plate, idx) => {
                    const isSelected = idx === plateIndex;
                    return (
                      <button
                        key={plate.id}
                        type="button"
                        onClick={() => {
                          setPlateIndex(idx);
                          setZoom(1);
                        }}
                        aria-label={t.thumbAria(plate.plateNumber, plate.caption)}
                        aria-current={isSelected ? 'true' : undefined}
                        className={`relative shrink-0 w-16 h-12 rounded-[2px] overflow-hidden border transition-all ${
                          isSelected
                            ? 'border-[#9E3B2E] ring-2 ring-[#9E3B2E]/25'
                            : 'border-[#D6D4CC] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <ArchitecturalImage
                          src={plate.imageUrl}
                          alt={plate.caption}
                          fit="cover"
                          variant="thumbnail"
                          className="w-full h-full"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Architectural Case Study Specifications Sidebar */}
            <aside className="lg:w-[390px] xl:w-[420px] shrink-0 bg-[#FAFAF8] border-t lg:border-t-0 lg:border-l border-[#D6D4CC] flex flex-col max-h-[40vh] lg:max-h-[92vh]">
              <div className="flex-1 overflow-y-auto p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="font-mono-tabular text-xs text-[#6B6A65] mb-1">
                      {project.studioOrContext} · {project.year}
                    </p>
                    <h3 className="font-editorial text-3xl font-semibold text-[#141413] leading-tight">
                      {project.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label={t.closeAria}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#575652] hover:text-[#141413] hover:bg-[#EFECE6] transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm font-medium text-[#2C2C2A] mb-4">{project.subtitle}</p>

                {/* Utility Action Bar: 3D Model Link & Shareable Deep-Link */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {linkedModelId && onInspect3DModel && (
                    <button
                      type="button"
                      onClick={() => onInspect3DModel(linkedModelId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#9E3B2E] hover:bg-[#7F2D22] rounded-[2px] transition-colors whitespace-nowrap"
                    >
                      <Box className="w-3.5 h-3.5" aria-hidden="true" />
                      {t.inspect3dModel}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyDeepLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#141413] bg-white border border-[#D6D4CC] hover:border-[#9E3B2E]/60 rounded-[2px] transition-colors whitespace-nowrap"
                  >
                    {copiedProjectLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#5A6E58]" aria-hidden="true" />
                        {t.projectLinkCopied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        {t.copyProjectLink}
                      </>
                    )}
                  </button>
                </div>

                {/* Technical Metadata Grid */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 border-y border-[#E5E5E0] text-xs mb-5">
                  <div>
                    <dt className="text-[#6B6A65] mb-0.5">{t.categoryLabel}</dt>
                    <dd className="font-medium text-[#141413]">
                      {catNames[project.category] ?? project.category}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6B6A65] mb-0.5">{t.scaleLabel}</dt>
                    <dd className="font-mono-tabular font-medium text-[#141413]">
                      {project.scale}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6B6A65] mb-0.5">{t.locationLabel}</dt>
                    <dd className="font-medium text-[#141413]">{project.location}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6B6A65] mb-0.5">{t.toolsLabel}</dt>
                    <dd className="font-medium text-[#141413]">{project.tools.join(', ')}</dd>
                  </div>
                </dl>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[#141413] mb-1.5">
                      {t.thesisHeading}
                    </h4>
                    <p className="text-sm text-[#575652] leading-relaxed">{project.description}</p>
                  </div>

                  {project.highlights.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[#141413] mb-2">
                        {t.highlightsHeading}
                      </h4>
                      <ul className="space-y-2 text-sm text-[#575652]">
                        {project.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="font-mono-tabular text-xs text-[#8A8882] mt-0.5">
                              0{idx + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-3 bg-white border-t border-[#E5E5E0] flex flex-col gap-2 text-xs text-[#6B6A65] shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{zoom > 1 ? t.panHint : t.browseHint}</span>
                  <span className="font-mono-tabular shrink-0">
                    {project.plates.length > 0
                      ? `${plateIndex + 1} / ${project.plates.length}`
                      : '0 / 0'}
                  </span>
                </div>

                {hasProjectCycling && prevProject && nextProject && onSelectProject && (
                  <div className="pt-2 border-t border-[#F0EFEA] flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectProject(prevProject)}
                      className="inline-flex items-center gap-1 font-medium text-[#575652] hover:text-[#9E3B2E] transition-colors truncate"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      {t.prevProject}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProject(nextProject)}
                      className="inline-flex items-center gap-1 font-medium text-[#575652] hover:text-[#9E3B2E] transition-colors truncate"
                    >
                      {t.nextProject}
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
