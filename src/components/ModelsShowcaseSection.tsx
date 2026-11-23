import { Box, Camera, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Locale, UI_TEXT } from '../i18n/translations';
import { Model3DItem } from '../types/portfolio';
import { ArchitecturalImage } from './ArchitecturalImage';
import { InkDivider, InkUnderline } from './SketchMotion';

const ModelViewer3D = lazy(() =>
  import('./ModelViewer3D').then((m) => ({ default: m.ModelViewer3D }))
);

interface ModelsShowcaseSectionProps {
  models: Model3DItem[];
  locale: Locale;
}

export function ModelsShowcaseSection({ models, locale }: ModelsShowcaseSectionProps) {
  const t = UI_TEXT[locale].models;
  const sectionRef = useRef<HTMLElement>(null);
  const [hasEnteredProximity, setHasEnteredProximity] = useState(false);
  const [isViewportVisible, setIsViewportVisible] = useState(false);
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [stageTab, setStageTab] = useState<'3d' | 'photos'>('3d');
  const [stagePhotoIndex, setStagePhotoIndex] = useState(0);
  const [photoLightboxIndex, setPhotoLightboxIndex] = useState<number | null>(null);

  // Automatically boot 3D viewer as visitor approaches section, and pause rendering when scrolled away
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setHasEnteredProximity(true);
      setIsViewportVisible(true);
      return;
    }

    const proximityObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEnteredProximity(true);
          proximityObserver.disconnect();
        }
      },
      { rootMargin: '300px 0px', threshold: 0.01 }
    );

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        setIsViewportVisible(visible);
      },
      { rootMargin: '80px 0px', threshold: 0.01 }
    );

    proximityObserver.observe(el);
    visibilityObserver.observe(el);

    return () => {
      proximityObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  const safeModelIndex =
    models.length > 0 ? Math.min(selectedModelIndex, models.length - 1) : 0;
  const activeModel = models[safeModelIndex] ?? null;

  const variants = activeModel?.variants ?? [];
  const safeVariantIndex =
    variants.length > 0 ? Math.min(selectedVariantIndex, variants.length - 1) : 0;
  const activeVariant = variants[safeVariantIndex] ?? null;

  const safeStagePhotoIndex =
    activeModel && activeModel.photos.length > 0
      ? Math.min(stagePhotoIndex, activeModel.photos.length - 1)
      : 0;
  const currentStagePhoto = activeModel?.photos[safeStagePhotoIndex] ?? null;

  useEffect(() => {
    setPhotoLightboxIndex(null);
    setStagePhotoIndex(0);
    setSelectedVariantIndex(0);
    setStageTab('3d');
  }, [activeModel?.id]);

  useEffect(() => {
    if (photoLightboxIndex === null || !activeModel || activeModel.photos.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPhotoLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setPhotoLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % activeModel.photos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setPhotoLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + activeModel.photos.length) % activeModel.photos.length
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [photoLightboxIndex, activeModel]);

  const activePhoto =
    activeModel && photoLightboxIndex !== null
      ? activeModel.photos[photoLightboxIndex] ?? null
      : null;

  return (
    <section
      ref={sectionRef}
      id="models"
      className="pt-14 pb-16 lg:pt-16 lg:pb-20 bg-transparent scroll-mt-20"
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <p className="font-mono-tabular text-xs text-[#6B6A65] mb-2">{t.eyebrow}</p>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold tracking-tight text-[#141413]">
              {t.heading}
            </h2>
            <InkUnderline />
            <p className="mt-3 text-sm text-[#575652] max-w-2xl">{t.subtitle}</p>
          </div>

          <span className="font-mono-tabular text-xs text-[#6B6A65] shrink-0">
            {String(models.length).padStart(2, '0')}{' '}
            {models.length === 1 ? t.modelSingular : t.modelPlural}
          </span>
        </div>

        {/* Model Selector Pills */}
        {models.length > 0 && (
          <div
            role="tablist"
            aria-label={t.selectorAria}
            className="flex flex-wrap items-center gap-2 mb-6 no-print"
          >
            {models.map((model, idx) => {
              const active = idx === safeModelIndex;
              const code = `MD. ${String(idx + 1).padStart(2, '0')}`;
              return (
                <button
                  key={model.id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => setSelectedModelIndex(idx)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-[2px] border transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#141413] text-white border-[#141413]'
                      : 'bg-white text-[#2C2C2A] border-[#D6D4CC] hover:border-[#9E3B2E]'
                  }`}
                >
                  <span
                    className={`font-mono-tabular text-[11px] ${
                      active ? 'text-[#E6A79C]' : 'text-[#6B6A65]'
                    }`}
                  >
                    {code}
                  </span>
                  <span>{model.title}</span>
                  <span
                    className={`font-mono-tabular text-[11px] ${
                      active ? 'text-white/75' : 'text-[#8A8882]'
                    }`}
                  >
                    {model.year}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!activeModel ? (
          <div className="py-16 px-6 text-center bg-white border border-[#D6D4CC] rounded-[2px]">
            <Box className="w-8 h-8 text-[#8A8882] mx-auto mb-3" aria-hidden="true" />
            <p className="font-editorial text-2xl text-[#141413] mb-1">{t.emptyTitle}</p>
            <p className="text-sm text-[#575652]">{t.emptyHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Tabbed 3D Viewport / Curated Physical Model Photos */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 no-print">
                <div
                  role="tablist"
                  aria-label={t.viewModeAria}
                  className="inline-flex items-center gap-1 p-1 bg-[#EFECE6] border border-[#D6D4CC] rounded-[2px]"
                >
                  <button
                    role="tab"
                    type="button"
                    aria-selected={stageTab === '3d'}
                    onClick={() => setStageTab('3d')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-[1px] transition-colors ${
                      stageTab === '3d'
                        ? 'bg-white text-[#141413] shadow-2xs'
                        : 'text-[#575652] hover:text-[#141413]'
                    }`}
                  >
                    <Box className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.tab3d}
                  </button>
                  <button
                    role="tab"
                    type="button"
                    aria-selected={stageTab === 'photos'}
                    onClick={() => setStageTab('photos')}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-[1px] transition-colors ${
                      stageTab === 'photos'
                        ? 'bg-white text-[#141413] shadow-2xs'
                        : 'text-[#575652] hover:text-[#141413]'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.tabPhotos(activeModel.photos.length)}
                  </button>
                </div>

                {stageTab === 'photos' && currentStagePhoto && (
                  <button
                    type="button"
                    onClick={() => setPhotoLightboxIndex(safeStagePhotoIndex)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#141413] bg-white border border-[#D6D4CC] hover:border-[#9E3B2E] hover:text-[#9E3B2E] rounded-[2px] transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.expandPhoto}
                  </button>
                )}
              </div>

              {variants.length > 0 && (
                <div className="bg-white border border-[#D6D4CC] rounded-[2px] px-3 py-2.5 space-y-2 no-print">
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono-tabular uppercase tracking-wider text-[#6B6A65]">
                      {t.structuralHeading(variants.length)}
                    </span>
                    {activeVariant && (
                      <span className="font-mono-tabular text-[#9E3B2E] truncate">
                        {activeVariant.systemType}
                      </span>
                    )}
                  </div>
                  <div
                    role="tablist"
                    aria-label={t.selectVariantAria}
                    className="flex flex-wrap gap-1.5"
                  >
                    {variants.map((variant, vIdx) => {
                      const active = vIdx === safeVariantIndex && stageTab === '3d';
                      return (
                        <button
                          key={variant.id}
                          role="tab"
                          type="button"
                          aria-selected={active}
                          onClick={() => {
                            setSelectedVariantIndex(vIdx);
                            setStageTab('3d');
                          }}
                          className={`px-2.5 py-1 text-xs font-medium rounded-[2px] border transition-colors ${
                            active
                              ? 'bg-[#9E3B2E] text-white border-[#9E3B2E]'
                              : 'bg-[#F7F6F2] text-[#2C2C2A] border-[#D6D4CC] hover:border-[#9E3B2E]/60'
                          }`}
                        >
                          {String(vIdx + 1).padStart(2, '0')} · {variant.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {stageTab === '3d' ? (
                <div className="flex-1 flex">
                  {hasEnteredProximity ? (
                    <Suspense
                      fallback={
                        <div className="relative flex flex-col items-center justify-center w-full min-h-[440px] sm:min-h-[520px] bg-[#F5F4EF] border border-[#D6D4CC] rounded-[2px] overflow-hidden px-6 text-center">
                          {activeModel.photos[0] && (
                            <ArchitecturalImage
                              src={activeModel.photos[0].imageUrl}
                              alt={activeModel.title}
                              variant="thumbnail"
                              fit="cover"
                              className="absolute inset-0 w-full h-full opacity-25"
                            />
                          )}
                          <div className="relative z-10 px-5 py-4 bg-[#FAFAF8]/92 border border-[#D6D4CC] rounded-[2px]">
                            <Box className="w-6 h-6 text-[#9E3B2E] mx-auto mb-2" aria-hidden="true" />
                            <p className="font-mono-tabular text-xs text-[#141413]">
                              {t.initializing3d}
                            </p>
                          </div>
                        </div>
                      }
                    >
                      <ModelViewer3D
                        modelUrl={activeVariant?.modelUrl ?? activeModel.modelUrl}
                        format={activeVariant?.format ?? activeModel.format}
                        title={
                          activeVariant
                            ? `${activeModel.title} — ${activeVariant.label}`
                            : activeModel.title
                        }
                        locale={locale}
                        posterImageUrl={activeModel.photos[0]?.imageUrl}
                        onSwitchToPhotos={
                          activeModel.photos.length > 0 ? () => setStageTab('photos') : undefined
                        }
                        isVisible={isViewportVisible}
                      />
                    </Suspense>
                  ) : (
                    <div className="relative flex flex-col items-center justify-center w-full min-h-[440px] sm:min-h-[520px] bg-[#F5F4EF] border border-[#D6D4CC] rounded-[2px] overflow-hidden px-6 text-center">
                      {activeModel.photos[0] && (
                        <ArchitecturalImage
                          src={activeModel.photos[0].imageUrl}
                          alt={activeModel.title}
                          variant="thumbnail"
                          fit="cover"
                          className="absolute inset-0 w-full h-full opacity-35"
                        />
                      )}
                      <div className="relative z-10 px-5 py-4 bg-[#FAFAF8]/92 border border-[#D6D4CC] rounded-[2px]">
                        <Box className="w-6 h-6 text-[#9E3B2E] mx-auto mb-2" aria-hidden="true" />
                        <p className="font-mono-tabular text-xs text-[#141413] mb-2">
                          {t.scrollToLoad}
                        </p>
                        {activeModel.photos.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setStageTab('photos')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono-tabular uppercase tracking-wider text-[#141413] bg-white border border-[#D6D4CC] hover:border-[#9E3B2E] hover:text-[#9E3B2E] rounded-[2px] transition-colors"
                          >
                            <Camera className="w-3 h-3" aria-hidden="true" />
                            {t.viewPhotosFallback}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : !currentStagePhoto ? (
                <div className="flex-1 min-h-[440px] sm:min-h-[520px] flex flex-col items-center justify-center text-center bg-white border border-[#D6D4CC] rounded-[2px] p-8">
                  <Camera className="w-8 h-8 text-[#9C9A92] mb-2" aria-hidden="true" />
                  <p className="font-editorial text-xl text-[#141413] mb-1">{t.noPhotosTitle}</p>
                  <p className="text-xs text-[#6B6A65] max-w-sm">{t.noPhotosHint}</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col bg-white border border-[#D6D4CC] rounded-[2px] overflow-hidden">
                  <div className="relative h-[380px] sm:h-[440px] bg-[#F5F4EF] flex items-center justify-center p-3">
                    <button
                      type="button"
                      onClick={() => setPhotoLightboxIndex(safeStagePhotoIndex)}
                      aria-label={currentStagePhoto.caption}
                      className="w-full h-full cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E3B2E]"
                    >
                      <ArchitecturalImage
                        src={currentStagePhoto.imageUrl}
                        alt={currentStagePhoto.caption}
                        title={currentStagePhoto.caption}
                        fit="contain"
                        className="w-full h-full bg-transparent"
                      />
                    </button>

                    {activeModel.photos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setStagePhotoIndex(
                              (safeStagePhotoIndex - 1 + activeModel.photos.length) %
                                activeModel.photos.length
                            )
                          }
                          aria-label={t.prevPhotoAria}
                          className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#141413] border border-[#E5E5E0] shadow-xs transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStagePhotoIndex(
                              (safeStagePhotoIndex + 1) % activeModel.photos.length
                            )
                          }
                          aria-label={t.nextPhotoAria}
                          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#141413] border border-[#E5E5E0] shadow-xs transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="px-4 py-2.5 border-t border-[#E5E5E0] flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium text-[#141413] truncate">
                      {currentStagePhoto.caption}
                    </span>
                    <span className="font-mono-tabular text-[#6B6A65] shrink-0">
                      {safeStagePhotoIndex + 1} / {activeModel.photos.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2 p-3 bg-[#FAFAF8] border-t border-[#D6D4CC]">
                    {activeModel.photos.map((photo, pIdx) => {
                      const active = pIdx === safeStagePhotoIndex;
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setStagePhotoIndex(pIdx)}
                          aria-label={`Select photo ${pIdx + 1}: ${photo.caption}`}
                          aria-current={active ? 'true' : undefined}
                          className={`aspect-[4/3] rounded-[2px] overflow-hidden border transition-all ${
                            active
                              ? 'border-[#9E3B2E] ring-2 ring-[#9E3B2E]/25'
                              : 'border-[#D6D4CC] opacity-75 hover:opacity-100'
                          }`}
                        >
                          <ArchitecturalImage
                            src={photo.imageUrl}
                            alt={photo.caption}
                            fit="cover"
                            variant="thumbnail"
                            className="w-full h-full"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Model Dossier & Companion Photos */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-white border border-[#D6D4CC] rounded-[2px] p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#F3F2EE] border border-[#D6D4CC] font-mono-tabular text-[11px] font-medium text-[#141413]">
                    MD. {String(safeModelIndex + 1).padStart(2, '0')} · {activeModel.studioOrContext}
                  </span>
                  <span className="font-mono-tabular text-xs font-medium text-[#6B6A65]">
                    {activeModel.year}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-editorial text-2xl sm:text-[26px] font-semibold text-[#141413] leading-snug">
                    {activeModel.title}
                  </h3>
                  <p className="text-xs font-medium text-[#9E3B2E]">{activeModel.subtitle}</p>
                </div>

                <dl className="grid grid-cols-3 gap-3 py-3 border-y border-[#ECEAE2] text-xs">
                  <div className="col-span-2 min-w-0">
                    <dt className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#8A8882] mb-0.5">
                      {t.yearOfStudyLabel}
                    </dt>
                    <dd className="font-medium text-[#141413] truncate">
                      {activeModel.studioOrContext}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#8A8882] mb-0.5">
                      {t.yearLabel}
                    </dt>
                    <dd className="font-mono-tabular font-medium text-[#141413]">
                      {activeModel.year}
                    </dd>
                  </div>
                  <div className="col-span-3">
                    <dt className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#8A8882] mb-0.5">
                      {t.scaleLabel}
                    </dt>
                    <dd className="font-mono-tabular text-[#575652]">{activeModel.scale}</dd>
                  </div>
                </dl>

                <p className="text-sm text-[#575652] leading-relaxed">{activeModel.description}</p>

                {activeVariant && (
                  <div className="p-3.5 bg-[#F7F6F2] border border-[#D6D4CC] rounded-[2px] space-y-1">
                    <p className="text-[10px] font-mono-tabular uppercase tracking-wider text-[#9E3B2E]">
                      {t.activeVariantPrefix} · {activeVariant.systemType}
                    </p>
                    <p className="text-sm font-semibold text-[#141413]">{activeVariant.label}</p>
                    <p className="text-xs text-[#575652] leading-relaxed">
                      {activeVariant.description}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap gap-1.5">
                  {activeModel.software.map((tool) => (
                    <span
                      key={tool}
                      className="px-2 py-0.5 text-[11px] font-mono-tabular font-medium bg-[#F3F2EE] border border-[#E2E0D8] text-[#2C2C2A] rounded-[2px]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Companion Photos Panel */}
              <div className="bg-white border border-[#D6D4CC] rounded-[2px] p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#141413] flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#9E3B2E]" aria-hidden="true" />
                    {t.companionHeading}
                  </h4>
                  <span className="font-mono-tabular text-xs text-[#6B6A65]">
                    {activeModel.photos.length}{' '}
                    {activeModel.photos.length === 1 ? t.photoSingular : t.photoPlural}
                  </span>
                </div>

                {activeModel.photos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-[#D6D4CC] bg-[#FAF9F6] rounded-[2px] p-6 min-h-[180px]">
                    <Camera className="w-6 h-6 text-[#9C9A92] mb-2" aria-hidden="true" />
                    <p className="text-xs font-medium text-[#2C2C2A] mb-1">{t.noCompanionTitle}</p>
                    <p className="text-xs text-[#6B6A65] max-w-xs leading-relaxed">
                      {t.noCompanionHint}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {activeModel.photos.map((photo, pIdx) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          setStagePhotoIndex(pIdx);
                          setPhotoLightboxIndex(pIdx);
                        }}
                        className="group text-left bg-[#FAF9F6] border border-[#D6D4CC] rounded-[2px] overflow-hidden hover:border-[#9E3B2E] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9E3B2E]"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                          <ArchitecturalImage
                            src={photo.imageUrl}
                            alt={photo.caption}
                            title={photo.caption}
                            fit="cover"
                            variant="thumbnail"
                            className="w-full h-full"
                            imgClassName="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <p className="px-2.5 py-2 text-[11px] text-[#575652] truncate">
                          {photo.caption}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 mt-16 lg:mt-20">
        <InkDivider />
      </div>

      {/* Companion Photo Lightbox */}
      {activePhoto && photoLightboxIndex !== null && activeModel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Model photo: ${activePhoto.caption}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/85 backdrop-blur-xs p-4 sm:p-8 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPhotoLightboxIndex(null);
          }}
        >
          <div className="w-full max-w-[900px] max-h-[90vh] bg-white border border-[#D6D4CC] rounded-[2px] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-5 py-3.5 border-b border-[#D6D4CC] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono-tabular text-xs text-[#6B6A65] truncate">
                  {activeModel.title}
                </p>
                <h3 className="font-editorial text-xl font-semibold text-[#141413] truncate">
                  {activePhoto.caption}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {activeModel.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoLightboxIndex(
                          (photoLightboxIndex - 1 + activeModel.photos.length) %
                            activeModel.photos.length
                        )
                      }
                      aria-label={t.prevPhotoAria}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#141413] hover:bg-[#F3F2EE]"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoLightboxIndex((photoLightboxIndex + 1) % activeModel.photos.length)
                      }
                      aria-label={t.nextPhotoAria}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#141413] hover:bg-[#F3F2EE]"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setPhotoLightboxIndex(null)}
                  aria-label={t.closePhotoViewerAria}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[2px] text-[#575652] hover:text-[#141413] hover:bg-[#F3F2EE]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#F7F6F2] p-4 sm:p-6 flex items-center justify-center">
              <ArchitecturalImage
                src={activePhoto.imageUrl}
                alt={activePhoto.caption}
                fit="contain"
                className="w-full h-[60vh] bg-white rounded-[2px] p-2 border border-[#D6D4CC]"
              />
            </div>

            <div className="px-5 py-3 border-t border-[#D6D4CC] flex items-center justify-between text-xs text-[#6B6A65]">
              <span>{activePhoto.caption}</span>
              <span className="font-mono-tabular">
                {photoLightboxIndex + 1} / {activeModel.photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
